import { verifyQaOwner, verifyToken } from "./../middleware/verify";
import express from "express";
import {
	createQa,
	deleteQa,
	generateAnswerWithAI,
	getQa,
	updateQa,
} from "../controllers/qa";

const router = express.Router();

router.route("/create").post(verifyToken, createQa);

router.route("/:userId/:toolId").get(verifyToken, getQa);

router.route("/:qaId/:userId").patch(verifyQaOwner, updateQa);

router.route("/:qaId/:userId").delete(verifyQaOwner, deleteQa);

router.route("/generate-answer").post(verifyToken, generateAnswerWithAI);

export default router;
