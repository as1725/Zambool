import React, { useState, useEffect } from "react";
import Navbar from "./navbar"; 
import axios from "axios";
import "../styles/courses.css"; 

const Feedback = () => {
	const [instructorCourses, setInstructorCourses] = useState([]);

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

	return (
		<div>
			<div className="body">
				<Navbar />
				<h2>Feedback</h2>
				<div className="course-container">
					{instructorCourses.length > 0 ? (
						<table className="course-table">
							<thead>
								<tr>
									<th>Course ID</th>
									<th>Course Name</th>
									<th>Capacity</th>
									<th>Students Enrolled</th>
									{/* Add more table headers if needed */}
								</tr>
							</thead>
							<tbody>
								{instructorCourses.map((course) => (
									<tr key={course._id}>
										<td>{course.courseId}</td>
										<td>{course.name}</td>
										<td>{course.capacity}</td>
										<td>{course.studentsEnrolled}</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<p>No courses found for the instructor.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Feedback;
