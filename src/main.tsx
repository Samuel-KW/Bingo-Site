import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./routes/layout/Layout.tsx";
import Config from "./routes/config/Config.tsx";
import Dashboard from "./routes/dashboard/Dashboard.tsx";
import Home from "./routes/home/Home.tsx";
import NoPage from "./routes/nopage/NoPage.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="dashboard" element={<Dashboard />} />
					<Route path="config" element={<Config />} />
					<Route path="*" element={<NoPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
)
