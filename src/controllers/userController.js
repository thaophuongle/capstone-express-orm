import sequelize from "../models/connect.js";
import initModels from "../models/init-models.js";
import { response } from "../config/response.js";
import bcrypt from "bcrypt";
import { createToken, createRefreshToken, decodeToken } from "../config/jwt.js";

const model = initModels(sequelize);

const generateRandomString = (length = 6) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }

  return result;
};

const signUp = async (req, res) => {
  let { email, password, fullName, age } = req.body;

  let checkEmail = await model.nguoi_dung.findOne({
    where: {
      email: email,
    },
  });

  if (checkEmail) {
    response(res, "", "Email already exists!", 400);
    return;
  } else {
    let newData = {
      email: email,
      mat_khau: bcrypt.hashSync(password, 10),
      ho_ten: fullName,
      tuoi: age,
      anh_dai_dien: "",
      refresh_token: "",
    };

    let data = model.nguoi_dung.create(newData);
    response(res, data, "Sign up successfully!", 200);
  }
};

const signIn = async (req, res) => {
  let { email, password } = req.body;

  let checkEmail = await model.nguoi_dung.findOne({
    where: {
      email: email,
    },
  });

  if (checkEmail) {
    if (bcrypt.compareSync(password, checkEmail.mat_khau)) {
      let key = generateRandomString();
      let token = createToken({
        userId: checkEmail.dataValues.nguoi_dung_id,
        key,
      });
      let refToken = createRefreshToken({
        userId: checkEmail.dataValues.nguoi_dung_id,
        key,
      });

      checkEmail.refresh_token = refToken;
      model.nguoi_dung.update(checkEmail.dataValues, {
        where: {
          nguoi_dung_id: checkEmail.dataValues.nguoi_dung_id,
        },
      });

      response(res, token, "Login successfully!", 200);
    } else {
      response(res, "", "Password is incorrect!", 400);
    }
  } else {
    response(res, "", "Email does not exist!", 400);
  }
};

const getUserInfo = async (req, res) => {
  let { token } = req.headers;
  let { data } = decodeToken(token);

  try {
    let user = await model.nguoi_dung.findByPk(data.userId);

    if (user) {
      response(res, user, "Found user information successfully", 200);
    } else {
      response(res, null, "User not found", 404);
    }
  } catch (error) {
    response(res, null, error.message, 500);
  }
};

const getUserImages = async (req, res) => {
  let { token } = req.headers;
  let { data } = decodeToken(token);

  try {
    let images = await model.hinh_anh.findAll({
      where: {
        nguoi_dung_id: data.userId,
      },
      include: ["nguoi_dung"],
      order: [["ngay_tao", "DESC"]],
    });

    response(res, images, "User images retrieved successfully", 200);
  } catch (error) {
    response(res, null, error.message, 500);
  }
};

const getSavedImages = async (req, res) => {
  let { token } = req.headers;
  let { data } = decodeToken(token);

  try {
    let savedImages = await model.luu_anh.findAll({
      where: {
        nguoi_dung_id: data.userId,
      },
      include: [
        {
          model: model.hinh_anh,
          as: "hinh",
          include: ["nguoi_dung"],
        },
      ],
      order: [["ngay_luu", "DESC"]],
    });

    response(res, savedImages, "Get saved images successfully", 200);
  } catch (error) {
    response(res, null, error.message, 500);
  }
};

const uploadImage = async (req, res) => {
  try {
    let { title, description } = req.body;
    const file = req.file;

    //kiểm tra file đã upload chưa
    if (!file) {
      return response(res, null, "No file uploaded", 400);
    }

    let { token } = req.headers;
    let { data } = decodeToken(token);

    //tạo 1 row mới trong table hinh_anh
    const newImage = await model.hinh_anh.create({
      ten_hinh: title,
      duong_dan: file.filename,
      mo_ta: description,
      nguoi_dung_id: data.userId,
      ngay_tao: new Date(),
    });

    response(res, newImage, "Image uploaded successfully", 201);
  } catch (error) {
    response(res, null, error.message, 500);
  }
};

const updateUserInfo = async (req, res) => {
  try {
    let { token } = req.headers;
    let { data } = decodeToken(token);

    let { fullName, age } = req.body;

    let user = await model.nguoi_dung.findByPk(data.userId);

    // Check user có tồn tại
    if (!user) {
      return response(res, null, "User not found", 404);
    }

    // Update thông tin user
    user.ho_ten = fullName;
    user.tuoi = age;

    await user.save();

    response(res, user, "User information updated successfully", 200);
  } catch (error) {
    response(res, null, error.message, 500);
  }
};

const updateAvatar = async (req, res) => {
  try {
    let { token } = req.headers;
    let { data } = decodeToken(token);

    const file = req.file;

    //Kiểm tra file đã upload chưa
    if (!file) {
      return response(res, null, "No file uploaded", 400);
    }

    let user = await model.nguoi_dung.findByPk(data.userId);

    //Kiểm tra user
    if (!user) {
      return response(res, null, "User not found", 404);
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) {
      const avatarPath = path.join(__dirname, "..", "imgs", user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Cập nhật avatar mới
    user.anh_dai_dien = file.filename;
    await user.save();

    response(res, user, "Avatar updated successfully", 200);
  } catch (error) {
    response(res, null, error.message, 500);
  }
};

export {
  signUp,
  signIn,
  getUserInfo,
  getUserImages,
  getSavedImages,
  uploadImage,
  updateUserInfo,
  updateAvatar,
};
