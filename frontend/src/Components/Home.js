import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
	const [user, setUser] = useState(null);
	const fetchUser = async () => {
		try {
			const response = await axios.get("http://localhost:5000/login/success", {
				withCredentials: true,
			});

			setUser(response.data.user);
		} catch (error) {
			console.log("error", error);
		}
	};
	useEffect(() => {
		fetchUser();
	}, []);
	return (
		<React.Fragment>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}>
				<img
					src={user?.profilePicture}
					alt=""
					style={{ height: "100px", width: "100px", borderRadius: "50%" }}
				/>
				<p>{user?.name}</p>
				<p>{user?.email}</p>
			</div>
		</React.Fragment>
	);
};

export default Home;
