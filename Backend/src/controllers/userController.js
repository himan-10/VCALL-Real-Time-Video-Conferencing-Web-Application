import httpStatus from "http-status";
import { User } from "../models/usermodels.js";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
  const { username, password } = req.body;
  //jab username our password na ho
  if (!username || !password) {
    return res.status(400).json({ message: "Please Provide" });
  }
  try {
    //find karnege usename
    const user = await User.findOne({ username });
    // check nnahi hai to notfound
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: `User Not Found` });
    }
    //compaire kro our age bado
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res.status(httpStatus.OK).json({ token: token });
    }
    else {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or Password" });
    }
  } catch (error) {
    return res.status(500).json({ message: `Something went Wrong ${error}` });
  }
};
const register = async (req, res) => {
  const { name, username, password } = req.body;
  console.log(req.body); // debug
  try {
    //agr koi user alrady hai to
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // new user
    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(httpStatus.CREATED).json({ message: "User Registered" });
  } catch (error) {
    res.json({ message: `someting went wrong ${error}` });
  }
};

const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" })
    }
    // Return user profile + history
    res.status(httpStatus.OK).json({
      name: user.name,
      username: user.username,
      activity: user.activity
    });
  } catch (e) {
    res.status(500).json({ message: `Something went wrong ${e}` });
  }
};

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" })
    }
    const newActivity = {
      meetingCode: meeting_code,
    };

    user.activity.push(newActivity);
    await user.save();
    res.status(httpStatus.OK).json({ message: "Added to recent activity" });
  } catch (e) {
    res.status(500).json({ message: `Something went wrong ${e}` });
  }
};

export { login, register, getUserHistory, addToHistory };
