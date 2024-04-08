import React, { useState } from "react";
import "../styles/home.css";

const Navbar = ({ user, onSearch }) => {
	const [searchTerm, setSearchTerm] = useState("");

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("userInfo");
		window.location.href = "/";
	};

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const handleSearch = async (event) => {
		event.preventDefault();
		onSearch(searchTerm);
	};

	return (
		<nav className="navbar">
			<ul className="navbar-nav">
				<li className="nav-item">
					<a href="/home" className="nav-link">
						Home
					</a>
				</li>
				{/* Centering the search bar */}
				<li className="nav-item search-container">
					<form onSubmit={handleSearch} className="search-form">
						<input
							type="text"
							placeholder="Search..."
							value={searchTerm}
							onChange={handleSearchChange}
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
	);
};

export default Navbar;
