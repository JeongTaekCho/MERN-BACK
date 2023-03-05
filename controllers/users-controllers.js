const { v4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "조정택",
    email: "cjt3591@gmail.com",
    password: "x156156a",
  },
];

const getUsers = (req, res, next) => {
  res.json({
    users: DUMMY_USERS,
  });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("빈 값이 없도록 입력해주세요.", 422);
    return next(error);
  }

  const { name, email, password, places } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "가입에 실패하였습니다. 다시 시도해주세요.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("이미 존재하는 이메일 입니다.", 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://cdn.pixabay.com/photo/2013/01/29/00/47/google-76517__340.png",
    password,
    places,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "회원가입에 실패하였습니다. 다시 시도해주세요.",
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    const error = new HttpError(
      "Could not identify user, credentials seem to br wrong",
      401
    );
    return next(error);
  }
  res.json({ message: "Loggen in!" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
