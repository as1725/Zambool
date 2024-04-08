import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login";
import ProtectedRoute from "./components/protectedRoute"; // Import the ProtectedRoute component
import Home from "./components/home";
import Enrollment from "./components/enrollment";
import Courses from "./components/courses";
import ManageEnrollment from "./components/manageEnrollment";
import Feedback from "./components/feedback";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="/home" element={<ProtectedRoute component={Home} />} />
			<Route
				path="/home/enrollment"
				element={<ProtectedRoute component={Enrollment} />}
			/>
			<Route
				path="/home/courses"
				element={<ProtectedRoute component={Courses} />}
			/>
			<Route
				path="/home/manage-enrollment"
				element={<ProtectedRoute component={ManageEnrollment} />}
			/>
			<Route
				path="/home/feedback"
				element={<ProtectedRoute component={Feedback} />}
			/>
		</Routes>
	);
}

export default App;
