import nodemailer, {
	Transporter,
	SendMailOptions,
	SentMessageInfo,
} from "nodemailer";

export async function sendLoginEmail(
	email: string,
	name: string
): Promise<void> {
	try {
		// Create a transporter using your email service credentials
		const transporter: Transporter = nodemailer.createTransport({
			service: "Gmail", // service provider
			auth: {
				user: "srinivas72075@gmail.com",
				pass: "rvtn mpnt moyb ofjr",
			},
		});

		// Email content
		const mailOptions: SendMailOptions = {
			from: "srinivas72075@gmail.com",
			to: email,
			subject: "Logged In !",
			html: `
       You have successfully logged in as ${name} into Todo&QA application.
      `,
		};

		// Send the email
		const info: SentMessageInfo = await transporter.sendMail(mailOptions);
		// console.log("Email sent:", info.messageId);
	} catch (error) {
		console.error("Error sending email:", error);
	}
}
