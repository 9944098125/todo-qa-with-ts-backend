import User from "../models/User";
import bcryptJS from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../helpers/registerEmail";
import { sendLoginEmail } from "../helpers/sendLoginEmail";

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
// Create a configuration with your OpenAI API key
const openAI = new OpenAI({
	apiKey: process.env.OPEN_AI_API_KEY,
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
			res.status(400).json({
				message: `${email} is already used ! Please try some other email... 🚫`,
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
		sendRegistrationEmail(email, name);
		res.status(201).json({
			message: `Congratulations ${name}!! You have registered successfully 🤩`,
		});
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
	// console.log(req.body);
	try {
		// check if the req has email or not
		const isEmail = /^\S+@\S+\.\S+$/.test(emailOrPhone);

		const query = isEmail ? { email: emailOrPhone } : { phone: emailOrPhone };
		// console.log(OrPhone, password);
		const existingUser = await User.findOne(query);
		if (!existingUser) {
			res
				.status(400)
				.json({ message: "No User with this email or Phone...❌" });
			return;
		}
		const passwordMatches = await bcryptJS.compare(
			password,
			existingUser.password
		);
		if (!passwordMatches) {
			res.status(504).json({ message: "Wrong Password !" });
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
		res.status(200).json({
			message: "Login Success ✅",
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
		const users = await User.find({});
		res.status(200).json({
			message: "Users fetched successfully ✅",
			users: users,
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
			res.status(404).json({
				message: `User with id ${userId} does not exist 🚫`,
			});
			return;
		}
		res.status(200).json({
			message: `${user?.name} has been fetched successfully 🤩`,
			user: user,
		});
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
			res.status(404).json({
				message: `User with id ${userId} does not exist 🚫`,
			});
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
		res.status(200).json({
			message: `Hola, ${user?.name} updated successfully 🤩`,
			user: updatedUserWithoutPassword,
		});
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
			res.status(404).json({
				message: `User with id ${userId} does not exist 🚫`,
			});
			return;
		}
		const isPasswordCorrect = bcryptJS.compareSync(oldPassword, user.password);
		if (!isPasswordCorrect) {
			res.status(400).json({
				message: `Incorrect old password! Please try again... 😒`,
			});
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
		res.status(200).json({
			message: `Hola, ${user?.name} updated your password successfully 🤩`,
		});
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
			res.status(404).json({
				message: `User with id ${userId} does not exist 🚫`,
			});
			return;
		}
		await User.findByIdAndDelete({ _id: userId });
		res.status(200).json({
			message: `Hola, ${user?.name}'s account is deleted successfully 🤩`,
		});
	} catch (error) {
		next(error);
	}
};

export const generateProfilePicture = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { gender, userId } = req.body;

	if (!gender || (gender !== "male" && gender !== "female")) {
		res
			.status(400)
			.json({ error: "Please provide a valid gender (male, female)." });
		return;
	}

	try {
		// Prompt OpenAI's DALL·E model to generate an avatar based on gender
		const prompt = `A professional profile photo of a ${gender} person in a professional setting`;

		const response = await openAI.images.generate({
			prompt: prompt, // Text prompt for image generation
			n: 1, // Generate 1 image
			size: "512x512", // Image size (can be customized)
		});

		// Get the generated image URL
		const imageUrl = response.data[0].url;

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ profilePicture: imageUrl },
			{ new: true }
		);

		// Send the avatar image URL in response
		res.json({ user: updatedUser });
	} catch (error) {
		next(error);
	}
};
