import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

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
import CreateBoard from "./routes/createboard/CreateBoard";

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

						{/* All game routes have session information */}
						<Route path="/play" element={<AuthProvider><Outlet/></AuthProvider>}>
							<Route index element={<Play />} />
							<Route path=":id" element={<Game />} />
						</Route>

						{/* All account related routes have session information */}
						<Route path="/account" element={<AuthProvider><Outlet /></AuthProvider>}>
							<Route path="login" element={<LogIn />} />
							<Route path="signup" element={<SignUp />} />
							<Route path="account" element={<Account />} />
							<Route path="dashboard" element={<Dashboard />} />

							{/* Handle board configurations */}
							<Route path="/account/config">
								<Route index element={<Config />} />
								<Route path=":id" element={<CreateBoard />} />
							</Route>
						</Route>

					</Route>

					{/* Handle unknown pages */}
					<Route path="*" element={<NoPage />} />

				</Routes>
			</BrowserRouter>

			<Notifications position="top-left" zIndex={1000} />
		</MantineProvider>
	</React.StrictMode>,
)
