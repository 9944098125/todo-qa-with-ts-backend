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

// to create a session for google login
app.use(
	session({
		secret: process.env.SECRET_TOKEN!,
		resave: false,
		saveUninitialized: true,
	})
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL:
				process.env.NODE_ENV === "production"
					? "http://todo-qa-with-ts-backend-production.up.railway.app/auth/google/callback"
					: "http://localhost:5000/auth/google/callback",
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
			callbackURL:
				process.env.NODE_ENV === "production"
					? "http://todo-qa-with-ts-backend-production.up.railway.app/auth/github/callback"
					: "http://localhost:5000/auth/github/callback",

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
	done(null, user.id); // Save only the user ID in the session
});

passport.deserializeUser(async (id: string, done: any) => {
	try {
		const user = await User.findById(id); // Fetch the full user record by ID
		done(null, user);
	} catch (err) {
		done(err, null);
	}
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

// app.get("/login/success", async (req: Request, res: Response) => {
// 	if (req?.user) {
// 		res.status(200).json({ message: "user Login", user: req.user });
// 	} else {
// 		res.status(400).json({ message: "Not Authorized" });
// 	}
// });
app.get("/login/success", (req: Request, res: Response) => {
	if (req.user) {
		res.status(200).json({
			message: "User Login Successful",
			user: req.user, // Send user details from session
		});
	} else {
		res.status(401).json({ message: "Not Authorized" });
	}
});

// use the routes here
app.use("/api/auth", authRoute);
app.use("/api/qa", qaRoute);
app.use("/api/todo", todoRoute);
app.use("/api/admin", adminRoute);

app.use((error: any, req: Request, res: Response, next: Function) => {
	const errStatus = error.status || 500;
	const errMessage = error.message || "Something went wrong";
	return res.status(errStatus).json({
		message: errMessage,
		success: false,
		stack: error.stack,
	});
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
	connect();
	console.log(`Server is running on http://localhost:${port}`);
});
