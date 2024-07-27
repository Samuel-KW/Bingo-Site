import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, Checkbox, Group, TextInput, Text, Image, Center, Card, Title, Divider, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import { useAuth } from "../../components/authentication.tsx";

import LoginImage from "./login.svg";

import "./LogIn.css";

export default function LogIn() {
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	const auth = useAuth();
	if (!auth) throw new Error("No auth provider found");

	const form = useForm({
		name: "login-form",
    mode: "uncontrolled",
    initialValues: {
      email: "",
			password: "",
      termsOfService: false,
    },

    validate: {
      email: (value) => {
				if (!value) return "Email is required";
				if (value.length < 3) return "Email must be at least 3 characters long";
				if (value.length > 320) return "Email can not be longer than 320 characters";
				if (!/^\S+@\S+$/.test(value)) return "Invalid email";
				return null;
			},
			password: (value) => {
				if (value.length < 8) return "Password must be at least 8 characters long";
				if (value.length > 128) return "Password can not be longer than 128 characters";
				if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
				if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
				if (!/[0-9]/.test(value)) return "Password must contain at least one number";
				return null;
			}
    },
  });

	const handleLogin = async (values: typeof form.values) => {

		setLoading(true);

		try {
			const session = await auth.login(values.email, values.password, "");
			alert("Logged in successfully! Welcome " + session.user.metadata.firstName);
			navigate("/");

		} catch (error: unknown) {
			if (typeof error === "string")
				alert(error);

		} finally {
			setLoading(false);
		}
	};

	return (
		<Center>
			<Card shadow="xl" p="lg" radius="md" withBorder>
				<Group justify="center" gap="xs" grow>
					<div>
						<div>
							<Title order={2}>Log In</Title>
							<Text>Don't have an account? <Link to="/signup">Sign Up</Link></Text>
							<Divider my="xs" />
						</div>
						<form onSubmit={form.onSubmit((values) => handleLogin(values))} autoComplete="on">
							<div>
								<TextInput
									withAsterisk
									label="Email"
									autoComplete="email"
									placeholder="your@email.com"
									key={form.key('email')}
									{...form.getInputProps('email')}
								/>

								<PasswordInput
									mt="xs"
									withAsterisk
									label="Password"
									autoComplete="current-password"
									placeholder="Your password"
									type="password"
									key={form.key('password')}
									{...form.getInputProps('password')}
								/>

								<Checkbox
									mt="lg"
									required
									label="I agree to the terms of service"
									key={form.key('termsOfService')}
									{...form.getInputProps('termsOfService', { type: 'checkbox' })}
								/>

								<Group justify="flex-end" mt="md">
									<Button type="submit" disabled={loading}>{loading ? <span>Loading</span> : <span>Log In</span>}</Button>
								</Group>
							</div>
						</form>
					</div>

					<div>
						<Image src={LoginImage} />
					</div>
				</Group>
			</Card>
		</Center>
	);
}