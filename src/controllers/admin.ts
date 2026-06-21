import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import Qa from "../models/Qa";
import Todo from "../models/Todo";
import bcryptJS from "bcryptjs";
import {
	getPagination,
	sendError,
	sendPaginated,
	sendSuccess,
	totalPages,
} from "../helpers/response";

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
			sendError(
				req,
				res,
				403,
				`Already a user exists with this email ${email}, try some other email address ❌`
			);
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
		sendSuccess(
			req,
			res,
			201,
			`Hola ${admin.name}, you have successfully create a new user ${name}`,
			{ user: newUser }
		);
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
		const { page, limit, skip } = getPagination(req, 10);
		const totalDocuments = await User.countDocuments();
		const users = await User.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		sendPaginated(req, res, {
			message: "Fetched all the users list...",
			documents: users,
			pageNumber: page,
			pageSize: limit,
			totalPages: totalPages(totalDocuments, limit),
			totalDocuments,
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
			sendError(req, res, 403, "No User with this ID");
			return;
		}
		sendSuccess(
			req,
			res,
			200,
			`Fetched ${user.name} details successfully !`,
			{ user }
		);
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
			sendError(req, res, 404, `User with id ${userId} does not exist 🚫`);
			return;
		}
		if (user.isAdmin) {
			sendError(
				req,
				res,
				403,
				`This user ${user.name} is also an admin, so you can't make changes to this user 🚫`
			);
			return;
		}
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ $set: req.body },
			{ new: true, runValidators: true }
		);
		await updatedUser.save();
		sendSuccess(
			req,
			res,
			200,
			`Hola, ${user.name}, you have updated your profile successfully 🤩`,
			{ user: updatedUser }
		);
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
			sendError(req, res, 404, `User with id ${userId} does not exist 🚫`);
			return;
		}
		if (user.isAdmin) {
			sendError(
				req,
				res,
				403,
				`This user ${user.name} is also an admin, so you can't delete this user 🚫`
			);
			return;
		}
		await User.deleteOne({ _id: userId });
		sendSuccess(
			req,
			res,
			200,
			`Hola, ${admin.name}, you have deleted ${user.name}'s profile successfully 🤩`,
			{ user }
		);
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
		sendSuccess(
			req,
			res,
			201,
			`Hola, ${admin.name}, you have created a new QA for ${user.name} successfully 🤩`,
			{ qa: newQa }
		);
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
		const { userId } = req.params;
		const user = await User.findOne({ _id: userId });
		const { page, limit, skip } = getPagination(req, 10);
		const totalDocuments = await Qa.countDocuments({ userId });
		const qaListOfAUser = await Qa.find({ userId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		sendPaginated(req, res, {
			message: `Hola, ${user.name}, you have fetched all the QAs of ${user.name} successfully 🤩`,
			documents: qaListOfAUser,
			pageNumber: page,
			pageSize: limit,
			totalPages: totalPages(totalDocuments, limit),
			totalDocuments,
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
		const updatedQa = await Qa.findByIdAndUpdate(
			{ _id: qaId },
			{
				question,
				answer,
				importance,
				toolId,
			},
			{ new: true }
		);
		sendSuccess(
			req,
			res,
			200,
			`Hola, ${admin.name}, you have updated the QA of ${user.name} successfully 🤩`,
			{ qa: updatedQa }
		);
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
			sendError(req, res, 403, `This QA does not exist🚫`);
			return;
		}
		await Qa.findByIdAndDelete({ _id: qaId });
		sendSuccess(
			req,
			res,
			200,
			`Hola, ${admin.name}, you have deleted the QA of ${user.name} successfully 🤩`
		);
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
		sendSuccess(
			req,
			res,
			201,
			`Hola, ${admin.name}, you have created a new Todo for ${user.name} successfully 🤩`,
			{ todo: newTodo }
		);
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
		const { page, limit, skip } = getPagination(req, 10);
		const totalDocuments = await Todo.countDocuments({ userId });
		const todoListOfAUser = await Todo.find({ userId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		sendPaginated(req, res, {
			message: `Hola, ${admin.name}, you have fetched the todo list of ${user.name} successfully 🤩`,
			documents: todoListOfAUser,
			pageNumber: page,
			pageSize: limit,
			totalPages: totalPages(totalDocuments, limit),
			totalDocuments,
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
		const updatedTodo = await Todo.findByIdAndUpdate(
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
		sendSuccess(
			req,
			res,
			200,
			`Hola, ${admin.name}, you have updated the todo of ${user.name} successfully 🤩`,
			{ todo: updatedTodo }
		);
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
		sendSuccess(
			req,
			res,
			200,
			`Hola, ${admin.name}, you have deleted the todo of ${user.name} successfully 🤩`
		);
	} catch (err: any) {
		next(err);
	}
};
