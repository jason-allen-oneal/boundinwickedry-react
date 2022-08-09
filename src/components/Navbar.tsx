import React from 'react';

import Container from "react-bootstrap/Container";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import Utils from '../Utils';

type Props = {
	user: User;
}

type State = {
	categories: {
		gallery: any;
		blog: any;
		shop: any;
	};
	user: User;
}

export default class NavBar extends React.Component<Props, State>{
	Utils: any;

	constructor(props: Props) {
		super(props);

		this.Utils = new Utils(window.socket)

		this.state = {
			categories: {
				gallery: [],
				blog: [],
				shop: []
			},
			user: this.props.user
		}
	}

	async componentDidMount() {
		const categories = await this.Utils.request('site-categories');
		this.setState({
			categories: categories
		});
	}

	render(): React.ReactNode {
		return (
			<Navbar bg="dark" expand="lg">
				<Container fluid={true}>
					<Navbar.Brand href="#home">Bound In Wickedry</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto">
							<Nav.Link href="#home">Home</Nav.Link>
							<NavDropdown title="Gallery">
								{this.state.categories.gallery && this.state.categories.gallery.map((item: any) => (
									<NavDropdown.Item key={item.id} href="/gallery/{item.slug}">{item.name}</NavDropdown.Item>
								))}
							</NavDropdown>
							<NavDropdown title="Blog">
								{this.state.categories.blog && this.state.categories.blog.map((item: any) => (
									<NavDropdown.Item key={item.id} href="/blog/{item.slug}">{item.name}</NavDropdown.Item>
								))}
							</NavDropdown>
							<NavDropdown title="Shop">
								{this.state.categories.shop && this.state.categories.shop.map((item: any) => (
									<NavDropdown.Item key={item.id} href="/shop/{item.slug}">{item.name}</NavDropdown.Item>
								))}
							</NavDropdown>
							{this.props.user.loggedIn &&
								<div>
									<li className="nav-item">
										<a className="nav-link" href="/user/account/">Account</a>
									</li>
									<li className="nav-item">
										<a className="nav-link" id="logout" href="/user/logout/">Logout</a>
									</li>
								</div>
							}

							{!this.props.user.loggedIn &&
								<div>
									<li className="nav-item">
										<a className="nav-link" href="/user/login/">Login</a>
									</li>
									<li className="nav-item">
										<a className="nav-link" href="/user/register/">Register</a>
									</li>
								</div>
							}
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		);
	}
}