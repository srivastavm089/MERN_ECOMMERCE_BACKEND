const User = require("../model/userModal");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
//register user
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
      resource_type: "image",
    });
    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    const token = user.getJWTToken();

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ success: false, error });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "invalid email or password" });
    }
    const isPasswordMatched = await user.camparePassword(password);

    if (!isPasswordMatched) {
      return res
        .status(401)
        .json({ success: false, message: "invalid email or password" });
    }

    sendToken(user, 200, res);
    // const token = user.getJWTToken();

    // res.status(201).json({
    //     success:true,
    //    token
    // })
  } catch (error) {
    res.status(501).json({ success: false, error });
  }
};

//logout user
exports.logout = (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "internal server error",
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user not found",
    });
  }
  //get ResetPassword token

  const reset = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `http://localhost:3000/password/reset/${reset}`;
  const message = `Your password reset token is :- \n\n ${resetPasswordUrl}  \n\n if you have not requested then ,  please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Dudo password recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ success: false, message: "something went wrong" });
  }
};
//reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).json({
        succes: false,
        message: "Reset password token is invalid or has been expired",
      });
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(404).json({
        succes: false,
        message: "password does not match",
      });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "something went wrong",
    });
  }
};

//get User details

exports.getUserDetails = async (req, res) => {
  console.log("user");
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ succes: true, user });
  } catch (error) {
    res.status(501).json({
      succes: false,
      message: "internal server error",
    });
  }
};
//update user password

exports.updateUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    const isMatched = await user.camparePassword(req.body.oldPassword);
    console.log(isMatched);

    if (!isMatched) {
      return res.status(401).json({
        succes: false,
        message: "please enter correct old password",
      });
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(401).json({
        succes: false,
        message: "password does not match",
      });
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (error) {
    res.status(501).json({
      succes: false,
      message: "internal server error",
    });
  }
};

//update user profile
exports.updateUserProfile = async (req, res) => {
  console.log(req.body.name, req.body.email);
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.body.avatar !== "") {
      const user = await User.findById(req.user.id);
      const imageId = user.avatar.public_id;
      await cloudinary.v2.uploader.destroy(imageId);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
        resource_type: "image",
      });

      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,

      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      message: "updated successfully",
    });
  } catch (error) {
    res.status(501).json({ succes: false, message: "internal server error" });
  }
};

//get all users admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      succes: true,
      users,
    });
  } catch (error) {
    res.status(501).json({ succes: false, message: "internal server error" });
  }
};

//get single user admin
exports.getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(401).json({
        succes: false,
        message: `user does not exist with id ${req.params.id}`,
      });
    }
    res.status(200).json({
      succes: true,
      user,
    });
  } catch (error) {
    res.status(501).json({ succes: false, message: "internal server error" });
  }
};

//admin update user roll
exports.updateUserRole = async (req, res) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
    await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      success: true,
      message: "updated successfully",
    });
  } catch (error) {
    res.status(501).json({ succes: false, message: "internal server error" });
  }
};
//delete user admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(401).json({
        success: false,

        message: `user not exist with id ${req.params.id}`,
      });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "user deleted successfully",
    });
  } catch (error) {
    res.status(501).json({ succes: false, message: "internal server error" });
  }
};
