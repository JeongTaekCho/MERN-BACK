const express = require("express");

const router = express.Router();

const DUMMY_USERS = [
  {
    id: "u1",
    name: "조정택",
    age: 27,
    gender: "male",
  },
];

router.get("/:userId", (req, res, next) => {
  const userId = req.params.userId;
  console.log(userId);
  const users = DUMMY_USERS.find((user) => {
    return userId === user.id;
  });
  res.json({ users });
  console.log(users);
});

module.exports = router;
