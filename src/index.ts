import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth";
import qaRoute from "./routes/qa";
import todoRoute from "./routes/todo";
import adminRoute from "./routes/admin";
import { connect } from "./dbConnection/db";
import searchRoute from "./routes/search";

dotenv.config();

const app: Application = express();

app.use(
	cors({
		origin: "https://todo-qa-frontend.vercel.app",
		methods: "GET,POST,PATCH,PUT,DELETE",
		credentials: true,
	})
);
app.use(cookieParser());
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

// use the routes here
app.use("/api/auth", authRoute);
app.use("/api/qa", qaRoute);
app.use("/api/todo", todoRoute);
app.use("/api/admin", adminRoute);
app.use("/api", searchRoute);

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
	console.log(`Server is running on ${port}`);
});

// command to get secret token
// require('crypto').randomBytes(64).toString('hex')
