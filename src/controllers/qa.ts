import { NextFunction, Request, Response } from "express";
import Qa from "../models/Qa";
import User from "../models/User";
import OpenAI from "openai";
import dotenv from "dotenv";
import {
	getPagination,
	sendError,
	sendPaginated,
	sendSuccess,
	totalPages,
} from "../helpers/response";

dotenv.config();
// Create a configuration with your OpenAI API key
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost",   // REQUIRED
    "X-Title": "My MERN App"               // REQUIRED
  }
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

		sendSuccess(
			req,
			res,
			201,
			`Hola, ${user?.name}, now you question ${questionString
				.slice(0, 3)
				.join(" ")}... has been saved to your database 🤩`,
			{ qa: newQa }
		);
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
		const user = await User.findOne({ _id: userId });
		const { page, limit, skip } = getPagination(req, 10);
		const filter = { userId, toolId };
		const totalDocuments = await Qa.countDocuments(filter);
		const qaSet = await Qa.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		sendPaginated(req, res, {
			message: `Hola, ${user?.name}, here is your saved QA set for this tool 🤩`,
			documents: qaSet,
			pageNumber: page,
			pageSize: limit,
			totalPages: totalPages(totalDocuments, limit),
			totalDocuments,
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
		sendSuccess(
			req,
			res,
			200,
			`Hola ${user?.name}, you have updated this QA`,
			{ qa: updatedQa }
		);
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
		sendSuccess(
			req,
			res,
			200,
			`Hola ${user?.name}, you have deleted this QA`
		);
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
      sendError(req, res, 400, "Question is required");
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct", // safe OpenRouter model
      messages: [
        {
          role: "system",
          content:
            "You are an expert software engineer specializing in web development. Answer clearly and concisely. Return ONLY the answer text."
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 300,
      temperature: 0.4
    });

    const generatedAnswer =
      completion.choices?.[0]?.message?.content?.trim();

    if (!generatedAnswer) {
      sendError(req, res, 500, "AI failed to generate an answer");
      return;
    }

    sendSuccess(req, res, 200, "Answer generated successfully", {
      generatedAnswer,
    });
  } catch (error) {
    next(error);
  }
};
