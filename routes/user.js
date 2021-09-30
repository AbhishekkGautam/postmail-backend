const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const {
  getUserById,
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  photo,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  findPeople,
} = require("../controllers/user");
const { isSignedIn, hasAuthorization } = require("../controllers/auth");

router.get("/users", getAllUsers);
router.post(
  "/users",
  [
    check("name", "Name should be at least 3 characters").isLength({ min: 3 }),
    check("email", "Email address is required").isEmail(),
    check("password", "Password should be at least 6 characters").isLength({
      min: 3,
    }),
  ],
  createUser
);

router.put("/users/follow", isSignedIn, addFollowing, addFollower);
router.put("/users/unfollow", isSignedIn, removeFollowing, removeFollower);

router.param("userId", getUserById);

router.get("/users/:userId", isSignedIn, getUser);
router.put("/users/:userId", isSignedIn, hasAuthorization, updateUser);
router.delete("/users/:userId", isSignedIn, hasAuthorization, deleteUser);

router.get("/users/photo/:userId", photo);
//router.get("/users/defaultphoto", defaultPhoto);

router.get("/users/findpeople/:userId", isSignedIn, findPeople);

module.exports = router;
