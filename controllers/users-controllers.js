const { v4 } = require("uuid");
const HttpError = require("../models/http-error");

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

const signUp = (req, res, next) => {
  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);

  if (hasUser) {
    throw new HttpError("이미 가입된 이메일 입니다.", 422);
  }

  const createUser = {
    id: v4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createUser);

  res.status(201).json({ user: createUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user, credentials seem to br wrong",
      401
    );
  }
  res.json({ message: "Loggen in!" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
