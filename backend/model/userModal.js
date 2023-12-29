const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 charactors"],
    minLength: [4, "Name should have more then 5 character"],
  },
  email: {
    type: String,
    required: [true, "Please Enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Password should be greater then 8 charactors"],
    select: false,
  },

  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  JoinedOn:{
    type:Date,
    default:Date.now
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);

    this.password = hashedPassword;

    return next();
  } catch (error) {
    console.log(error);
  }
});

userSchema.methods.getJWTToken = function () {
  try {
   
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
      
    });
  } catch (error) {
    console.log(error);
  }
};

//Compare Password
userSchema.methods.camparePassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};
//Generating possword reset token

userSchema.methods.getResetPasswordToken = async function () {
  //Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //Hashing and add to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("users", userSchema);
