import { NextFunction, Request, Response } from "express";
import Todo from "../models/Todo";
import User from "../models/User";
import OpenAI from "openai";
import dotenv from "dotenv";
import {
	getPagination,
	sendError,
	sendPaginated,
	sendSuccess,
	totalPages,
} from "../helpers/response";

dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost", // REQUIRED
    "X-Title": "My MERN App"             // REQUIRED
  }
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
		sendSuccess(
			req,
			res,
			201,
			`Hola ${user?.name}, you have created a new todo ${newTodo.title} 🤩`,
			{ todo: newTodo }
		);
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
		const user = await User.findOne({ _id: userId });
		const { page, limit, skip } = getPagination(req, 10);
		const totalDocuments = await Todo.countDocuments({ userId });
		const todoList = await Todo.find({ userId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		sendPaginated(req, res, {
			message: `Hola ${user?.name}, here is your todo list 🤩`,
			documents: todoList,
			pageNumber: page,
			pageSize: limit,
			totalPages: totalPages(totalDocuments, limit),
			totalDocuments,
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
		sendSuccess(
			req,
			res,
			200,
			`Hola ${user?.name}, you have updated the todo ${updatedTodo?.title} successfully 🤩`,
			{ todo: updatedTodo }
		);
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
		sendSuccess(
			req,
			res,
			200,
			`Hola ${user?.name}, you have deleted the todo successfully 🤩`
		);
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
      sendError(req, res, 400, "Todo title is required");
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct", // safe + fast
      messages: [
        {
          role: "system",
          content:
            "You are a productivity assistant. Generate a short, clear task description based on the given title. Return ONLY the description text. No headings, no quotes."
        },
        {
          role: "user",
          content: todoTitle
        }
      ],
      max_tokens: 60,
      temperature: 0.3
    });

    const generatedTodoDescription =
      completion.choices?.[0]?.message?.content?.trim();

    if (!generatedTodoDescription) {
      sendError(req, res, 500, "AI failed to generate todo description");
      return;
    }

    sendSuccess(req, res, 200, "Todo description generated successfully", {
      generatedTodoDescription,
    });
  } catch (error) {
    next(error);
  }
};
