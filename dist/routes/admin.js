"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verify_1 = require("./../middleware/verify");
const express_1 = __importDefault(require("express"));
const admin_1 = require("../controllers/admin");
const auth_1 = require("../controllers/auth");
const router = express_1.default.Router();
router.route("/createUser/:adminId").post(verify_1.verifyAdmin, admin_1.userCreatedByAdmin);
router.route("/users").get(verify_1.verifyAdmin, admin_1.getAllUsersList);
router.route("/user/:userId").get(verify_1.verifyAdmin, auth_1.getUserWithId);
router.route("/updateUser/:userId").patch(verify_1.verifyAdmin, admin_1.updatedUserByAdmin);
router.route("/deleteUser/:userId/:adminId").delete(verify_1.verifyAdmin, admin_1.deleteAUser);
router.route("/createQa/:userId/:adminId").post(verify_1.verifyAdmin, admin_1.createQaForAUser);
router.route("/qa/:userId/:toolId").get(verify_1.verifyAdmin, admin_1.getQaOfAUser);
router
    .route("/updateQa/:userId/:qaId/:adminId")
    .patch(verify_1.verifyAdmin, admin_1.updateQaOfAUser);
router
    .route("/deleteQa/:userId/:qaId/:adminId")
    .delete(verify_1.verifyAdmin, admin_1.deleteQaOfAUser);
router
    .route("/createTodo/:userId/:adminId")
    .post(verify_1.verifyAdmin, admin_1.createTodoForAUser);
router.route("/todo/:userId/:adminId").get(verify_1.verifyAdmin, admin_1.getTodoOfAUser);
router
    .route("/updateTodo/:userId/:todoId/:adminId")
    .patch(verify_1.verifyAdmin, admin_1.updateTodoOfAUser);
router
    .route("/deleteTodo/:userId/:todoId/:adminId")
    .delete(verify_1.verifyAdmin, admin_1.deleteTodoOfAUser);
exports.default = router;
