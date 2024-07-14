import { Outlet, Link } from "react-router-dom";

import './Layout.css'

const Layout = () => {
	return (
		<>
			<nav>
				<ul>
					<li><Link to="/login">Log In</Link></li>
					<li><Link to="/signup">Sign Up</Link></li>
					<li><Link to="/">Home</Link></li>
					<li><Link to="/dashboard">Dashboard</Link></li>
					<li><Link to="/config">Config</Link></li>
				</ul>
			</nav>

			<Outlet />
		</>
	)
};

export default Layout;