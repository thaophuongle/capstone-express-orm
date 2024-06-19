import sequelize from "../models/connect.js";
import initModels from "../models/init-models.js";
import { decodeToken } from "../config/jwt.js";
import { Op } from "sequelize";
import { response } from "../config/response.js";

const model = initModels(sequelize);

const getImagePost = async (req, res) => {
  // SELECT * FROM video JOIN video_type JOIN user
  let data = await model.hinh_anh.findAll({
    include: ["nguoi_dung"],
  });

  response(res, data, "Successfully", 200);
};

const getImagePostBySearch = async (req, res) => {
  const { searchWord } = req.query;

  try {
    let data = await model.hinh_anh.findAll({
      where: {
        ten_hinh: {
          [Op.like]: `%${searchWord}%`,
        },
      },
      include: ["nguoi_dung"],
    });

    response(res, data, "Successfully", 200);
  } catch (error) {
    response(res, null, error.message, 500);
  }
};

const getImageDetail = async (req, res) => {
  let { imageId } = req.params;
  let data = await model.hinh_anh.findByPk(imageId, {
    include: ["nguoi_dung"],
  });
  response(res, data, "Successfully", 200);
};

const getComment = async (req, res) => {
  let { imageId } = req.params;
  let data = await model.binh_luan.findAll({
    where: {
      hinh_id: imageId,
    },
    include: ["nguoi_dung", "hinh"],
    order: [["ngay_binh_luan", "DESC"]],
  });

  response(res, data, "Successfull", 200);
};

const checkImageSaved = async (req, res) => {
  const { imageId, userId } = req.params;

  try {
    let data = await model.luu_anh.findOne({
      where: {
        hinh_id: imageId,
        nguoi_dung_id: userId,
      },
    });

    if (data) {
      response(res, true, "Image is saved", 200);
    } else {
      response(res, false, "Image is not saved", 200);
    }
  } catch (error) {
    response(res, null, error.message, 500);
  }
};

const createComment = async (req, res) => {
  let { imageId, content } = req.body;

  let { token } = req.headers;
  let { data } = decodeToken(token);

  let dateComment = new Date();

  let newData = {
    nguoi_dung_id: data.userId,
    hinh_id: imageId,
    ngay_binh_luan: dateComment,
    noi_dung: content,
  };
  await model.binh_luan.create(newData);
  response(res, "", "Comment is created succesfully!", 200);
};

const deleteImage = async (req, res) => {
  const { imageId } = req.params;

  try {
    const image = await model.hinh_anh.findByPk(imageId);
    if (!image) {
      return response(res, null, "Image not found", 404);
    }

    //check user có quyền xóa hình ảnh hay ko
    let { token } = req.headers;
    let { data } = decodeToken(token);
    if (image.nguoi_dung_id !== data.userId) {
      return response(res, null, "Unauthorized to delete this image", 403);
    }

    await model.hinh_anh.destroy({
      where: {
        hinh_id: imageId,
      },
    });

    response(res, null, "Image deleted successfully", 200);
  } catch (error) {
    response(res, null, error.message, 500);
  }
};
export {
  getImagePost,
  getImagePostBySearch,
  getImageDetail,
  getComment,
  checkImageSaved,
  createComment,
  deleteImage,
};
