import { Outlet, Link } from "react-router-dom";
import { AppShell, Burger, Group, rem, Avatar, Text, Title } from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";

import Logo from "../../images/logo.svg";
import styles from "./Layout.module.css";

const Layout = () => {

	const pinned = useHeadroom({ fixedAt: 60 });

	const [mobileOpened, mobile] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

	return (
		<>
			<AppShell
				header={{ height: 60, collapsed: !pinned, offset: true }}
				navbar={{
					width: 300,
					breakpoint: "sm",
					collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
				}}
				padding="md"
			>
				<AppShell.Header>
					<Group h="100%" px="md">
						<Burger opened={mobileOpened} onClick={mobile.toggle} hiddenFrom="sm" size="sm" />
						<Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
						<Avatar src={Logo} alt="Logo" />
						<Title order={2} className={styles.title}>Bingo Lounge</Title>
					</Group>
				</AppShell.Header>

				<AppShell.Navbar className={styles.nav}>
					<Text variant="Link" component={Link} to="/" onClick={mobile.close}>Home</Text>
					<Text variant="Link" component={Link} to="/play" onClick={mobile.close}>Play</Text>
					<Text variant="Link" component={Link} to="/account/dashboard" onClick={mobile.close}>Dashboard</Text>
					<Text variant="Link" component={Link} to="/account/config" onClick={mobile.close}>Config</Text>
					<Text variant="Link" component={Link} to="/account/login" onClick={mobile.close}>Log In</Text>
					<Text variant="Link" component={Link} to="/account/signup" onClick={mobile.close}>Sign Up</Text>
					<Text variant="Link" component={Link} to="/account/logout" onClick={mobile.close}>Log Out</Text>
				</AppShell.Navbar>

				<AppShell.Main pt={`calc(${rem(60)} + var(--mantine-spacing-md))`}>
					<Outlet />
				</AppShell.Main>

			</AppShell>
		</>
	)
};

export default Layout;