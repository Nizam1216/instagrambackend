const userModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const otpModel = require("../models/OtpModel");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  timeout: 60000,
});
exports.updateUserController = async (req, res) => {
  try {
    let { fullname, username, profilePic } = req.body;
    const authToken = req.header("authToken");
    const userId = jwt.decode(authToken)?.user?.id;
    if (!userId) {
      res.send("Action revoked please login first");
    }
    //https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg
    const result = await cloudinary.uploader.upload(profilePic, {
      public_id: "profilepic",
      folder: "profilePics",
    });
    const updatedUser = await userModel.findByIdAndUpdate(userId, {
      fullname,
      username,
      profilePic: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
    res.status(200).json({ success: "User Updated Sucessfully" });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
};

exports.signupController = async (req, res) => {
  try {
    let { fullname, username, email, password, confirmPassword, otp } =
      req.body;
    const isNotExpired = await otpModel.findOne({ email, otp });
    if (!isNotExpired) {
      return res.status(404).json({
        message:
          "OTP session expired or Invalid Please ReVerify otp with New One",
      });
    }
    const user = await userModel.findOne({ $or: [{ username }, { email }] });
    if (user && user.username == username) {
      return res.json({
        message: "userName already exists try any other username",
      });
    } else if (user && user.email == email) {
      return res.json({ message: "user already exists with this email" });
    } else if (password !== confirmPassword) {
      return res.json({ message: "passwords mismatch please recheck" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    const newUser = await userModel.create({
      fullname,
      username,
      email,
      password: hashedpassword,
    });
    res.status(200).json({ message: "User created Sucessfully" });
  } catch (error) {
    res.json({ message: error });
  }
};
exports.loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res
        .status(401)
        .json({ error: "user dont exist with this username" });
    } else {
      const comparedPassword = await bcrypt.compare(password, user.password);
      if (!comparedPassword) {
        return res.status(401).json({ error: "invalid credentials" });
      }
      if (comparedPassword) {
        const data = {
          user: {
            id: user.id,
          },
        };
        const authToken = jwt.sign(data, process.env.JWT_SECRET);

        res.status(200).send(authToken);
      }
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
exports.sendMailController = async (req, res) => {
  const { email } = req.body;
  const buffer = crypto.randomBytes(3); // 3 bytes = 24 bits

  // Convert buffer to hexadecimal string
  const otp = buffer.toString("hex").toUpperCase().slice(0, 6);
  await otpModel.create({
    email,
    otp,
  });

  var transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "nizamwork1216@gmail.com",
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: "nizamwork1216@gmail.com",
    to: email,
    subject: "Confirmation mail for verification",
    text: `${otp} is your one-time-password to verify the email address. please do not Share with anyone`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(200).json({ message: "something went wrong", error: error });
    } else {
      res.status(200).json({ message: "email has sent" });
    }
  });
};
exports.validateOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Retrieve the OTP from the session (assuming it's still valid)
    const otpRecord = await otpModel.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Valid OTP
    res.status(200).json({ message: "OTP validated successfully" });
  } catch (error) {
    console.error("Error validating OTP:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.userController = async (req, res) => {
  try {
    const token = req.header("authToken");
    const decodeToken = jwt.decode(token);
    const userId = decodeToken && decodeToken.user.id;
    if (!userId) {
      return res.status(401).send("User not Found");
    }
    const user = await userModel.findById(userId, "-password");

    res.send(user);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.deleteUserController = async (req, res) => {
  try {
    const authToken = req.header("authToken");
    const userId = jwt.decode(authToken)?.user?.id;
    if (!userId) {
      res.send("Action revoked please login first");
    }
    const deletedUser = await userModel.findByIdAndDelete(userId);
    res.status(200).json({ success: "user deleted Sucessfully" });
  } catch (error) {
    res.json({ error: error });
  }
};
exports.allUsersController = async (req, res) => {
  try {
    const allUsers = await userModel.find({}, "-password");
    res.status(200).send(allUsers);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
exports.otpForgotPasswordController = async (req, res) => {
  const { email } = req.body;
  const isUser = await userModel.findOne({ email });
  if (!isUser) {
    return res.json({ message: "User with this mail don't exist" });
  }
  const buffer = crypto.randomBytes(3); // 3 bytes = 24 bits

  // Convert buffer to hexadecimal string
  const otp = buffer.toString("hex").toUpperCase().slice(0, 6);
  await otpModel.create({
    email,
    otp,
  });
  var transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "nizamwork1216@gmail.com",
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  var mailOptions = {
    from: "nizamwork1216@gmail.com",
    to: email,
    subject: "Confirmation mail to reset password",
    text: `${otp} is your one-time-password to verify the email address for resetting your password. please do not Share with anyone`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(200).json({ message: "something went wrong", error: error });
    } else {
      res.status(200).json({ message: "OTP sent to your email" });
    }
  });
};
exports.forgotPasswordController = async (req, res) => {
  try {
    const { email, otp, newpassword, reEnterPassword } = req.body;
    if (newpassword !== reEnterPassword) {
      return res.json({
        message:
          "password does not match with re-entered password please check!!",
      });
    }
    // Retrieve the OTP from the session (assuming it's still valid)
    const otpRecord = await otpModel.findOne({ email, otp });
    if (!otpRecord) {
      return res.json({
        error:
          "Invalid OTP Or Session time more than 5 minutes please reSend otp and validate",
      });
    }
    const user = await userModel.findOne({ email });
    const userId = user._id;
    const hashedpassword = await bcrypt.hash(newpassword, 10);
    await userModel.findOneAndUpdate(userId, { password: hashedpassword });
    // Valid OTP
    res.status(200).json({ message: "Password Updated Sussfully" });
  } catch (error) {
    console.error("Error validating OTP:", error);
    res.json({ message: "Something went wrong", error: error });
  }
};
