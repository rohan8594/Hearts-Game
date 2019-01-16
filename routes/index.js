const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/lobby");
  } else {
    res.render("login");
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/lobby",
    failureRedirect: "/"
  })
);

module.exports = router;
