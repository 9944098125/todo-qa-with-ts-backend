import mongoose from "mongoose";

export async function connect() {
	try {
		await mongoose.connect(process.env.MONGO_URI!);
		console.log("MongoDB Database Connected Successfully 🤩");
	} catch (err: any) {
		throw new Error(err);
	}
}

mongoose.connection.on("connected", () => {
	console.log("Connecting to MongoDB Database...");
});

mongoose.connection.on("error", (err: any) => {
	console.log(`Error connecting to MongoDB Database: ${err.message}`);
});
