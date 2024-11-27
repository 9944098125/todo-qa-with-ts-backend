import session from "express-session";

declare module "express-session" {
	interface SessionData {
		user?: { [key: string]: any }; // Define the structure of session data you use.
	}
}
