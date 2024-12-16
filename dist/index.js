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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth2_1 = require("passport-google-oauth2");
const passport_github2_1 = require("passport-github2");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("./routes/auth"));
const qa_1 = __importDefault(require("./routes/qa"));
const todo_1 = __importDefault(require("./routes/todo"));
const admin_1 = __importDefault(require("./routes/admin"));
const db_1 = require("./dbConnection/db");
const User_1 = __importDefault(require("./models/User"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: "GET,POST,PATCH,PUT,DELETE",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.set("trust proxy", 1); // you need to add this
app.use((0, express_session_1.default)({
    secret: process.env.SECRET_TOKEN,
    resave: false,
    saveUninitialized: false,
    proxy: true, // this is optional it depend which server you host, i am not sure about Heroku if you need it or not
    cookie: {
        secure: "auto", // this will set to false on developement, but true on Heroku since is https so this setting is required
        maxAge: 10000, // 10 sec for testing
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //by default in developement this is false if you're in developement mode
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://todo-qa-with-ts-backend-production.up.railway.app/auth/google/callback",
    scope: ["profile", "email"],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let user = yield User_1.default.findOne({ googleId: profile.id });
        if (!user) {
            user = new User_1.default({
                name: profile === null || profile === void 0 ? void 0 : profile.displayName,
                email: profile === null || profile === void 0 ? void 0 : profile.emails[0].value,
                profilePicture: (_a = profile === null || profile === void 0 ? void 0 : profile.photos) === null || _a === void 0 ? void 0 : _a[0].value,
                googleId: profile === null || profile === void 0 ? void 0 : profile.id,
                phone: (profile === null || profile === void 0 ? void 0 : profile.phone) ? profile.phone : profile === null || profile === void 0 ? void 0 : profile.id,
            });
            console.log("user", user);
            yield user.save();
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            isAdmin: false,
        }, process.env.SECRET_TOKEN);
        const responseToFrontend = {
            user: user,
            token: token,
            message: "Login with Google success",
        };
        return done(null, responseToFrontend);
    }
    catch (err) {
        return done(err, null);
    }
})));
// reverting the changes
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://todo-qa-with-ts-backend-production.up.railway.app/auth/github/callback",
    scope: ["profile", "email"],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findOne({ githubId: profile.id });
        if (!user) {
            const newUser = new User_1.default({
                name: profile === null || profile === void 0 ? void 0 : profile.displayName,
                profilePicture: (_a = profile === null || profile === void 0 ? void 0 : profile.photos) === null || _a === void 0 ? void 0 : _a[0].value,
                githubId: profile === null || profile === void 0 ? void 0 : profile.id,
                phone: (profile === null || profile === void 0 ? void 0 : profile.phone) ? profile.phone : profile === null || profile === void 0 ? void 0 : profile.id,
            });
            console.log("user", user);
            yield newUser.save();
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            isAdmin: false,
        }, process.env.SECRET_TOKEN);
        const responseToFrontend = {
            user: user,
            token: token,
            message: "Login with Google success",
        };
        return done(null, responseToFrontend);
    }
    catch (err) {
        return done(err, null);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => __awaiter(void 0, void 0, void 0, function* () {
    done(null, user);
}));
app.get("/auth/google", passport_1.default.authenticate("google", {
    scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/user.phonenumbers.read",
    ],
}));
app.get("/auth/google/callback", passport_1.default.authenticate("google", {
    successRedirect: "http://localhost:3000",
    failureRedirect: "http://localhost:3000/login",
}));
app.get("/auth/github", passport_1.default.authenticate("github", { scope: ["read:user", "user:email"] }));
app.get("/auth/github/callback", passport_1.default.authenticate("github", {
    successRedirect: "http://localhost:3000",
    failureRedirect: "http://localhost:3000/login",
}));
app.get("/login/success", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        res.status(200).json({ message: "user Login", user: req.user });
    }
    else {
        console.log("error login/success", req);
        res.status(400).json({ message: "Not Authorized" });
    }
}));
// use the routes here
app.use("/api/auth", auth_1.default);
app.use("/api/qa", qa_1.default);
app.use("/api/todo", todo_1.default);
app.use("/api/admin", admin_1.default);
app.use((error, req, res, next) => {
    const errStatus = error.status || 500;
    const errMessage = error.message || "Something went wrong";
    res.status(errStatus).json({
        message: errMessage,
        success: false,
        stack: error.stack,
    });
    return;
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
    (0, db_1.connect)();
    console.log(`Server is running on http://localhost:${port}`);
});
