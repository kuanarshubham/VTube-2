import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

//cors policy
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

//how will json files will be send
app.use(express.json({
    limit: "16kB"
}));

//the url format decider
app.use(express.urlencoded({
    extended: true,
    limit: "16kB"
}));

//used to store file (pdf, img, ....) on own server
app.use(express.static("public"));

//cookies will be send using this
app.use(cookieParser());



//routes
import userRouter from "./routes/user.route.js";

//routes declaration
//since we have segregated the files route, controller we use .use middleware instead of .get/.post/......
//for url we generally use - /api/version/path
app.use("/api/v1/user", userRouter);

export default app;