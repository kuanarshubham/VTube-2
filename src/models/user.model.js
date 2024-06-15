import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({

    userName: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
        trim: true,
        index: true
    },

    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
        trim: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    avatar: {
        type: String,
        required: true
    },

    coverImage: {
        type: String
    },

    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],

    password: {
        type: String,
        required: true
    },

    refreshToken: {
        type: String,
    }


}, { timestamps: true });

//pre hoook is used to do processing on data before event
userSchema.pre("save", async function (next) {
    if (!(this.isModified("password"))) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//.method is used to created/inject new methods
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
    //returns true or false
}

//jwt - bearer token, kinda like key to enter the site/user
userSchema.methods.generateAcessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName
    }, process.env.ACESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRY
        });
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id

    }, process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        });
}

export const User = mongoose.model("User", userSchema);