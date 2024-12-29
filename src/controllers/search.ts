import { NextFunction, Request, Response } from "express";
import Qa from "../models/Qa";
import User from "../models/User";
import Todo from "../models/Todo";

export const searchItems = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { type, query } = req.query;

		if (!type || !query) {
			return res.status(400).json({ message: "Search Content is required" });
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
				return res.status(400).json({ message: "Invalid search type" });
		}

		res.status(200).json({ results });
	} catch (error: any) {
		next(error);
	}
};
