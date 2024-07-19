import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../components/authentication.tsx';

import { Button, Checkbox, Group, Stack, TextInput } from '@mantine/core';
import { useForm, } from '@mantine/form';

import SignipImage from "./signup.svg";

import './SignUp.css'

export default function SignUp() {
	const [loading, setLoading] = useState(false)

	const navigate = useNavigate();

	const auth = useAuth();
	if (!auth) throw new Error("No auth provider found");

	const handleSignUp = async (values: typeof form.values) => {

		setLoading(true);

		try {
			const session = await auth.signup(values.email, values.password, {
				firstName: values.firstName,
				lastName: values.lastName,
				birthday: values.birthday,
				accountType: "user",
				avatarUrl: "",
				boards: []
			}, "");
			alert("Thank you for joining us! Welcome " + session.user.metadata.firstName);
			navigate("/");

		} catch (error: unknown) {
			if (typeof error === "string")
				alert(error);

		} finally {
			setLoading(false);
		}
	};

	const form = useForm({
		name: "signup-form",
    mode: "uncontrolled",
    initialValues: {
      email: "",
			password: "",
			firstName: "",
			lastName: "",
			birthday: "",
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
			},
			firstName: (value) => {
				if (value.length < 1) return "First name must be at least 1 character long";
				if (value.length > 128) return "First name can not be longer than 128 characters";
			},
			lastName: (value) => {
				if (value.length < 1) return "Last name must be at least 1 character long";
				if (value.length > 128) return "Last name can not be longer than 128 characters";
			},
			birthday: (value) => {
				if (value.length < 8) return "Birthday must be at least 8 characters long";
				if (value.length > 128) return "Birthday can not be longer than 128 characters";
				if (!/^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2})*$/.test(value)) return "Birthday must be in the format MM/DD/YYYY";
			}
    }
  });

	return (
		<div>
			<Group justify="center">
				<span className="container">
					<div className="content">
						<div>
							<h1 className="header">Sign Up</h1>
							<p className="description">Already have an account? <Link to="/login">Log In</Link></p>
						</div>
						<form className="form-login" onSubmit={form.onSubmit((values) => handleSignUp(values))}>
							<div>
								<TextInput
									withAsterisk
									label="Email"
									autoComplete="email"
									placeholder="your@email.com"
									key={form.key('email')}
									{...form.getInputProps('email')}
								/>

								<TextInput
									withAsterisk
									label="Password"
									autoComplete="current-password"
									placeholder="Your password"
									type="password"
									key={form.key('password')}
									{...form.getInputProps('password')}
								/>

								<TextInput
									label="First Name"
									autoComplete="given-name"
									placeholder="Your first name"
									key={form.key('firstName')}
									{...form.getInputProps('firstName')}
								/>

								<TextInput
									label="Last Name"
									autoComplete="family-name"
									placeholder="Your last name"
									key={form.key('lastName')}
									{...form.getInputProps('lastName')}
								/>

								<TextInput
									label="Birthday"
									autoComplete="bday"
									placeholder="MM/DD/YYYY"
									key={form.key('birthday')}
									{...form.getInputProps('birthday')}
								/>

								<Checkbox
									required
									mt="md"
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
					<div className="illustration">
						<img src={SignipImage} />
					</div>
				</span>
			</Group>
		</div>
	);
}