import { NextFunction, Request, Response } from "express";
import Todo from "../models/Todo";
import User from "../models/User";

export const createTodo = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
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
) => {
	try {
		const { userId } = req.params;
		const user = await User.findOne({ _id: userId });
		const todoList = await Todo.find({ userId });
		res.status(200).json({
			message: `Hola ${user?.name}, here is your todo list 🤩`,
			todoList: todoList,
		});
	} catch (err: any) {
		next(err);
	}
};

export const updateTodo = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
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
) => {
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
