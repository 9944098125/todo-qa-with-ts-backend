import { NextFunction, Request, Response } from "express";
import Todo from "../models/Todo";
import User from "../models/User";
import OpenAI from "openai";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
// Create a configuration with your OpenAI API key
const openAI = new OpenAI({
	apiKey: process.env.OPEN_AI_API_KEY,
});
// open ai api key

export const createTodo = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { title, description, urgency, deadline, userId } = req.body;
		const user = await User.findOne({ _id: userId });
		const newTodo = new Todo({
			title,
			description,
			urgency,
			deadline,
			userId,
		});
		await newTodo.save();
		res.status(201).json({
			message: `Hola ${user?.name}, you have created a new todo ${newTodo.title} 🤩`,
			todo: newTodo,
		});
	} catch (err: any) {
		next(err);
	}
};

export const getTodoWithUserId = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { userId } = req.params;
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 20;
		const skip = (page - 1) * pageSize;

		const user = await User.findOne({ _id: userId });
		
		// Get total count for pagination
		const totalDocuments = await Todo.countDocuments({ userId });
		const totalPages = Math.ceil(totalDocuments / pageSize);
		
		// Get paginated todo list
		const todoList = await Todo.find({ userId })
			.skip(skip)
			.limit(pageSize)
			.sort({ createdAt: -1 });

		// Generate request ID
		const requestId = uuidv4();
		
		// Construct URL for meta
		const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

		res.status(200).json({
			status: 200,
			statusText: "OK",
			data: {
				pageNumber: page.toString(),
				pageSize: pageSize,
				totalPages: totalPages,
				totalDocuments: totalDocuments,
				documents: todoList
			},
			meta: {
				requestId: requestId,
				url: baseUrl
			}
		});
	} catch (err: any) {
		next(err);
	}
};

export const updateTodo = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { todoId } = req.params;
		const { title, description, urgency, deadline, userId } = req.body;
		const user = await User.findOne({ _id: userId });
		const updatedTodo = await Todo.findByIdAndUpdate(
			todoId,
			{
				title,
				description,
				urgency,
				deadline,
				userId,
			},
			{ new: true }
		);
		res.status(200).json({
			message: `Hola ${user?.name}, you have updated the todo ${updatedTodo?.title} successfully 🤩`,
			todo: updatedTodo,
		});
	} catch (err: any) {
		next(err);
	}
};

export const deleteTodo = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { todoId } = req.params;
		const user = await User.findOne({ _id: req.params.userId });
		await Todo.findByIdAndDelete(todoId);
		res.status(200).json({
			message: `Hola ${user?.name}, you have deleted the todo successfully 🤩`,
		});
	} catch (err: any) {
		next(err);
	}
};

export const generateTodoDescription = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { todoTitle } = req.body;

		if (!todoTitle) {
			res.status(400).json({ error: "Todo Title is required" });
			return;
		}
		const completion = await openAI.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are an expert in allocating work for the given task names.",
				},
				{
					role: "user",
					content: todoTitle,
				},
			],
			max_tokens: 50,
		});

		const generatedTodoDescription = completion.choices[0].message.content;

		res.status(200).json({ generatedTodoDescription });
		return;
	} catch (error) {
		next(error);
	}
};
