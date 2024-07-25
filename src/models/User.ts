import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
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
		},
		bio: {
			type: String,
		},
		isAdmin: {
			type: Boolean,
		},
		googleId: {
			type: String,
		},
	},
	{ timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
