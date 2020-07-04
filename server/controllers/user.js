const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");
//const profileImage = require("./../../client/src/assets/images/profile-pic.png");

exports.getUserById = (req, res, next, id) => {
  User.findById(id)
    .populate("following", "_id name")
    .populate("followers", "_id name")
    .exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "USER NOT FOUND",
        });
      }
      req.profile = user;
      next();
    });
};

exports.createUser = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  const user = new User(req.body);
  user.save((err, success) => {
    if (err) {
      return res.status(400).json({
        error: "NOT ABLE TO CREATE USER",
      });
    }
    res.json({ message: "SUCCESSFULLY SIGNED UP!" });
  });
};

exports.getAllUsers = (req, res) => {
  User.find()
    .select("name email about createdAt updatedAt")
    .exec((err, users) => {
      if (err) {
        return res.status(400).json({
          error: "NO USERS FOUND",
        });
      }
      res.json(users);
    });
};

exports.getUser = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded",
      });
    }
    //updation code
    let user = req.profile;
    user = _.extend(user, fields);

    //handle file here
    if (files.photo) {
      if (files.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!",
        });
      }
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;
    }
    // console.log(product);
    //save to the DB
    user.save((err, user) => {
      if (err) {
        res.status(400).json({
          error: "Updation of profile failed",
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    });
  });
};

exports.deleteUser = (req, res, next) => {
  let user = req.profile;
  user.remove((err, deletedUser) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product",
      });
    }
    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({
      message: "Deletion was a success",
      deletedUser,
    });
  });
};

exports.photo = (req, res, next) => {
  if (req.profile.photo.data) {
    res.set("Content-Type", req.profile.photo.contentType);
    return res.send(req.profile.photo.data);
  }
  next();
};

exports.defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd() + profileImage);
};

exports.addFollowing = (req, res, next) => {
  User.findByIdAndUpdate(
    req.body.userId,
    { $push: { following: req.body.followId } },
    (err, result) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to add following",
        });
      }
      next();
    }
  );
};

exports.addFollower = (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    { $push: { followers: req.body.userId } },
    { new: true }
  )
    .populate("following", "_id name")
    .populate("followers", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to add following",
        });
      }
      result.hashed_password = undefined;
      result.salt = undefined;
      res.json(result);
    });
};

exports.removeFollowing = (req, res, next) => {
  User.findByIdAndUpdate(
    req.body.userId,
    { $pull: { following: req.body.unfollowId } },
    (err, result) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to add following",
        });
      }
      next();
    }
  );
};

exports.removeFollower = (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    { $pull: { followers: req.body.userId } },
    { new: true }
  )
    .populate("following", "_id name")
    .populate("followers", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to add following",
        });
      }
      result.hashed_password = undefined;
      result.salt = undefined;
      res.json(result);
    });
};

exports.findPeople = (req, res) => {
  let following = req.profile.following;
  following.push(req.profile._id);
  User.find({
    _id: { $nin: following },
  })
    .select("name")
    .exec((err, users) => {
      if (err) {
        return res.status(400).json({
          error: "UNABLE TO FIND FOLLOWING USERS",
        });
      }
      res.json(users);
    });
};
