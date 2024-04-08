import express, { response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

mongoose
	.connect(process.env.MONG_URI)
	.then(() => {
		app.listen(process.env.PORT, () => {
			console.log(`listening on port ${process.env.PORT}`);
			console.log("Connected to Database");
		});
	})
	.catch((error) => {
		console.log(error);
	});

// SCHEMA DEFINITIONS //
// User schema
const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		name: { type: String, required: true },
		role: {
			type: String,
			enum: ["student", "instructor", "admin"],
			required: true,
		},
	},
	{ timestamps: true }
);
const User = mongoose.model("User", userSchema);

const feedbackSchema = new mongoose.Schema(
	{
		content: { type: String, required: true },
	},
	{ timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Course schema
const courseSchema = new mongoose.Schema(
	{
		courseId: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		instructor: { type: mongoose.Schema.Types.String, ref: "User" },
		studentsEnrolled: [{ type: mongoose.Schema.Types.String, ref: "User" }],
		capacity: { type: Number, required: true },
		feedback: [{ type: String }],
	},
	{ timestamps: true }
);
const Course = mongoose.model("Course", courseSchema);

// Student schema
const studentSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.String, ref: "User", required: true },
		coursesEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
		grades: [
			{
				course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
				grade: { type: Number, required: true },
			},
		],
	},
	{ timestamps: true }
);
const Student = mongoose.model("Student", studentSchema);

// Instructor schema
const instructorSchema = new mongoose.Schema(
	{
		// Inherits fields from User
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		coursesTeaching: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
	},
	{ timestamps: true }
);
const Instructor = mongoose.model("Instructor", instructorSchema);

// Admin schema
const adminSchema = new mongoose.Schema(
	{
		// Inherits fields from User
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		coursesEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
		instructorsTeaching: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
		],
	},
	{ timestamps: true }
);
const Admin = mongoose.model("Admin", adminSchema);

// Middleware to authenticate tokens
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (token == null) {
		return res.status(401).json({ message: "No token provided" });
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({ message: "Invalid or expired token" });
		}
		req.user = decoded; 
		next();
	});
};

// Protected routes
app.get("/home", authenticateToken, (req, res) => {
	console.log("rendering home");
	res.render("home");
});

app.get("/enrollment", authenticateToken, (req, res) => {
	console.log("rendering enrollment");
	res.render("enrollment");
});

