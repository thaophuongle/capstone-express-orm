import multer, { diskStorage } from "multer";
export const upload = multer({
  storage: diskStorage({
    destination: process.cwd() + "/public/imgs",
    filename: (req, file, callback) => {
      let mSecond = new Date().getTime();

      callback(null, mSecond + "_" + file.originalname);
    },
  }),
});
