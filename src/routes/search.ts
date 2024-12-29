import express from "express";
import { searchItems } from "../controllers/search";

const router = express.Router();

router.route("/search").get(searchItems as any);

export default router;
