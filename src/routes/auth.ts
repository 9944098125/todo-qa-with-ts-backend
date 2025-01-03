import { verifyToken } from "./../middleware/verify";
import express from "express";
import {
	deleteUser,
	generateProfilePicture,
	getAllUsers,
	getUserWithId,
	login,
	register,
	updatePassword,
	updateUser,
} from "../controllers/auth";

const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/:userId").get(getUserWithId);

router.route("/:userId").patch(verifyToken, updateUser);

router.route("/:userId/updatePassword").patch(verifyToken, updatePassword);

router.route("/").get(getAllUsers);

router.route("/:userId/delete").delete(verifyToken, deleteUser);

router.route("/generateImage").post(verifyToken, generateProfilePicture);

export default router;
// comment to push the code to git
