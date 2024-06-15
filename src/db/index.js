import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


export const dbConnect = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("DB is connected with the host: ", connectionInstance.connection.host);
    }
    catch(err){
        console.log("src/db/index.js --> Here is the problem");
        process.exit(1);
    }
}