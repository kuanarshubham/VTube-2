import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {cloudinaryUploder} from "../utils/clodinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

//cookies to send --> we need option
//these option denies us to amke any changes to the cookies from backend and allows only from frontend
const option = {
    http: true,
    secure: true
}

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        
        //made-up methods are called
        const accessToken = await user.generateAcessToken();
        const refreshToken = await user.generateRefreshToken();

        //update the refresh token
        user.refreshToken = refreshToken;

        //save the db without any validation of password, email & other feilds
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    }
    catch(err){
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    /*
    STEPS:
    get user deatil from frontend
    fullname, email, username, password, avatar
    validation for all - non-empty, etc
    check if user already exist - useranme, email both
    check for img/avatar(madatory)
    uplaoded cloudinary url
    create user obj in db
    remove passowrd and refesh-to-f from response
    check for user creation
    return res
    */ 

    //get user detail
    const {fullName, email, userName, password} = req.body;

    //validate if any one is empty
    if([fullName, email, userName, password].some((feild) => feild?.trim() === "")){
        throw new ApiError(400, "All feilds are required");
    }

    //to check if another user exist 
    const exisitedUser = await User.findOne({
        $or: [{email}, {userName}]
    });

    if(exisitedUser) {throw new ApiError(409, "Already existing username or email");}


    //checking files like avatar and cover Image as i/p from user
    const localFilePathAvatar = req.files?.avatar[0]?.path;
    var localFilePathCoverImage;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght>0){localFilePathCoverImage = req.files.coverImage[0].path;}

    if(!localFilePathAvatar) {throw new ApiError(409, "Avatar requried");}


    //upload the files to cloudinary
    const responseAvatar = await cloudinaryUploder(localFilePathAvatar);
    const responseCoverImage = await cloudinaryUploder(localFilePathCoverImage);

    if(!responseAvatar){throw new ApiError(409, "Avatar required");}


    //creating a new user
    const user = await User.create({
        fullName,
        avatar: responseAvatar.url,
        coverImage: responseCoverImage?.url || "",
        email,
        password,
        userName: userName
    });


    //finding the user from DB and selcting the feilds which are to be sent
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //checking if recent made user exist
    if(!createdUser){throw new ApiError(500, "User not formed");}

    //sending the response
    return res.status(201).json(new ApiResponse(201, createdUser, "New User created sucessfully"));

});

const loginUser = asyncHandler(async(req, res) => {
    /*
    req body fetch email/username and password
    .findOne(username/email)
    if not-found return username/email not available
    validate for password 
    if invalid return password is incorrect
    generate a acess and refesh token
    send token as secure cookies
    update to the database
    */

    const {userName, email, password} = req.body;

    if(!userName && !email){
        throw new ApiError(400, "Username/Email not provided")
    }

    
    const user = await User.findOne({
        $or: [{userName}, {email}]
    });

    if(!user){throw new ApiError(400, "No user found");}

    if(!(user.isPasswordCorrect(password))){throw new ApiError(401, "Password incorrect");}

    //calling the fn
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    //since the above "user" does not have refreshToken, we will call again without the password and resfesh token
    const loggedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );


    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(new ApiResponse(
        200,
        {
            user: loggedUser, 
            refreshToken,
            accessToken
        },
        "User logged in successfully"
    ))

});

const logoutUser = asyncHandler(async(req, res) => {
    /*
    IN MIDDLEWARE:
    get the refsreh token from the cookie 
    jwt.verify it
    decoded token will be gib=ving the _id
    using _id find the user
    in req add another obj - req.user = user
    next()

    IN LOGOUT:
    from req.user we get _id
    find the user 
    update the refresh token as ""(blank)
    logged out successsfully
    */

    const user = req.user;

    await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )


    return res
    .status(200)
    .clearCookie("refreshToken", option)
    .clearCookie("accessToken", option)
    .json(new ApiResponse(200, {}, "User logged out sucessfully"));
});

const refreshAcessToken = asyncHandler(async(req, res) => {
    
    try {
        //refresh token access --> from cookies || from header.authoization
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
    
        if(!token){throw new ApiError(400, "Token not found from request");}
    
        //to get the _id we use jwt.verify
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id);
    
        if(!user){throw new ApiError(400, "Invlaid token");}
    
        if(token !== user.refreshToken){throw new ApiError(400, "Refresh token is expired or used");}
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("acessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new ApiResponse(
            200, 
            {
                accessToken: accessToken, 
                refreshToken: refreshToken
            }, 
            "Refresh token called"
        ));
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong in calling refresh token");
    }
})

export {registerUser, loginUser, logoutUser, refreshAcessToken};