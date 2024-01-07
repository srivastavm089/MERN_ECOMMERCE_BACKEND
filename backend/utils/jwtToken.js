const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  //options for cookie

  // const options = {
  //   expires: new Date(Date.now() + 1 * 3600000),
  //   httpOnly: true,
  // };

  res.status(statusCode).json({
    success: true,
    user,
    token
  });
};
module.exports = sendToken;
