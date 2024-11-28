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
			default: "7995643201",
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
		githubId: {
			type: String,
		},
	},
	{ timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
