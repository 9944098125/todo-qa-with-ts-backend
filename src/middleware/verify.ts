import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Qa from "../models/Qa";
import Todo from "../models/Todo";

interface CustomRequest extends Request {
	user?: string | JwtPayload; // Extend with custom properties
}

export const verifyAdmin = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const token =
			req.headers.authorization && req.headers.authorization.split(" ")[1];

		if (!token) {
			res.status(403).json({ message: "Unauthorized! No Token Provided" });
			return; // Ensure no further execution
		}

		jwt.verify(token, process.env.SECRET_TOKEN!, (err, decoded: any) => {
			if (err) {
				res.status(403).json({ message: "Invalid Token" });
				return;
			}

			req.user = decoded;

			if ((req as any).user?.isAdmin) {
				next(); // Pass control to the next middleware
			} else {
				res.status(400).json({
					message: "Unauthorized! You are not an admin",
				});
			}
		});
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error", error });
	}
};

export const verifyQaOwner = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const token =
			req.headers.authorization && req.headers.authorization.split(" ")[1];

		if (!token) {
			res.status(403).json({ message: "Unauthorized! No Token Provided" });
			return;
		}

		jwt.verify(token, process.env.SECRET_TOKEN!, async (err, decoded: any) => {
			if (err) {
				res.status(403).json({ message: "Invalid Token" });
				return;
			}

			req.user = decoded;

			const { qaId } = req.params;
			const qa = await Qa.findOne({ _id: qaId });

			if (!qa) {
				res.status(403).json({ message: "QA not Found! 😒" });
				return;
			}

			if (qa.userId.equals((req as any).user?.userId)) {
				next();
			} else {
				res.status(400).json({
					message: "Unauthorized! You are not the owner of this QA",
				});
			}
		});
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error", error });
	}
};

export const verifyTodoOwner = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const token =
			req.headers.authorization && req.headers.authorization.split(" ")[1];

		if (!token) {
			res.status(403).json({ message: "Unauthorized! No Token Provided" });
			return;
		}

		jwt.verify(token, process.env.SECRET_TOKEN!, async (err, decoded: any) => {
			if (err) {
				res.status(403).json({ message: "Invalid Token" });
				return;
			}

			req.user = decoded;

			const { todoId } = req.params;
			const todo = await Todo.findOne({ _id: todoId });

			if (!todo) {
				res.status(403).json({ message: "Todo Not Found! ❌" });
				return;
			}

			if (todo.userId.equals((req as any).user?.userId)) {
				next();
			} else {
				res.status(400).json({
					message: "Unauthorized! You are not the owner of this Todo",
				});
			}
		});
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error", error });
	}
};

export const verifyToken = (
	req: CustomRequest,
	res: Response,
	next: NextFunction
): void => {
	const token = req.headers.authorization
		? req.headers.authorization.split(" ")[1]
		: req.cookies?.token;
	// console.log("token in middleware", req?.cookies);

	if (!token) {
		res.status(403).json({ message: "No token provided" });
		return;
	}

	jwt.verify(
		token,
		process.env.SECRET_TOKEN as string,
		(err: any, decoded: any) => {
			if (err) {
				res.status(401).json({ message: "Unauthorized! Invalid token", err });
				return;
			}

			console.log("decoded", decoded);
			req.user = decoded;
			next();
		}
	);
};
