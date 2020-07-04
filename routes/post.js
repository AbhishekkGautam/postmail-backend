const express = require("express");
const router = express.Router();
const { getUserById } = require("../controllers/user");
const {
  getPostById,
  createPost,
  listByUser,
  listNewsFeed,
  photo,
  like,
  unlike,
  comment,
  uncomment,
  isPoster,
  removePost,
} = require("../controllers/post");
const { isSignedIn } = require("../controllers/auth");

router.put("/posts/like", isSignedIn, like);
router.put("/posts/unlike", isSignedIn, unlike);

router.put("/posts/comment", isSignedIn, comment);
router.put("/posts/uncomment", isSignedIn, uncomment);

router.param("userId", getUserById);
router.param("postId", getPostById);

router.post("/posts/new/:userId", isSignedIn, createPost);
router.get("/posts/photo/:postId", photo);

router.get("/posts/by/:userId", isSignedIn, listByUser);
router.get("/posts/feed/:userId", isSignedIn, listNewsFeed);

router.delete("/posts/:postId", isSignedIn, isPoster, removePost);

module.exports = router;
