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

app.set("trust proxy", 1); // you need to add this
app.use(
	session({
		secret: process.env.SECRET_TOKEN!,
		resave: false,
		saveUninitialized: false,
		proxy: true, // this is optional it depend which server you host, i am not sure about Heroku if you need it or not
		cookie: {
			secure: "auto", // this will set to false on developement, but true on Heroku since is https so this setting is required
			maxAge: 10000, // 10 sec for testing
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //by default in developement this is false if you're in developement mode
		},
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
			try {
				let user = await User.findOne({ googleId: profile.id });
				if (!user) {
					user = new User({
						name: profile?.displayName,
						email: profile?.emails[0].value,
						profilePicture: profile?.photos?.[0].value,
						googleId: profile?.id,
						phone: profile?.phone,
					});
					console.log("user", user);
					await user.save();
				}
				return done(null, user); // Ensure this is the correct user
			} catch (err) {
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
						phone: profile?.phone,
					});
					console.log("user", user);
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
		scope: [
			"profile",
			"email",
			"https://www.googleapis.com/auth/user.phonenumbers.read",
		],
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
	passport.authenticate("github", { scope: ["read:user", "user:email"] })
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
		console.log("error login/success", req);
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
