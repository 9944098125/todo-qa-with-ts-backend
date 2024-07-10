import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import authRoute from "./routes/auth";
import qaRoute from "./routes/qa";
import { connect } from "./dbConnection/db";

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use the routes here
app.use("/api/auth", authRoute);
app.use("/api/qa", qaRoute);

app.use((error: any, req: Request, res: Response, next: Function) => {
	const errStatus = error.status || 500;
	const errMessage = error.message || "Something went wrong";
	return res.status(errStatus).json({
		message: errMessage,
		success: false,
		stack: error.stack,
	});
});

const port = process.env.PORT || 5001;

app.listen(port, () => {
	connect();
	console.log(`Server is running on http://localhost:${port}`);
});
