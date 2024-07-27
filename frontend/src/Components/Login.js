import React from "react";

const Login = () => {
	const navigateToGoogleLogin = () => {
		window.open("http://localhost:5000/auth/google/callback", "_self");
	};
	const navigateToGithubLogin = () => {
		window.open("http://localhost:5000/auth/github/callback", "_self");
	};
	return (
		<React.Fragment>
			<button onClick={navigateToGoogleLogin}>Google Login</button>
			<button onClick={navigateToGithubLogin}>Github Login</button>
		</React.Fragment>
	);
};

export default Login;
