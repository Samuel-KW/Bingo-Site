import { Outlet, Link } from "react-router-dom";
import { AppShell, Burger, Group, rem, Avatar, Text } from '@mantine/core';
import { useDisclosure, useHeadroom } from '@mantine/hooks';

import Logo from '../../images/logo.svg';
import './Layout.css'

const Layout = () => {

	const pinned = useHeadroom({ fixedAt: 60 });

	const [mobileOpened, mobile] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

	return (
		<AppShell
      header={{ height: 60, collapsed: !pinned, offset: true }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={mobile.toggle} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          <Avatar src={Logo} alt="Logo" />
					<Text>Bingo!</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="nav">
				<Link to="/" onClick={mobile.close}>Home</Link>
				<Link to="/play" onClick={mobile.close}>Play</Link>
				<Link to="/dashboard" onClick={mobile.close}>Dashboard</Link>
				<Link to="/config" onClick={mobile.close}>Config</Link>
				<Link to="/login" onClick={mobile.close}>Log In</Link>
				<Link to="/signup" onClick={mobile.close}>Sign Up</Link>
      </AppShell.Navbar>

      <AppShell.Main pt={`calc(${rem(60)} + var(--mantine-spacing-md))`}>
				<Outlet />
			</AppShell.Main>
    </AppShell>
	)
};

export default Layout;