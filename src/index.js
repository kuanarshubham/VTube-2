import 'dotenv/config';
import app from './app.js';
import { dbConnect } from "./db/index.js";

dbConnect()
.then(() => {
    app.on('error', ()=> {
        console.log("Error at listening: ", process.env.PORT || 8000);
    });

    app.listen(process.env.PORT || 8000, (req, res) => {
        console.log("App is listening at Port: ", process.env.PORT || 8000);
    });
})
.catch(() => {
    console.log("Error in connection --> at src/index.js");
})





