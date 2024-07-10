import mongoose from "mongoose";

const qaSchema = new mongoose.Schema(
	{
		question: {
			type: String,
			required: true,
		},
		answer: {
			type: String,
			required: true,
		},
		importance: {
			type: String,
			enum: ["Important", "Very Important", "Not Important"],
			default: "Not Important",
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		toolId: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Qa = mongoose.models.Qa || mongoose.model("Qa", qaSchema);

export default Qa;
