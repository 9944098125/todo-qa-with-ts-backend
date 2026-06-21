import { NextFunction, Request, Response } from "express";
import Qa from "../models/Qa";
import User from "../models/User";
import Todo from "../models/Todo";
import { sendError, sendSuccess } from "../helpers/response";

export const searchItems = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { type, query } = req.query;

		if (!type || !query) {
			sendError(req, res, 400, "Search Content is required");
			return;
		}

		let results = [];

		// Handle search by type
		switch (type) {
			case "users":
				results = await User.find({
					name: { $regex: query, $options: "i" }, // Case-insensitive regex
				});
				break;

			case "todo-items":
				results = await Todo.find({
					title: { $regex: query, $options: "i" }, // Case-insensitive regex
				});
				break;

			case "qa-items":
				results = await Qa.find({
					question: { $regex: query, $options: "i" }, // Case-insensitive regex
				});
				break;

			default:
				sendError(req, res, 400, "Invalid search type");
				return;
		}

		sendSuccess(req, res, 200, "Search results fetched successfully", {
			results,
		});
	} catch (error: any) {
		next(error);
	}
};
