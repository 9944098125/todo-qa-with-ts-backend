import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import Qa from "../models/Qa";
import Todo from "../models/Todo";
import bcryptJS from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const userCreatedByAdmin = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { name, email, password, phone, profilePicture, bio, isAdmin } =
			req.body;
		const { adminId } = req.params;
		const admin = await User.findOne({ _id: adminId });
		const invalidUser = await User.findOne({ email });
		if (invalidUser) {
			res.status(403).json({
				message: `Already a user exists with this email ${email}, try some other email address ❌`,
			});
			return;
		}
		const saltRounds = bcryptJS.genSaltSync(12);
		const hashedPassword = bcryptJS.hashSync(password, saltRounds);
		const newUser = new User({
			name,
			email,
			password: hashedPassword,
			phone,
			profilePicture,
			bio,
			isAdmin,
		});
		await newUser.save();
		res.status(201).json({
			message: `Hola ${admin.name}, you have successfully create a new user ${name}`,
			user: newUser,
		});
	} catch (err: any) {
		next(err);
	}
};

export const getAllUsersList = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 20;
		const skip = (page - 1) * pageSize;

		// Get total count for pagination
		const totalDocuments = await User.countDocuments();
		const totalPages = Math.ceil(totalDocuments / pageSize);
		
		// Get paginated users list
		const users = await User.find()
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
				documents: users
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

export const getAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { userId } = req.params;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			res.status(403).json({
				message: "No User with this ID",
			});
			return;
		}
		res.status(200).json({
			user: user,
			message: `Fetched ${user.name} details successfully !`,
		});
	} catch (err: any) {
		next(err);
	}
};

export const updatedUserByAdmin = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { userId } = req.params;
		const user = await User.findById({ _id: userId });
		if (!user) {
			res.status(404).json({
				message: `User with id ${userId} does not exist 🚫`,
			});
			return;
		}
		if (user.isAdmin) {
			res.status(403).json({
				message: `This user ${user.name} is also an admin, so you can't make changes to this user 🚫`,
			});
			return;
		}
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ $set: req.body },
			{ new: true, runValidators: true }
		);
		await updatedUser.save();
		res.status(200).json({
			message: `Hola, ${user.name}, you have updated your profile successfully 🤩`,
			user: updatedUser,
		});
	} catch (err: any) {
		next(err);
	}
};

export const deleteAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { userId, adminId } = req.params;
		const user = await User.findById({ _id: userId });
		const admin = await User.findOne({ _id: adminId });
		if (!user) {
			res.status(404).json({
				message: `User with id ${userId} does not exist 🚫`,
			});
			return;
		}
		if (user.isAdmin) {
			res.status(403).json({
				message: `This user ${user.name} is also an admin, so you can't delete this user 🚫`,
			});
			return;
		}
		await User.deleteOne({ _id: userId });
		res.status(200).json({
			message: `Hola, ${admin.name}, you have deleted ${user.name}'s profile successfully 🤩`,
			user: user,
		});
	} catch (err: any) {
		next(err);
	}
};

export const createQaForAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { question, answer, importance, toolId } = req.body;
		const { userId, adminId } = req.params;
		const admin = await User.findOne({ _id: adminId });
		const user = await User.findOne({ _id: userId });
		const newQa = new Qa({
			question,
			answer,
			importance,
			toolId,
			userId,
		});
		await newQa.save();
		// console.log(newQa);
		res.status(201).json({
			message: `Hola, ${admin.name}, you have created a new QA for ${user.name} successfully 🤩`,
			qa: newQa,
		});
	} catch (err: any) {
		next(err);
	}
};

export const getQaOfAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { userId, toolId } = req.params;
		const user = await User.findOne({ _id: userId });
		const qaListOfAUser = await Qa.find({ userId, toolId });
		res.status(200).json({
			message: `Hola, ${user.name}, you have fetched all the QAs of ${user.name} successfully 🤩`,
			qas: qaListOfAUser,
		});
	} catch (err: any) {
		next(err);
	}
};

export const updateQaOfAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { question, answer, importance, toolId } = req.body;
		const { userId, qaId, adminId } = req.params;
		const user = await User.findOne({ _id: userId });
		const admin = await User.findOne({ _id: adminId });
		await Qa.findByIdAndUpdate(
			{ _id: qaId },
			{
				question,
				answer,
				importance,
				toolId,
			},
			{ new: true }
		);
		res.status(200).json({
			message: `Hola, ${admin.name}, you have updated the QA of ${user.name} successfully 🤩`,
		});
	} catch (err: any) {
		next(err);
	}
};

export const deleteQaOfAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { userId, qaId, adminId } = req.params;
		const user = await User.findOne({ _id: userId });
		const admin = await User.findOne({ _id: adminId });
		const qa = await Qa.findOne({ _id: qaId });
		if (!qa) {
			res.status(403).json({
				message: `This QA does not exist🚫`,
			});
			return;
		}
		await Qa.findByIdAndDelete({ _id: qaId });
		res.status(200).json({
			message: `Hola, ${admin.name}, you have deleted the QA of ${user.name} successfully 🤩`,
		});
	} catch (err: any) {
		next(err);
	}
};

export const createTodoForAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { title, description, urgency, deadline } = req.body;
		const { userId, adminId } = req.params;
		const admin = await User.findOne({ _id: adminId });
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
			message: `Hola, ${admin.name}, you have created a new Todo for ${user.name} successfully 🤩`,
			todo: newTodo,
		});
	} catch (err: any) {
		next(err);
	}
};

export const getTodoOfAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { userId, adminId } = req.params;
		const user = await User.findOne({ _id: userId });
		const admin = await User.findOne({ _id: adminId });
		const todoListOfAUser = await Todo.find({ userId: userId });
		res.status(200).json({
			message: `Hola, ${admin.name}, you have fetched the todo list of ${user.name} successfully 🤩`,
			todoList: todoListOfAUser,
		});
	} catch (err: any) {
		next(err);
	}
};

export const updateTodoOfAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { title, description, urgency, deadline } = req.body;
		const { userId, todoId, adminId } = req.params;
		const user = await User.findOne({ _id: userId });
		const admin = await User.findOne({ _id: adminId });
		await Todo.findByIdAndUpdate(
			{ _id: todoId },
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
			message: `Hola, ${admin.name}, you have updated the todo of ${user.name} successfully 🤩`,
		});
	} catch (err: any) {
		next(err);
	}
};

export const deleteTodoOfAUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { userId, todoId, adminId } = req.params;
		const user = await User.findOne({ _id: userId });
		const admin = await User.findOne({ _id: adminId });
		await Todo.findByIdAndDelete({ _id: todoId });
		res.status(200).json({
			message: `Hola, ${admin.name}, you have deleted the todo of ${user.name} successfully 🤩`,
		});
	} catch (err: any) {
		next(err);
	}
};
