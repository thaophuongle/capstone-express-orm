import express from "express";
import {
  getSavedImages,
  getUserImages,
  getUserInfo,
  signIn,
  signUp,
  updateAvatar,
  updateUserInfo,
  uploadImage,
} from "../controllers/userController.js";
import { verifyToken } from "../config/jwt.js";
import { upload } from "../config/upload.js";

const userRouter = express.Router();

//API POST trang đăng ký
userRouter.post("/sign-up", signUp);

//API POST trang đăng nhập
userRouter.post("/sign-in", signIn);

//API GET thông tin user
userRouter.get("/user-info", verifyToken, getUserInfo);

//API GET danh sách ảnh đã lưu theo user id
userRouter.get("/user-images", verifyToken, getUserImages);

//API GET danh sách ảnh đã tạo theo user id
userRouter.get("/saved-images", verifyToken, getSavedImages);

//API POST thêm một ảnh của user
userRouter.post(
  "/upload-image",
  verifyToken,
  upload.single("image"),
  uploadImage
);

//API PUT thông tin cá nhân của user
userRouter.put("/user-info", verifyToken, updateUserInfo);

//API PUT cập nhật avatar của user
userRouter.put(
  "/update-avatar",
  verifyToken,
  upload.single("avatar"),
  updateAvatar
);
export default userRouter;
