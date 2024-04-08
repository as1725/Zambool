import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const Login = (props) => {
	const [showSignupPopup, setShowSignupPopup] = useState(false);
	const navigate = useNavigate();

	const handleLoginSubmit = async (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		const username = formData.get("username");
		const password = formData.get("password");

		console.log("Username: " + username);
		console.log("Password: " + password);

		try {
			const response = await axios.post("http://localhost:3001/api/login", {
				username,
				password,
			});
			console.log(response.data);
			if (response.data.token) {
				localStorage.setItem("token", response.data.token); 
				localStorage.setItem("userInfo", JSON.stringify(response.data.user));
				console.log("redirecting to home");
				navigate("/home");
			} else {
				alert("Error logging in");
				console.error(response.data.message);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleSignupSubmit = async (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		const username = formData.get("username");
		const name = formData.get("name");
		const password = formData.get("password");
		const confirmPassword = formData.get("confirmPassword");
		const role = formData.get("role"); 

		console.log("Username: " + username);
		console.log("Name: " + name); 
		console.log("Password: " + password);
		console.log("Role: " + role); 

		if (name === "") {
			alert("Name cannot be empty");
			return;
		}

		if (password !== confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		if (password.length < 8) {
			alert("Password must be at least 8 characters long");
			return;
		}

		if (!/\d/.test(password)) {
			alert("Password must contain at least one number");
			return;
		}

		if (!/[!@#$%^&*.]/.test(password)) {
			alert("Password must contain at least one special character");
			return;
		}

		try {
			const response = await axios.post("http://localhost:3001/api/signup", {
				username,
				password,
				name,
				role,
			});
			console.log(response.data);
			setShowSignupPopup(false);
			alert("Signup successful!");
		} catch (error) {
			alert("Error signing up");
			console.error(error);
		}
	};

	const toggleSignupPopup = () => {
		setShowSignupPopup(!showSignupPopup);
	};

	const SignupPopup = () => (
		<div className="signup-popup">
			<div className="signup-content">
				<span className="close" onClick={toggleSignupPopup}>
					&times;
				</span>
				<h2 style={{ textAlign: "center", color: "white" }}>Signup</h2>
				<form className="signup-form" onSubmit={handleSignupSubmit}>
					<div>
						<input
							className="user-inp"
							type="text"
							placeholder="username"
							name="username"
						/>
					</div>
					<div>
						<input
							className="user-inp"
							type="text"
							placeholder="name"
							name="name" 
						/>
					</div>
					<div>
						<input
							className="pass-inp"
							type="password"
							placeholder="password"
							name="password"
						/>
					</div>
					<div>
						<input
							className="pass-inp"
							type="password"
							placeholder="confirm password"
							name="confirmPassword"
						/>
					</div>
					<div>
						<select className="role-select" name="role" id="role">
							<option value="student">Student</option>
							<option value="instructor">Instructor</option>
						</select>
					</div>
					<div>
						<button className="sub-button" type="submit">
							Submit
						</button>
					</div>
				</form>
			</div>
		</div>
	);

	return (
		<div className="login-page">
			<div className="login-header">
				<span className="lib-name">Zambool</span>
			</div>
			<div className="partition"></div>
			<form className="form" onSubmit={handleLoginSubmit}>
				<div>
					<input
						className="user-inp"
						type="text"
						placeholder="username"
						name="username"
					/>
				</div>
				<div>
					<input
						className="pass-inp"
						type="password"
						placeholder="password"
						name="password"
					/>
				</div>
				<div>
					<button className="sub-button" type="submit">
						Login
					</button>
				</div>
			</form>
			<div className="question">Don't have an account?</div>
			<button className="sub-button" onClick={toggleSignupPopup}>
				Signup
			</button>

			{showSignupPopup && <SignupPopup />}
		</div>
	);
};

export default Login;
