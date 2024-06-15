import mongoose from "mongoose";
//paganate used - $or, $and and many more
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({

    videoFile: {
        type:String,
        required: true
    },
    tittle: {
        type:String,
        required: true
    },
    thumbnail: {
        type:String,
        required: true
    },
    description: {
        type:String,
        required: true
    },
    duration:{
        type:Number,
        required: true
    },
    views: {
        type:Number,
        required: true,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, {timestamps: true});

//plugin - used for adding new packages
mongoose.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);