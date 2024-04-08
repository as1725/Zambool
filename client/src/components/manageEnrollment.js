import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import "../styles/manageEnrollment.css";
import axios from "axios";

const ManageEnrollment = () => {
	const [addPopup, setAddPopup] = useState(false);
	const [enrollPopup, setEnrollPopup] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [courseList, setCourseList] = useState([]);

	const toggleAddPopup = () => {
		setAddPopup(!addPopup);
	};

	const toggleEnrollPopup = () => {
		setEnrollPopup(!enrollPopup);
	};

	const handleAddCourse = async (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		const courseName = formData.get("courseName");
		const courseCode = formData.get("courseCode");
		const courseInstructor = formData.get("courseInstructor");
		const courseCapacity = formData.get("courseCapacity");

		if (
			courseName === "" ||
			courseCode === "" ||
			courseInstructor === "" ||
			courseCapacity === ""
		) {
			alert("Please fill out all fields");
			return;
		}

		try {
			const response = await axios.post(
				"http://localhost:3001/api/add-course",
				{
					courseName,
					courseCode,
					courseInstructor,
					courseCapacity,
				}
			);

			if (response.data.message === "Course created successfully") {
				setSuccessMessage("Course created successfully!");
				fetchCourseList();
			} else {
				setSuccessMessage("Error creating course");
			}

			setTimeout(() => {
				setSuccessMessage("");
				toggleAddPopup();
			}, 1000);
		} catch (error) {
			console.error(error);
		}
	};

	const handleDeleteCourse = async (courseId) => {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this course?"
		);
		if (!confirmDelete) {
			return;
		}

		try {
			const response = await axios.delete(
				`http://localhost:3001/api/delete-course/${courseId}`
			);
			if (response.data.message === "Course deleted successfully") {
				fetchCourseList();
			} else {
				alert("Error deleting course");
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleEnrollStudent = async (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		const courseId = formData.get("courseId");
		const studentId = formData.get("studentId");

		if (courseId === "" || studentId === "") {
			alert("Please fill out all fields");
			return;
		}

		try {
			const response = await axios.post(
				"http://localhost:3001/api/enroll-student",
				{
					courseId,
					studentId,
				}
			);

			if (response.data.message === "Student enrolled successfully") {
				setSuccessMessage("Student enrolled successfully!");
				fetchCourseList();
			} else {
				setSuccessMessage("Error enrolling student");
				console.log(response.data.message);
			}

			setTimeout(() => {
				setSuccessMessage("");
				toggleEnrollPopup();
			}, 1000);
		} catch (error) {
			console.error(error);
			console.log(error.response.data.message);
		}
	};

	const fetchCourseList = async () => {
		try {
			const response = await axios.get("http://localhost:3001/api/course-list");
			setCourseList(response.data);
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchCourseList();
	}, []);

	return (
		<div>
			<Navbar />
			<div className="body">
				<h2>Manage Enrollment</h2>
				<div className="buttons">
					<button onClick={toggleAddPopup}>Add Course</button>
					<button onClick={toggleEnrollPopup}>Enroll Student</button>
				</div>
			</div>

			{addPopup ? (
				<div className="popup">
					<div className="popup-inner">
						<button onClick={toggleAddPopup}>X</button>
						<h3>Add Course</h3>
						<form className="add-course-form" onSubmit={handleAddCourse}>
							<label htmlFor="courseName">Course Name</label>
							<input type="text" name="courseName" />
							<label htmlFor="courseCode">Course Code</label>
							<input type="text" name="courseCode" />
							<label htmlFor="courseInstructor">Course Instructor</label>
							<input type="text" name="courseInstructor" />
							<label htmlFor="courseCapacity">Course Capacity</label>
							<input type="text" name="courseCapacity" />
							<button className="subb-button" type="submit">
								{" "}
								Submit{" "}
							</button>
							{successMessage && (
								<p className="success-message">{successMessage}</p>
							)}
						</form>
					</div>
				</div>
			) : null}

			{enrollPopup ? (
				<div className="popup">
					<div className="popup-inner">
						<button onClick={toggleEnrollPopup}>X</button>
						<h3>Enroll Student</h3>
						<form className="add-course-form" onSubmit={handleEnrollStudent}>
							<label htmlFor="courseId">Course ID</label>
							<input type="text" name="courseId" />
							<label htmlFor="studentId">Student ID</label>
							<input type="text" name="studentId" />
							<button className="subb-button" type="submit">
								Enroll Student
							</button>
							{successMessage && (
								<p className="success-message">{successMessage}</p>
							)}
						</form>
					</div>
				</div>
			) : null}

			<div className="course-list">
				<h2>Course List</h2>
				<table>
					<thead>
						<tr>
							<th>Course Name</th>
							<th>Course Code</th>
							<th>Course Instructor</th>
							<th>Course Capacity</th>
							<th>Enrolled Students</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{courseList && courseList.length > 0 ? (
							courseList.map((course) => (
								<tr key={course._id}>
									<td>{course.name}</td>
									<td>{course.courseId}</td>
									<td>{course.instructor}</td>
									<td>{course.capacity}</td>
									<td>{course.studentsEnrolled.join(", ")}</td>
									<td>
										<button onClick={() => handleDeleteCourse(course._id)}>
											Delete
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="6">No courses available</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ManageEnrollment;
