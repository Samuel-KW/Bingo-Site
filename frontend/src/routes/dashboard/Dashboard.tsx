import { useAuth } from '../../components/authentication.tsx';
import Unauthorized from '../../components/unauthorized.tsx';

import './Dashboard.css';


function Dashboard() {

	const auth = useAuth();
	if (!auth || !auth.session) return (<Unauthorized />)

	return (
		<>
			<h1>Dashboard</h1>
		</>
	);
}

export default Dashboard;
