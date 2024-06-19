import express from "express";
import { verifyToken } from "../config/jwt.js";
import {
  getImagePost,
  getImagePostBySearch,
  getImageDetail,
  getComment,
  checkImageSaved,
  createComment,
  deleteImage,
} from "../controllers/postController.js";

const postRouter = express.Router();
//API GET danh sách ảnh về
postRouter.get("/get-image-post", verifyToken, getImagePost);

//API GET tìm kiếm danh sách ảnh theo tên
postRouter.get("/search-image-post", verifyToken, getImagePostBySearch);

//API GET thông tin ảnh và người tạo ảnh bằng id ảnh
postRouter.get("/get-image-detail/:imageId", getImageDetail);

//API GET thông tin bình luận theo id ảnh
postRouter.get("/get-comment/:imageId", getComment);

//API GET thông tin đã lưu hình này chưa theo id ảnh (dùng để kiểm tra ảnh đã lưu hay chưa ở nút Save)
postRouter.get(
  "/check-image-saved/:imageId/:userId",
  verifyToken,
  checkImageSaved
);

//API POST để lưu thông tin bình luận của người dùng với hình ảnh
postRouter.post("/create-comment", createComment);

//API DELETE xóa ảnh đã tạo theo id ảnh
postRouter.delete("/delete-image/:imageId", verifyToken, deleteImage);
export default postRouter;
