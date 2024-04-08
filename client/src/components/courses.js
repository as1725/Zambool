import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import axios from "axios";
import "../styles/courses.css";

const Courses = () => {
	const [instructorCourses, setInstructorCourses] = useState([]);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [courseFeedback, setCourseFeedback] = useState([]);

	useEffect(() => {
		fetchInstructorCourses();
	}, []);

	const fetchInstructorCourses = async () => {
		const token = localStorage.getItem("token");

		try {
			const response = await axios.get(
				"http://localhost:3001/api/instructor-courses",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setInstructorCourses(response.data);
		} catch (error) {
			console.error(error);
			alert("Error fetching instructor's courses");
		}
	};

	const handleViewFeedback = async (courseId) => {
		try {
			const token = localStorage.getItem("token");

			const response = await axios.get(
				`http://localhost:3001/api/search-course/${courseId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setSelectedCourse(courseId);
			setCourseFeedback(response.data.feedback);
		} catch (error) {
			console.error(error);
			alert("Error fetching feedback for the selected course");
		}
	};

	return (
		<div>
			<div className="body">
				<Navbar />
				<h2>Feedback</h2>
				<div className="course-container">
					{instructorCourses.length > 0 ? (
						<>
							<table className="course-table">
								<thead>
									<tr>
										<th>Course ID</th>
										<th>Course Name</th>
										<th>Capacity</th>
										<th>Students Enrolled</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{instructorCourses.map((course) => (
										<tr key={course._id}>
											<td>{course.courseId}</td>
											<td>{course.name}</td>
											<td>{course.capacity}</td>
											<td>{course.studentsEnrolled}</td>
											<td>
												<button
													onClick={() => handleViewFeedback(course.courseId)}
												>
													View Feedback
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>

							{selectedCourse && (
								<div className="feedback-container">
									<h3>Feedback for Course {selectedCourse}</h3>
									<ul>
										{courseFeedback.map((feedback) => (
											<li key={feedback._id}>
												<strong>Student:</strong> {feedback.student.name} -{" "}
												{feedback.content}
											</li>
										))}
									</ul>
								</div>
							)}
						</>
					) : (
						<p>No courses found for the instructor.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Courses;
