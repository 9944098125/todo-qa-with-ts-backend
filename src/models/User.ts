import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			unique: true,
		},
		password: {
			type: String,
		},
		profilePicture: {
			type: String,
		},
		phone: {
			type: String,
			unique: true,
			required: true,
		},
		bio: {
			type: String,
		},
		isAdmin: {
			type: Boolean,
		},
	},
	{ timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
