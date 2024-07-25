import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Todo from "../models/Todo";
import Qa from "../models/Qa";

interface CustomRequest extends Request {
	user?: string | JwtPayload;
}

export const verifyAdmin = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	const token =
		req.headers.authorization && req.headers.authorization.split(" ")[1];
	if (!token) {
		return res
			.status(403)
			.json({ message: "Unauthorized ! No Token Provided" });
	}
	jwt.verify(token, process.env.SECRET_TOKEN!, (err, decoded: any) => {
		if (err) {
			return res.status(403).json({ message: "Invalid Token" });
		}
		req.user = decoded;
		if ((req as any).user.isAdmin) {
			next();
		} else {
			return res.status(400).json({
				message: "Unauthorized! You are not an admin",
			});
		}
	});
};

export const verifyQaOwner = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	const token =
		req.headers.authorization && req.headers.authorization.split(" ")[1];
	if (!token) {
		return res
			.status(403)
			.json({ message: "Unauthorized ! No Token Provided" });
	}
	jwt.verify(token, process.env.SECRET_TOKEN!, async (err, decoded: any) => {
		if (err) {
			return res.status(403).json({ message: "Invalid Token" });
		}
		req.user = decoded;
		const { qaId } = req.params;
		const qa = await Qa.findOne({ _id: qaId });
		if (!qa) {
			return res.status(403).json({
				message: "QA not Found ! 😒",
			});
		}
		if (qa.userId.equals((req as any).user.userId)) {
			next();
		} else {
			return res.status(400).json({
				message: "Unauthorized! You are not the owner of this todo",
			});
		}
	});
};

export const verifyTodoOwner = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	const token =
		req.headers.authorization && req.headers.authorization.split(" ")[1];
	if (!token) {
		return res
			.status(403)
			.json({ message: "Unauthorized ! No Token Provided" });
	}
	jwt.verify(token, process.env.SECRET_TOKEN!, async (err, decoded: any) => {
		if (err) {
			return res.status(403).json({ message: "Invalid Token" });
		}
		req.user = decoded;
		const { todoId } = req.params;
		const todo = await Todo.findOne({ _id: todoId });
		if (!todo) {
			return res.status(403).json({
				message: "Todo Not Found ! ❌",
			});
		}
		if (todo.userId.equals((req as any).user.userId)) {
			next();
		} else {
			return res.status(400).json({
				message: "Unauthorized! You are not the owner of this todo",
			});
		}
	});
};

export const verifyToken = (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers["authorization"]?.split(" ")[1];

	if (!token) {
		return res.status(403).json({ message: "No token provided" });
	}

	jwt.verify(
		token,
		process.env.SECRET_TOKEN as string,
		(err: any, decoded: any) => {
			if (err) {
				return res
					.status(401)
					.json({ message: "Unauthorized! Invalid token", err });
			}
			req.user = decoded;
			next();
		}
	);
};
