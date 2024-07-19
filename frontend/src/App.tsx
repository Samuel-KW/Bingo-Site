import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "@mantine/core/styles.css";


import Layout from "./routes/layout/Layout";
import Config from "./routes/config/Config";
import Dashboard from "./routes/dashboard/Dashboard";
import Home from "./routes/home/Home";
import NoPage from "./routes/nopage/NoPage";

import Play from "./routes/play/Play";
import SignUp from "./routes/signup/SignUp";
import LogIn from "./routes/login/LogIn";
import Account from "./routes/account/Account";
import AuthProvider from "./components/authentication";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="play" element={<AuthProvider><Play /></AuthProvider>} />
					<Route path="login" element={<AuthProvider><LogIn /></AuthProvider>} />
					<Route path="signup" element={<AuthProvider><SignUp /></AuthProvider>} />
					<Route path="account" element={<AuthProvider><Account /></AuthProvider>} />
					<Route path="dashboard" element={<AuthProvider><Dashboard /></AuthProvider>} />
					<Route path="config" element={<Config />} />
					<Route path="*" element={<NoPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
)
