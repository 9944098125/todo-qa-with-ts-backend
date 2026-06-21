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
import { sendError } from "./helpers/response";

dotenv.config();

const app: Application = express();
app.use(
	cors()
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use the routes here
app.use("/api/auth", authRoute);
app.use("/api/qa", qaRoute);
app.use("/api/todo", todoRoute);
app.use("/api/admin", adminRoute);

app.use((error: any, req: Request, res: Response, next: Function) => {
	const errStatus = error.status || 500;
	const errMessage = error.message || "Something went wrong";
	return sendError(req, res, errStatus, errMessage, {
		stack: error.stack,
	});
});

const port = process.env.PORT || 5001;

app.listen(port, () => {
	connect();
	console.log(`Server is running on http://localhost:${port}`);
});
