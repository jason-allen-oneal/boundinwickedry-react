import React from "react";

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

type Props = {
	onLoginSubmit: (data: any) => void;
}

export default class Login extends React.Component<Props, any> {
	constructor(props: any) {
		super(props);
	}

	onSubmit() {
		const errorEl = document.getElementById('login-error') as HTMLElement;

		const username = document.getElementById('login-name') as HTMLInputElement;
		const password = document.getElementById('login-password') as HTMLInputElement;

		if (username.value === '' || password.value === '') {
			errorEl.innerHTML = 'You must fill out all the fields.';
			return;
		}

		const input = {
			username: username.value,
			password: password.value
		};

		this.props.onLoginSubmit(input);
	}

	render(): React.ReactNode {
		return (
			<section className="content-section p-3 bg-dark border rounded">
				<Row>
					<Col className="col-8">
						<h1>Login</h1>
						<div id="login-error"></div>
						<Form>
							<Form.Group className="mb-3" controlId="login-name">
								<Form.Label>Username</Form.Label>
								<Form.Control type="text" placeholder="Username" />
							</Form.Group>
							<Form.Group className="mb-3" controlId="login-password">
								<Form.Label>Password</Form.Label>
								<Form.Control type="password" placeholder="Password" />
							</Form.Group>
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