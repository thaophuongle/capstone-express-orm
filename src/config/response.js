export const response = (res, data, message, status_code) => {
  res.status(status_code).json({
    statusCode: status_code,
    data: data,
    message: message,
    date: new Date(),
  });
};
