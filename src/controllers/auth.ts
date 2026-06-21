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

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost",   // REQUIRED
    "X-Title": "My MERN App"               // REQUIRED
  }
});

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { name, email, password, phone, profilePicture, bio, isAdmin } =
			req.body;
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			sendError(
				req,
				res,
				400,
				`${email} is already used ! Please try some other email... 🚫`
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
		sendRegistrationEmail(email, name);
		sendSuccess(
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
): Promise<void> => {
	const { emailOrPhone, password } = req.body;
	try {
		// check if the req has email or not
		const isEmail = /^\S+@\S+\.\S+$/.test(emailOrPhone);

		const query = isEmail ? { email: emailOrPhone } : { phone: emailOrPhone };
		const existingUser = await User.findOne(query);
		if (!existingUser) {
			sendError(req, res, 400, "No User with this email or Phone...❌");
			return;
		}
		const passwordMatches = await bcryptJS.compare(
			password,
			existingUser.password
		);
		if (!passwordMatches) {
			sendError(req, res, 504, "Wrong Password !");
			return;
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
		sendSuccess(req, res, 200, "Login Success ✅", {
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
): Promise<void> => {
	try {
		const { page, limit, skip } = getPagination(req, 10);
		const totalDocuments = await User.countDocuments({});
		const users = await User.find({})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		sendPaginated(req, res, {
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
): Promise<void> => {
	try {
		const { userId } = req.params;
		const user = await User.findById({ _id: userId });
		if (!user) {
			sendError(req, res, 404, `User with id ${userId} does not exist 🚫`);
			return;
		}
		sendSuccess(
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
): Promise<void> => {
	try {
		const { userId } = req.params;
		const { name, email, phone, profilePicture, bio } = req.body;
		const user = await User.findById({ _id: userId });
		if (!user) {
			sendError(req, res, 404, `User with id ${userId} does not exist 🚫`);
			return;
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
		sendSuccess(
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
): Promise<void> => {
	try {
		const { userId } = req.params;
		const { oldPassword, newPassword } = req.body;
		const user = await User.findById({ _id: userId });
		if (!user) {
			sendError(req, res, 404, `User with id ${userId} does not exist 🚫`);
			return;
		}
		const isPasswordCorrect = bcryptJS.compareSync(oldPassword, user.password);
		if (!isPasswordCorrect) {
			sendError(
				req,
				res,
				400,
				`Incorrect old password! Please try again... 😒`
			);
			return;
		}
		const saltRounds = bcryptJS.genSaltSync(12);
		const hashedPassword = bcryptJS.hashSync(newPassword, saltRounds);
		await User.findByIdAndUpdate(
			{ _id: userId },
			{
				password: hashedPassword,
			}
		);
		sendSuccess(
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
): Promise<void> => {
	try {
		const { userId } = req.params;
		const user = await User.findById({ _id: userId });
		if (!user) {
			sendError(req, res, 404, `User with id ${userId} does not exist 🚫`);
			return;
		}
		await User.findByIdAndDelete({ _id: userId });
		sendSuccess(
			req,
			res,
			200,
			`Hola, ${user?.name}'s account is deleted successfully 🤩`
		);
	} catch (error) {
		next(error);
	}
};

export const generateProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gender, userId } = req.body;

    if (!userId) {
      sendError(req, res, 400, "User ID is required.");
      return;
    }

    if (!gender || !["male", "female"].includes(gender)) {
      sendError(req, res, 400, "Gender must be either 'male' or 'female'.");
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(req, res, 404, "User not found.");
      return;
    }

    // Safe, professional prompt
    const prompt = `
A realistic, high-quality professional profile photo of a ${gender} person.
Clean background, studio lighting, confident expression.
Modern business-casual attire.
Photorealistic, LinkedIn-style headshot.
`;

    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "512x512"
    });

    const imageUrl = imageResponse.data?.[0]?.url;

    if (!imageUrl) {
      sendError(req, res, 500, "Image generation failed. Please try again.");
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    );

    sendSuccess(req, res, 200, "Profile picture generated successfully.", {
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
