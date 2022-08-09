import React from "react";

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

type Props = {
	onRegisterSubmit: (data: any) => void;
}

export default class Registration extends React.Component<Props, any> {
	constructor(props: any) {
		super(props);
	}

	onSubmit() {
		const errorEl = document.getElementById('register-error') as HTMLElement;

		const username = document.getElementById('register-name') as HTMLInputElement;
		const email = document.getElementById('register-email') as HTMLInputElement;
		const fullname = document.getElementById('register-fullname') as HTMLInputElement;
		const password = document.getElementById('login-password') as HTMLInputElement;
		const sub = document.getElementById('subscriptionType') as HTMLSelectElement;

		if (username.value === '' || password.value === '' || email.value === '' || fullname.value === '') {
			errorEl.innerHTML = 'You must fill out all the fields.';
			return;
		}

		const input = {
			username: username.value,
			email: email.value,
			fullname: fullname.value,
			password: password.value,
			subtype: sub.value,
		};

		this.props.onRegisterSubmit(input);
	}

	render(): React.ReactNode {
		return (
			<section className="content-section p-3 bg-dark border rounded">
				<Row>
					<Col className="col-8">
						<h1>Register</h1>
						<div id="register-error"></div>
						<Form>
							<Form.Group className="mb-3" controlId="register-name">
								<Form.Label>Username</Form.Label>
								<Form.Control type="text" placeholder="Username" />
							</Form.Group>
							<Form.Group className="mb-3" controlId="register-email">
								<Form.Label>Email Address</Form.Label>
								<Form.Control type="email" placeholder="Email" />
							</Form.Group>
							<Form.Group className="mb-3" controlId="register-fullname">
								<Form.Label>Full Name</Form.Label>
								<Form.Control type="text" placeholder="Name" />
							</Form.Group>
							<Form.Group className="mb-3" controlId="register-password">
								<Form.Label>Password</Form.Label>
								<Form.Control type="password" placeholder="Password" />
							</Form.Group>
							<Row>
								<Col>
									<select id="subscriptionType" className="form-select form-select-sm" aria-label=".form-select-sm">
										<option selected>Subscription Type</option>
										<option value="1">Free</option>
										<option value="2">Basic</option>
										<option value="3">Premium</option>
									</select>
								</Col>
							</Row>
							<Button variant="primary" type="submit" onClick={this.onSubmit}>
								Submit
							</Button>
						</Form>
					</Col>
				</Row>
			</section>
		);
	}
}