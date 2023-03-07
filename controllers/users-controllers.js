const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "사용자 정보 가져오기에 실패 했습니다. 나중에 다시 시도해 주세요.",
      500
    );
    return next(error);
  }

  res.json(
    { users: users.map((user) => user.toObject({ getters: true })) },
    200
  );
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("빈 값이 없도록 입력해주세요.", 422);
    return next(error);
  }

  const { name, email, password } = req.body;

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
    places: [],
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

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "로그인에 실패하였습니다. 다시 시도해주세요.",
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("이메일 혹은 비밀번호를 확인해 주세요.", 401);
    return next(error);
  }

  res.json({ message: "Loggen in!" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
