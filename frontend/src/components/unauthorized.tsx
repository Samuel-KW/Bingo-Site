import { Link } from "react-router-dom";


function Unauthorized () {
  return (
		<>
			<h1>Unauthorized</h1>
			<p>You must be logged in to view this page.</p>

			<hr />

			<div>
				<p>New user? Create a new account.</p>
				<Link to="/signup">Sign Up</Link>
			</div>

			<div>
				<p>Already have an account?</p>
				<Link to="/login">Log In</Link>
			</div>
		</>
	);
}

export default Unauthorized;