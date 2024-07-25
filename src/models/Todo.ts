import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			unique: true,
		},
		description: {
			type: String,
			required: true,
		},
		urgency: {
			type: Boolean,
			default: false,
		},
		deadline: {
			type: String,
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

const Todo = mongoose.models.Todo || mongoose.model("Todo", todoSchema);

export default Todo;
