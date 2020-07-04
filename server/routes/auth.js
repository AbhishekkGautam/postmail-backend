const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { signout, signin, isSignedIn } = require("../controllers/auth");

router.post(
  "/signin",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({ min: 1 }),
  ],
  signin
);
router.get("/signout", signout);

module.exports = router;
