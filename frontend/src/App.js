import "./App.css";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Components/Login";
import Home from "./Components/Home";

function App() {
	const routes = createBrowserRouter([
		{
			path: "/login",
			element: <Login />,
		},
		{
			path: "/",
			element: <Home />,
		},
	]);

	return <RouterProvider router={routes} />;
}

export default App;
