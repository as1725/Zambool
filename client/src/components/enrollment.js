import React, { useState, useEffect } from "react";
// import Navbar from "./Navbar";
import axios from "axios";
import "../styles/enrollment.css";

const Enrollment = () => {
	const [enrollmentPopup, setEnrollmentPopup] = useState(false);
	const [viewCoursesPopup, setViewCoursesPopup] = useState(false);
	const [feedbackPopup, setFeedbackPopup] = useState(false);
	const [formData, setFormData] = useState({
		studentId: "",
		courseId: "", 
		content: "", 
	});
	const [successMessage, setSuccessMessage] = useState("");
	const [enrolledCourses, setEnrolledCourses] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchedCourse, setSearchedCourse] = useState(null);

	const toggleEnrollmentPopup = () => {
		setEnrollmentPopup(!enrollmentPopup);
	};

	const toggleViewCoursesPopup = (e) => {
		e.stopPropagation();
		setViewCoursesPopup(!viewCoursesPopup);
	};

	const toggleFeedbackPopup = () => {
		setFeedbackPopup(!feedbackPopup);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleEnrollment = async (event) => {
		event.preventDefault();
		const token = localStorage.getItem("token");

		if (formData.courseName === "" || formData.courseCode === "") {
			alert("Please fill out all fields");
			return;
		}

		try {
			const response = await axios.post(
				"http://localhost:3001/api/student-enrollment",
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data.message === "You have been enrolled successfully!") {
				setSuccessMessage("You have been enrolled successfully!");
				fetchEnrolledCourses();
			} else {
				setSuccessMessage(response.data.message);
				alert(response.data.message);
			}
		} catch (error) {
			console.error(error);
			setSuccessMessage("Error enrolling in the course");
		}
	};

	const fetchEnrolledCourses = async () => {
		const token = localStorage.getItem("token");

		try {
			const response = await axios.get(
				"http://localhost:3001/api/student-courses",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setEnrolledCourses(response.data);
		} catch (error) {
			console.error(error);
			alert("Error fetching enrolled courses");
		}
	};

	const handleSearch = async (event) => {
		event.preventDefault();

		try {
			const token = localStorage.getItem("token");
			const response = await axios.get(
				`http://localhost:3001/api/search-course/${searchTerm}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setSearchedCourse(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const handleAddFeedback = (course) => {
		setFormData({
			studentId: "",
			courseId: course.courseId,
			content: "", 
		});

		toggleFeedbackPopup();
	};

	const handleFeedbackSubmission = async (event) => {
		event.preventDefault();
		const token = localStorage.getItem("token");

		try {
			const response = await axios.post(
				"http://localhost:3001/api/add-feedback",
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data.message === "Feedback added successfully!") {
				alert("Feedback added successfully!");
				toggleFeedbackPopup();
			} else {
				alert(response.data.message);
			}
		} catch (error) {
			console.error(error);
			alert("Error adding feedback");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("userInfo");
		window.location.href = "/";
	};

	useEffect(() => {
		fetchEnrolledCourses();
	}, []);

	return (
		<div>
			<nav className="navbar">
				<ul className="navbar-nav">
					<li className="nav-item">
						<a href="/home" className="nav-link">
							Home
						</a>
					</li>
					<li className="nav-item search-container">
						<form onSubmit={handleSearch} className="search-form">
							<input
								type="text"
								placeholder="Search Course by ID..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="search-input"
							/>
							<button type="submit" className="search-button">
								Search
							</button>
						</form>
					</li>
					<li className="nav-item">
						<button onClick={handleLogout} className="logout-button">
							Logout
						</button>
					</li>
				</ul>
			</nav>

			<div className="body">
				<div className="enrollment-container">
					<div className="enrollment">
						<img src="https://pngimg.com/d/skull_PNG69.png" alt="View Grades" />
						<h2>View Grades</h2>
					</div>
					<div className="enrollment" onClick={toggleViewCoursesPopup}>
						<img
							src="https://www.freeiconspng.com/thumbs/courses-icon/courses-icon-12.png"
							alt="View Courses"
						/>
						<h2>View Courses</h2>
					</div>

					<div className="enrollment" onClick={toggleEnrollmentPopup}>
						<img
							src="https://cdn-icons-png.flaticon.com/512/2247/2247728.png"
							alt="Enroll"
						/>
						<h2>Enroll</h2>
					</div>

					{viewCoursesPopup ? (
						<div className="enrollment-popup">
							<div className="enrollment-popup-inner">
								<button onClick={toggleViewCoursesPopup}>X</button>
								<h3>Enrolled Courses</h3>
								<ul>
									{enrolledCourses.map((course) => (
										<li key={course._id}>
											{course.name} ({course.courseId}){" "}
											<button onClick={() => handleAddFeedback(course)}>
												Add Feedback
											</button>
										</li>
									))}
								</ul>
							</div>
						</div>
					) : null}

					{enrollmentPopup ? (
						<div className="enrollment-popup">
							<div className="enrollment-popup-inner">
								<button onClick={toggleEnrollmentPopup}>X</button>
								<h3>Enroll in Course</h3>
								<form className="enrollment-form" onSubmit={handleEnrollment}>
									<label htmlFor="courseName">Course Name</label>
									<input
										type="text"
										name="courseName"
										value={formData.courseName}
										onChange={handleInputChange}
									/>
									<label htmlFor="courseCode">Course Code</label>
									<input
										type="text"
										name="courseCode"
										value={formData.courseCode}
										onChange={handleInputChange}
									/>
									<button type="submit">Submit</button>
									{successMessage && (
										<p className="success-message">{successMessage}</p>
									)}
								</form>
							</div>
						</div>
					) : null}

					{searchedCourse && (
						<div className="enrollment-popup">
							<div className="enrollment-popup-inner">
								<button onClick={() => setSearchedCourse(null)}>X</button>
								<h3>Searched Course Information</h3>
								<p>Name: {searchedCourse.name}</p>
								<p>Course ID: {searchedCourse.courseId}</p>
								<p>Instructor: {searchedCourse.instructor}</p>
								<p>Capacity: {searchedCourse.capacity}</p>
							</div>
						</div>
					)}

					{feedbackPopup && (
						<div className="enrollment-popup">
							<div className="enrollment-popup-inner">
								<button onClick={toggleFeedbackPopup}>X</button>
								<h3>Add Feedback</h3>
								<form onSubmit={handleFeedbackSubmission}>
									<label htmlFor="content">Feedback:</label>
									<textarea
										name="content"
										value={formData.content}
										onChange={handleInputChange}
									></textarea>
									<button type="submit">Submit Feedback</button>
								</form>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Enrollment;
