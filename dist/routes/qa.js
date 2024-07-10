"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verify_1 = require("./../middleware/verify");
const express_1 = __importDefault(require("express"));
const qa_1 = require("../controllers/qa");
const router = express_1.default.Router();
router.route("/create").post(verify_1.verifyToken, qa_1.createQa);
router.route("/:userId/:toolId").get(verify_1.verifyToken, qa_1.getQa);
router.route("/:qaId/:userId").patch(verify_1.verifyQaOwner, qa_1.updateQa);
router.route("/:qaId/:userId").delete(verify_1.verifyQaOwner, qa_1.deleteQa);
exports.default = router;
