const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");

exports.getPostById = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id name")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({
          error: "COULD NOT RETRIEVE USER POST",
        });
      }
      req.post = post;
      next();
    });
};

exports.createPost = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded",
      });
    }
    //updation code
    let post = new Post(fields);
    post.postedBy = req.profile;

    //handle file here
    if (files.photo) {
      if (files.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!",
        });
      }
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }

    //save to the DB
    post.save((err, post) => {
      if (err) {
        res.status(400).json({
          error: "UNABLE TO SAVE THE POST",
        });
      }
      res.json(post);
    });
  });
};

exports.photo = (req, res) => {
  res.set("Content-Type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

exports.listByUser = (req, res) => {
  Post.find({ postedBy: req.profile._id })
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .sort("-createdAt")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: "POSTS BY USER NOT FOUND",
        });
      }
      res.json(posts);
    });
};

exports.listNewsFeed = (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  Post.find({ postedBy: { $in: req.profile.following } })
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .sort("-createdAt")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: "NO POSTS FOUND",
        });
      }
      res.json(posts);
    });
};

exports.like = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "UNABLE TO ADD LIKE",
      });
    }
    res.json(result);
  });
};

exports.unlike = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "UNABLE TO ADD LIKE",
      });
    }
    res.json(result);
  });
};

exports.comment = (req, res) => {
  let comment = req.body.comment;
  comment.postedBy = req.body.userId;
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: comment } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: "UNABLE TO SAVE COMMENT",
        });
      }
      res.json(result);
    });
};

exports.uncomment = (req, res) => {
  let comment = req.body.comment;

  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { comments: { _id: comment._id } } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: "UNABLE TO DELETE COMMENT",
        });
      }
      res.json(result);
    });
};

exports.removePost = (req, res) => {
  let post = req.post;
  post.remove((err, deletedPost) => {
    if (err) {
      return res.status(400).json({
        error: "FAILED TO DELETE THE POST",
      });
    }
    res.json({
      message: "POST DELETED SUCCESSFULLY",
      deletedPost,
    });
  });
};

exports.isPoster = (req, res, next) => {
  let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  if (!isPoster) {
    return res.status(403).json({
      error: "USER IS NOT AUTHORIZED",
    });
  }
  next();
};
