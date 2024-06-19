import jwt from "jsonwebtoken";

export const createToken = (data) => {
  return jwt.sign({ data: data }, "SECRET", { expiresIn: "200d" }); //khóa bí mật có thể khai trong biến môi trường
};

export const checkToken = (token) =>
  jwt.verify(token, "SECRET", (error) => error);

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const createRefreshToken = (data) => {
  return jwt.sign({ data: data }, "REF_TOKEN_SECRET", { expiresIn: "200d" });
};

export const checkRefreshToken = (token) =>
  jwt.verify(token, "REF_TOKEN_SECRET", (error) => error);

export const verifyToken = (req, res, next) => {
  let { token } = req.headers;
  let error = checkToken(token);
  if (error == null) {
    next();
    return;
  }

  res.status(401).send(error.name);
};
