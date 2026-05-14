import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const GG_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GG_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GG_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GG_CLIENT_ID,
      clientSecret: GG_CLIENT_SECRET,
      callbackURL: GG_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;

        const email = profile.emails?.[0]?.value;

        let user = await User.findOne({ googleId }).exec();

        if (!user && email) {
          user = await User.findOne({ email });
        }

        if (!user) {
          const username = email?.split("@")[0];

          user = await User.create({
            googleId,
            username,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatarUrl: profile.photos?.[0]?.value,
          });
        } else {
          if (!user.googleId) {
            user.googleId = googleId;
          }
          user.displayName = user.displayName || profile.displayName;

          user.avatarUrl = user.avatarUrl || profile.photos?.[0]?.value;

          await user.save();
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

export default passport;
