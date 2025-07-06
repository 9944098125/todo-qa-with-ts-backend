import { NextFunction, Request, Response } from "express";
import Qa from "../models/Qa";
import User from "../models/User";
import OpenAI from "openai";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
// Create a configuration with your OpenAI API key
const openAI = new OpenAI({
	apiKey: process.env.OPEN_AI_API_KEY,
});

export const createQa = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { question, answer, userId, toolId, importance } = req.body;

		const user = await User.findOne({ _id: userId });

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
): Promise<void> => {
	try {
		const { userId, toolId } = req.params;
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 20;
		const skip = (page - 1) * pageSize;

		const user = await User.findOne({ _id: userId });
		
		// Get total count for pagination
		const totalDocuments = await Qa.countDocuments({ userId, toolId });
		const totalPages = Math.ceil(totalDocuments / pageSize);
		
		// Get paginated qa list
		const qaSet = await Qa.find({ userId, toolId })
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
				documents: qaSet
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

export const updateQa = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
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
): Promise<void> => {
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
): Promise<void> => {
	try {
		const { question } = req.body;

		if (!question) {
			res.status(400).json({ error: "Question is required" });
			return;
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

		res.status(200).json({ generatedAnswer });
		return;
	} catch (error) {
		next(error);
	}
};
