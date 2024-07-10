"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verify_1 = require("./../middleware/verify");
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const router = express_1.default.Router();
router.route("/register").post(auth_1.register);
router.route("/login").post(auth_1.login);
router.route("/:userId").get(auth_1.getUserWithId);
router.route("/:userId").patch(verify_1.verifyToken, auth_1.updateUser);
router.route("/:userId/updatePassword").patch(verify_1.verifyToken, auth_1.updatePassword);
router.route("/").get(auth_1.getAllUsers);
router.route("/:userId/delete").delete(verify_1.verifyToken, auth_1.deleteUser);
exports.default = router;
