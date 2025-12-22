import User from "../models/User";
import bcryptJS from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../helpers/registerEmail";
import { sendLoginEmail } from "../helpers/sendLoginEmail";

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
		const user = await User.findOne({ _id: userId });
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

import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const generateProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gender, userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID is required." });
      return;
    }

    if (!gender || !["male", "female"].includes(gender)) {
      res.status(400).json({
        error: "Gender must be either 'male' or 'female'.",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found." });
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
      res.status(500).json({
        error: "Image generation failed. Please try again.",
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    );

    res.status(200).json({
      message: "Profile picture generated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

