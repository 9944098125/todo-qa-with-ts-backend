"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verify_1 = require("../middleware/verify");
const todo_1 = require("../controllers/todo");
const router = express_1.default.Router();
router.route("/create").post(verify_1.verifyToken, todo_1.createTodo);
router.route("/:userId").get(verify_1.verifyToken, todo_1.getTodoWithUserId);
router.route("/:todoId").patch(verify_1.verifyTodoOwner, todo_1.updateTodo);
router.route("/:todoId/:userId").delete(verify_1.verifyTodoOwner, todo_1.deleteTodo);
router
    .route("generate-todo-description")
    .post(verify_1.verifyToken, todo_1.generateTodoDescription);
exports.default = router;