// Signup API endpoint
app.post("/api/signup", async (req, res) => {
	try {
		const { username, password, name, role } = req.body;

		let user = await User.findOne({ username });
		if (user) {
			return res.status(401).json({ message: "User already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		user = new User({
			username,
			password: hashedPassword,
			name, 
			role, 
		});
		// console.log("USER ROLE: " + user.role);
		await user.save();

		if (role === "student") {
			const student = new Student({
				user: user._id,
				coursesEnrolled: [],
				grades: [],
			});
			await student.save();
		} else if (role === "instructor") {
			const instructor = new Instructor({
				user: user._id,
				coursesTeaching: [],
			});
			await instructor.save();
		} else if (role === "admin") {
			const admin = new Admin({
				user: user._id,
				coursesEnrolled: [],
				instructorsTeaching: [],
			});
			await admin.save();
		}

		res.status(201).json({ message: "User created successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

// Login API endpoint
app.post("/api/login", async (req, res) => {
	try {
		const { username, password } = req.body;

		let user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: "User does not exist" });
		}

		// Compare the hashed password
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ userId: user._id, name: user.name },
			process.env.JWT_SECRET,
			{
				expiresIn: "1h",
			}
		);

		// console.log("LOGIN USER ROLE: " + user.role); // Log "USER ROLE: student
		res.json({
			user: {
				id: user._id,
				username: user.username,
				name: user.name, // Send Name field
				role: user.role, // Send Role field
			},
			message: "Login successful",
			token: token,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

// Course list API endpoint
app.get("/api/course-list", async (req, res) => {
	try {
		const courses = await Course.find();
		if (!courses) {
			return res.json([]);
		}
		res.json(courses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

// Add course API endpoint
app.post("/api/add-course", async (req, res) => {
	try {
		const { courseName, courseCode, courseInstructor, courseCapacity } =
			req.body;
		const instructor = await User.findOne({ name: courseInstructor });
		console.log("Instructor name: " + courseInstructor);
		if (!instructor) {
			console.log("Instructor does not exist");
			return res.status(400).json({ message: "Instructor does not exist" });
		}
		const course = new Course({
			courseId: courseCode,
			name: courseName,
			instructor: courseInstructor,
			capacity: courseCapacity,
			studentsEnrolled: [],
		});
		await course.save();
		res.status(201).json({ message: "Course created successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

// Delete course API endpoint
app.delete("/api/delete-course/:courseId", async (req, res) => {
	try {
		const courseId = req.params.courseId;

		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		await Course.findByIdAndDelete(courseId);
		res.json({ message: "Course deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

app.delete("/api/remove-student/:courseId/:studentId", async (req, res) => {
	try {
		const courseId = req.params.courseId;
		const studentId = req.params.studentId;

		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		const studentIndex = course.studentsEnrolled.indexOf(
			mongoose.Types.ObjectId(studentId)
		);

		if (studentIndex === -1) {
			return res
				.status(404)
				.json({ message: "Student not found in the course" });
		}

		course.studentsEnrolled.splice(studentIndex, 1);
		await course.save();

		res.json({ message: "Student removed successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/enroll-student", async (req, res) => {
	try {
		const { courseId, studentId } = req.body;
		const course = await Course.findOne({ courseId: courseId });
		const student = await User.findOne({ username: studentId });

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		if (course.studentsEnrolled === undefined) {
			course.studentsEnrolled = [];
		}
		if (course.studentsEnrolled.includes(studentId)) {
			return res.json({ message: "Student is already enrolled in the course" });
		}

		course.studentsEnrolled.push(studentId);

		await course.save();

		res.json({ message: "Student enrolled successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

app.get("/api/student-list", async (req, res) => {
	try {
		const students = await Student.find();
		if (!students) {
			return res.json([]);
		}
		res.json(students);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/student-enrollment", authenticateToken, async (req, res) => {
	try {
		const { courseCode } = req.body;
		const course = await Course.findOne({ courseId: courseCode });

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		if (course.studentsEnrolled.includes(req.user.username)) {
			return res.json({ message: "You are already enrolled in the course" });
		}

		if (course.studentsEnrolled.length >= course.capacity) {
			return res.json({ message: "Course is full" });
		}

		course.studentsEnrolled.push(req.user.username);
		await course.save();

		res.json({ message: "You have been enrolled successfully!" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

app.get("/api/student-courses", authenticateToken, async (req, res) => {
	try {
		const courses = await Course.find();
		if (!courses) {
			return res.json([]);
		}

		const filteredCourses = courses.filter((course) =>
			course.studentsEnrolled.includes(req.user.username)
		);

		res.json(filteredCourses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

app.get("/api/search-course/:courseId", authenticateToken, async (req, res) => {
	try {
		const courseId = req.params.courseId;

		const course = await Course.findOne({ courseId: courseId });
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		const feedback = await Course.findById(course._id).populate("feedback");

		const courseWithFeedback = {
			...course._doc,
			feedback: feedback.feedback,
		};

		res.json(courseWithFeedback);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

app.get("/api/instructor-courses", authenticateToken, async (req, res) => {
	try {
		const courses = await Course.find({ instructor: req.user.name });
		if (!courses) {
			return res.json([]);
		}

		const coursesWithFeedback = await Promise.all(
			courses.map(async (course) => {
				const populatedCourse = await Course.populate(course, {
					path: "feedback",
				});

				return {
					...populatedCourse._doc,
				};
			})
		);

		res.json(coursesWithFeedback);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});

app.post("/api/add-feedback", authenticateToken, async (req, res) => {
	try {
		const { courseId, content } = req.body;
		const studentId = req.user.username;

		// Check if the course exists
		const course = await Course.findOne({ courseId });
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		if (!course.studentsEnrolled.includes(studentId)) {
			return res
				.status(403)
				.json({ message: "You are not enrolled in this course" });
		}

		course.feedback.push(content);
		await course.save();

		res.json({ message: "Feedback added successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});
