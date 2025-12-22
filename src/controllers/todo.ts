import { NextFunction, Request, Response } from "express";
import Todo from "../models/Todo";
import User from "../models/User";
import OpenAI from "openai";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

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
      res.status(400).json({ error: "Todo title is required" });
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
      res.status(500).json({
        error: "AI failed to generate todo description"
      });
      return;
    }

    res.status(200).json({
      generatedTodoDescription
    });
  } catch (error) {
    next(error);
  }
};
