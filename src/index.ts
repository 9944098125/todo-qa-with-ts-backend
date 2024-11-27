import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as GithubStrategy } from "passport-github2";

import authRoute from "./routes/auth";
import qaRoute from "./routes/qa";
import todoRoute from "./routes/todo";
import adminRoute from "./routes/admin";
import { connect } from "./dbConnection/db";
import User from "./models/User";

dotenv.config();

const app: Application = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		secret: process.env.SECRET_TOKEN || "your-session-secret", // Add a session secret
		resave: false,
		saveUninitialized: true,
		cookie: { secure: process.env.NODE_ENV === "production" }, // Use secure cookies in production
	})
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL: "/auth/google/callback",
			scope: ["profile", "email"],
		},
		async (
			accessToken: string,
			refreshToken: string,
			profile: any,
			done: (error: any, user?: any) => void
		) => {
			//verify the user
			// console.log(profile);
			try {
				const user = await User.findOne({ googleId: profile.id });
				if (!user) {
					const newUser = new User({
						name: profile?.displayName,
						email: profile?.emails[0].value,
						profilePicture: profile?.photos?.[0].value,
						phone: profile?.phoneNumbers?.[0].value,
						googleId: profile?.id,
					});
					await newUser.save();
				}
				return done(null, user);
			} catch (err: any) {
				return done(err, null);
			}
		}
	)
);
// reverting the changes
passport.use(
	new GithubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			callbackURL: "/auth/github/callback",
			scope: ["profile", "email"],
		},
		async (
			accessToken: string,
			refreshToken: string,
			profile: any,
			done: (error: any, user?: any) => void
		) => {
			try {
				const user = await User.findOne({ githubId: profile.id });
				if (!user) {
					const newUser = new User({
						name: profile?.displayName,
						profilePicture: profile?.photos?.[0].value,
						githubId: profile?.id,
					});
					await newUser.save();
				}
				return done(null, user);
			} catch (err: any) {
				return done(err, null);
			}
		}
	)
);

passport.serializeUser((user: any, done: any) => {
	done(null, user);
});

passport.deserializeUser(async (user: any, done: any) => {
	done(null, user);
});

app.get(
	"/auth/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
	})
);

app.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		successRedirect: "http://localhost:3000",
		failureRedirect: "http://localhost:3000/login",
	})
);

app.get(
	"/auth/github",
	passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
	"/auth/github/callback",
	passport.authenticate("github", {
		successRedirect: "http://localhost:3000",
		failureRedirect: "http://localhost:3000/login",
	})
);

app.get("/login/success", async (req, res) => {
	if (req.user) {
		res.status(200).json({ message: "user Login", user: req.user });
	} else {
		res.status(400).json({ message: "Not Authorized" });
	}
});

// use the routes here
app.use("/api/auth", authRoute);
app.use("/api/qa", qaRoute);
app.use("/api/todo", todoRoute);
app.use("/api/admin", adminRoute);

app.use((error: any, req: Request, res: Response, next: Function): void => {
	const errStatus = error.status || 500;
	const errMessage = error.message || "Something went wrong";
	res.status(errStatus).json({
		message: errMessage,
		success: false,
		stack: error.stack,
	});
	return;
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
	connect();
	console.log(`Server is running on http://localhost:${port}`);
});
