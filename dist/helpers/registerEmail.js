"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRegistrationEmail = sendRegistrationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
function sendRegistrationEmail(email, name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create a transporter using your email service credentials
            const transporter = nodemailer_1.default.createTransport({
                service: "Gmail", // service provider
                auth: {
                    user: "srinivas72075@gmail.com",
                    pass: "ifhp vypf rhqb ubpw",
                },
            });
            // Email content
            const mailOptions = {
                from: "srinivas72075@gmail.com",
                to: email,
                subject: "Welcome, you are a member of our App now...",
                html: `
       You have successfully registered
       with us ${name}, Login and 
       enjoy creating TODO's and saving valuable questions & answers...
      `,
            };
            // Send the email
            const info = yield transporter.sendMail(mailOptions);
            // console.log("Email sent:", info.messageId);
        }
        catch (error) {
            console.error("Error sending email:", error);
        }
    });
}
