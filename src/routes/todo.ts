import express from "express";
import { verifyTodoOwner, verifyToken } from "../middleware/verify";
import {
	createTodo,
	deleteTodo,
	generateTodoDescription,
	getTodoWithUserId,
	updateTodo,
} from "../controllers/todo";

const router = express.Router();

router.route("/create").post(verifyToken, createTodo);

router.route("/:userId").get(verifyToken, getTodoWithUserId);

router.route("/:todoId").patch(verifyTodoOwner, updateTodo);

router.route("/:todoId/:userId").delete(verifyTodoOwner, deleteTodo);

router
	.route("/generate-todo-description")
	.post(verifyToken, generateTodoDescription);

export default router;
