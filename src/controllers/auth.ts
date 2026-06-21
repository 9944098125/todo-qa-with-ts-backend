import User from "../models/User";
import bcryptJS from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../helpers/registerEmail";
import { sendLoginEmail } from "../helpers/sendLoginEmail";
import {
	getPagination,
	sendError,
	sendPaginated,
	sendSuccess,
	totalPages,
} from "../helpers/response";

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { name, email, password, phone, profilePicture, bio, isAdmin } =
			req.body;
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return sendError(
				req,
				res,
				400,
				`${email} is already used ! Please try some other email... 🚫`
			);
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
		sendRegistrationEmail(email, name);
		return sendSuccess(
			req,
			res,
			201,
			`Congratulations ${name}!! You have registered successfully 🤩`
		);
	} catch (error) {
		next(error);
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { emailOrPhone, password } = req.body;
	// console.log(req.body);
	try {
		// check if the req has email or not
		const isEmail = /^\S+@\S+\.\S+$/.test(emailOrPhone);

		const query = isEmail ? { email: emailOrPhone } : { phone: emailOrPhone };
		// console.log(OrPhone, password);
		const existingUser = await User.findOne(query);
		if (!existingUser) {
			return sendError(
				req,
				res,
				400,
				"No User with this email or Phone...❌"
			);
		}
		const passwordMatches = await bcryptJS.compare(
			password,
			existingUser.password
		);
		if (!passwordMatches) {
			return sendError(req, res, 504, "Wrong Password !");
		}
		const userWithoutPassword = await User.findOne(query).select("-password");
		const token = jwt.sign(
			{
				userId: existingUser._id,
				isAdmin: existingUser.isAdmin,
			},
			process.env.SECRET_TOKEN!
		);
		sendLoginEmail(existingUser.email, existingUser.name);
		return sendSuccess(req, res, 200, "Login Success ✅", {
			token: token,
			user: userWithoutPassword,
		});
	} catch (err: any) {
		next(err);
	}
};

export const getAllUsers = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { page, limit, skip } = getPagination(req, 10);
		const totalDocuments = await User.countDocuments({});
		const users = await User.find({})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		return sendPaginated(req, res, {
			message: "Users fetched successfully ✅",
			documents: users,
			pageNumber: page,
			pageSize: limit,
			totalPages: totalPages(totalDocuments, limit),
			totalDocuments,
		});
	} catch (error: any) {
		next(error);
	}
};

export const getUserWithId = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId } = req.params;
		const user = await User.findById({ _id: userId });
		if (!user) {
			return sendError(
				req,
				res,
				404,
				`User with id ${userId} does not exist 🚫`
			);
		}
		return sendSuccess(
			req,
			res,
			200,
			`${user?.name} has been fetched successfully 🤩`,
			{ user }
		);
	} catch (error) {
		next(error);
	}
};

export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId } = req.params;
		const { name, email, phone, profilePicture, bio } = req.body;
		const user = await User.findById({ _id: userId });
		if (!user) {
			return sendError(
				req,
				res,
				404,
				`User with id ${userId} does not exist 🚫`
			);
		}
		const updatedUser = await User.findByIdAndUpdate(
			{ _id: userId },
			{
				name,
				email,
				phone,
				profilePicture,
				bio,
			},
			{ new: true }
		);
		const updatedUserWithoutPassword = await User.findOne({
			_id: updatedUser?._id,
		}).select("-password");
		return sendSuccess(
			req,
			res,
			200,
			`Hola, ${user?.name} updated successfully 🤩`,
			{ user: updatedUserWithoutPassword }
		);
	} catch (error) {
		next(error);
	}
};

export const updatePassword = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId } = req.params;
		const { oldPassword, newPassword } = req.body;
		const user = await User.findById({ _id: userId });
		if (!user) {
			return sendError(
				req,
				res,
				404,
				`User with id ${userId} does not exist 🚫`
			);
		}
		const isPasswordCorrect = bcryptJS.compareSync(oldPassword, user.password);
		if (!isPasswordCorrect) {
			return sendError(
				req,
				res,
				400,
				`Incorrect old password! Please try again... 😒`
			);
		}
		const saltRounds = bcryptJS.genSaltSync(12);
		const hashedPassword = bcryptJS.hashSync(newPassword, saltRounds);
		await User.findByIdAndUpdate(
			{ _id: userId },
			{
				password: hashedPassword,
			}
		);
		return sendSuccess(
			req,
			res,
			200,
			`Hola, ${user?.name} updated your password successfully 🤩`
		);
	} catch (err: any) {
		next(err);
	}
};

export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId } = req.params;
		const user = await User.findById({ _id: userId });
		if (!user) {
			return sendError(
				req,
				res,
				404,
				`User with id ${userId} does not exist 🚫`
			);
		}
		await User.findByIdAndDelete({ _id: userId });
		return sendSuccess(
			req,
			res,
			200,
			`Hola, ${user?.name}'s account is deleted successfully 🤩`
		);
	} catch (error) {
		next(error);
	}
};
