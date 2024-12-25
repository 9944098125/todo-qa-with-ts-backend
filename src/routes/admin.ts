import { verifyAdmin } from "./../middleware/verify";
import express, { NextFunction, Request, Response } from "express";
import {
	createQaForAUser,
	createTodoForAUser,
	deleteAUser,
	deleteQaOfAUser,
	deleteTodoOfAUser,
	getAllUsersList,
	getQaOfAUser,
	getTodoOfAUser,
	updatedUserByAdmin,
	updateQaOfAUser,
	updateTodoOfAUser,
	userCreatedByAdmin,
} from "../controllers/admin";
import { getUserWithId } from "../controllers/auth";

const router = express.Router();

router.route("/createUser/:adminId").post(verifyAdmin, userCreatedByAdmin);

router.route("/users").get(verifyAdmin, getAllUsersList);

router.route("/user/:userId").get(verifyAdmin, getUserWithId);

router.route("/updateUser/:userId").patch(verifyAdmin, updatedUserByAdmin);

router.route("/deleteUser/:userId/:adminId").delete(verifyAdmin, deleteAUser);

router.route("/createQa/:userId/:adminId").post(verifyAdmin, createQaForAUser);

router.route("/qa/:userId/:toolId").get(verifyAdmin, getQaOfAUser);

router
	.route("/updateQa/:userId/:qaId/:adminId")
	.patch(verifyAdmin, updateQaOfAUser);

router
	.route("/deleteQa/:userId/:qaId/:adminId")
	.delete(verifyAdmin, deleteQaOfAUser);

router
	.route("/createTodo/:userId/:adminId")
	.post(verifyAdmin, createTodoForAUser);

router.route("/todo/:userId/:adminId").get(verifyAdmin, getTodoOfAUser);

router
	.route("/updateTodo/:userId/:todoId/:adminId")
	.patch(verifyAdmin, updateTodoOfAUser);

router
	.route("/deleteTodo/:userId/:todoId/:adminId")
	.delete(verifyAdmin, deleteTodoOfAUser);

export default router;
