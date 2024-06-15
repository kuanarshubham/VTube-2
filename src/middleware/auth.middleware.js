import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

//if res/req is not used - use " _ "

export const verifyJWT = asyncHandler(async(req, _, next)=> {

    try {
        //case1: dircectly from cookies  //case2: if someone puts the accese token in header from web to mobile
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "");
    
        if(!token){throw new ApiError(401, "Unauthozised request");}
    
        //from token we get the data of user
        const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);
    
        //find user excluding password and refresh token
        const user = await User.findById(decodedToken._id).select("-password, -refreshToken");
    
        if(!user){throw new ApiError(402, "User not found");}
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Inavlid Acess Token");
    }
})