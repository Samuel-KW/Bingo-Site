import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { createTheme, MantineProvider } from '@mantine/core';

import Layout from "./routes/layout/Layout";
import Config from "./routes/config/Config";
import Dashboard from "./routes/dashboard/Dashboard";
import Home from "./routes/home/Home";
import NoPage from "./routes/nopage/NoPage";

import Play from "./routes/play/Play";
import SignUp from "./routes/signup/SignUp";
import LogIn from "./routes/login/LogIn";
import Account from "./routes/account/Account";
import Game from "./routes/game/Game";

import AuthProvider from "./components/authentication";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
	fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<MantineProvider theme={theme} forceColorScheme="dark">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
						<Route path="/play">
							<Route index element={<Play />} />
							<Route path=":id" element={<Game />} />
						</Route>
						<Route path="login" element={<AuthProvider><LogIn /></AuthProvider>} />
						<Route path="signup" element={<AuthProvider><SignUp /></AuthProvider>} />
						<Route path="account" element={<AuthProvider><Account /></AuthProvider>} />
						<Route path="dashboard" element={<AuthProvider><Dashboard /></AuthProvider>} />
						<Route path="config" element={<Config />} />
						<Route path="*" element={<NoPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
			<Notifications position="top-left" zIndex={1000}  />
		</MantineProvider>
	</React.StrictMode>,
)
