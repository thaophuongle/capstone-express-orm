import express from "express";
import userRouter from "./userRouter.js";
import postRouter from "./postRouter.js";

const rootRouter = express.Router();

rootRouter.use("/user", userRouter);
rootRouter.use("/post", postRouter);

export default rootRouter;
