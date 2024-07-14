import React from 'react'
import ReactDOM from 'react-dom/client'

// import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./routes/layout/Layout.tsx";
import Config from "./routes/config/Config.tsx";
import Dashboard from "./routes/dashboard/Dashboard.tsx";
import Home from "./routes/home/Home.tsx";
import NoPage from "./routes/nopage/NoPage.tsx";

import SignUp from "./routes/signup/SignUp.tsx";
import LogIn from "./routes/login/LogIn.tsx";
import Account from "./routes/account/Account.tsx";
import AuthProvider from './components/authentication.tsx';


ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
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
