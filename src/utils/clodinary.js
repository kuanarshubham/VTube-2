import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

//configuration - require encryption
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const cloudinaryUploder = async function(localFilePath) {

    try{
        if(!localFilePath) return null;

        //upload the file
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type:  'auto'
        })

        console.log("File url is ", uploadResult.url);

        //deleting the file from server once it gets to cloudinary
        fs.unlinkSync(localFilePath);
        return uploadResult;
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        //unlink - delete the file from the server
        console.log(error);
        return null;
    }
}