import express from "express";
import {
  callbackGoogle,
  failure,
  refreshToken,
  signIn,
  signOut,
  signUp,
} from "../controllers/authController.js";
import passport from "passport";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.post("/refresh", refreshToken);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get(
  "/callback/google",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    session: false,
  }),
  callbackGoogle,
);
router.get("/failure", failure);

export default router;
