"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const qa_1 = __importDefault(require("./routes/qa"));
const todo_1 = __importDefault(require("./routes/todo"));
const admin_1 = __importDefault(require("./routes/admin"));
const db_1 = require("./dbConnection/db");
const search_1 = __importDefault(require("./routes/search"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "https://todo-qa-frontend.vercel.app",
    methods: "GET,POST,PATCH,PUT,DELETE",
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// use the routes here
app.use("/api/auth", auth_1.default);
app.use("/api/qa", qa_1.default);
app.use("/api/todo", todo_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api", search_1.default);
app.use((error, req, res, next) => {
    const errStatus = error.status || 500;
    const errMessage = error.message || "Something went wrong";
    res.status(errStatus).json({
        message: errMessage,
        success: false,
        stack: error.stack,
    });
    return;
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
    (0, db_1.connect)();
    console.log(`Server is running on ${port}`);
});
// command to get secret token
// require('crypto').randomBytes(64).toString('hex')
