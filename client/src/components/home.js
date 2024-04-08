import React from 'react';
import Navbar from './navbar';
import "../styles/home.css";

const Home = () => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    console.log("user role: " + user.role);
    const handleEnrollment = () => {
        window.location.href = "/home/enrollment";
    }

    const renderContentBasedOnRole = () => {
        switch (user.role) {
            case 'student':
                console.log("Student role: " + user.role);
                return (
                    <div className="enroll-container">
                        <a className="enrollment" onClick={handleEnrollment}>
                            <img
                                src="https://www.freeiconspng.com/thumbs/calendar-image-png/calendar-image-png-3.png"
                                alt="Enrollment"
                            />
                            <h2>Enrollment</h2>
                        </a>
                    </div>
                );
            case 'instructor':
                return (
                    <div className="enroll-container">
                        <a className="enrollment" href="/home/courses">
                            <img
                                src="https://www.freeiconspng.com/thumbs/courses-icon/courses-icon-12.png"
                                alt="Courses"
                            />
                            <h2>Courses</h2>
                        </a>
                    </div>
                );
            case 'admin':
                return (
                    <div className="enroll-container">
                        <a className="enrollment" href="/home/manage-enrollment">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/2247/2247728.png"
                                alt="Manage Enrollment"
                            />
                            <h2>Manage Enrollment</h2>
                        </a>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="home-container">
            <Navbar user={user} />

            <h1>Welcome to Zambool, {user.username}!</h1>

            {renderContentBasedOnRole()}

        </div>
    );
};

export default Home;
