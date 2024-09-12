import { NextFunction, Request, Response } from "express";
import Qa from "../models/Qa";
import User from "../models/User";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
// Create a configuration with your OpenAI API key
const openAI = new OpenAI({
	apiKey: process.env.OPEN_AI_API_KEY,
});

export const createQa = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { question, answer, userId, toolId, importance } = req.body;
		const user = await User.findOne({ _id: userId });
		const existingQa = await Qa.findOne({ question });
		if (existingQa) {
			return res.status(400).json({
				message: `Come On ! ${user?.name}, this question already exists in your database 😒`,
			});
		}
		const newQa = new Qa({
			question,
			answer,
			userId,
			toolId,
			importance,
		});
		await newQa.save();
		const questionString = question.split(" ");
		res.status(201).json({
			message: `Hola, ${user?.name}, now you question ${questionString
				.slice(0, 3)
				.join(" ")}... has been saved to your database 🤩`,
			qa: newQa,
		});
	} catch (err: any) {
		next(err);
	}
};

export const getQa = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId, toolId } = req.params;
		const user = await User.findOne({ _id: userId });
		const qaSet = await Qa.find({ userId, toolId });
		res.status(200).json({
			message: `Hola, ${user?.name}, here is your saved QA set for this tool 🤩`,
			qa: qaSet,
		});
	} catch (err: any) {
		next(err);
	}
};

export const updateQa = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { qaId, userId } = req.params;
		const user = await User.findOne({ _id: userId });
		const updatedQa = await Qa.findByIdAndUpdate({ _id: qaId }, req.body, {
			new: true,
		});
		res.status(200).json({
			message: `Hola ${user?.name}, you have updated this QA`,
			qa: updatedQa,
		});
	} catch (err: any) {
		next(err);
	}
};

export const deleteQa = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { qaId, userId } = req.params;
		const user = await User.findOne({ _id: userId });
		await Qa.findByIdAndDelete({ _id: qaId });
		res.status(200).json({
			message: `Hola ${user?.name}, you have deleted this QA`,
		});
	} catch (err: any) {
		next(err);
	}
};

export const generateAnswerWithAI = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { question } = req.body;

		if (!question) {
			return res.status(400).json({ error: "Question is required" });
		}
		const completion = await openAI.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are an expert in answering web development questions regarding all the web technologies.",
				},
				{
					role: "user",
					content: question,
				},
			],
			max_tokens: 300,
		});

		const generatedAnswer = completion.choices[0].message.content;

		return res.status(200).json({ generatedAnswer });
	} catch (error) {
		next(error);
	}
};
