import { verifyQaOwner, verifyToken } from "./../middleware/verify";
import express from "express";
import { createQa, deleteQa, getQa, updateQa } from "../controllers/qa";

const router = express.Router();

router.route("/create").post(verifyToken, createQa);

router.route("/:userId/:toolId").get(verifyToken, getQa);

router.route("/:qaId/:userId").patch(verifyQaOwner, updateQa);

router.route("/:qaId/:userId").delete(verifyQaOwner, deleteQa);

export default router;
