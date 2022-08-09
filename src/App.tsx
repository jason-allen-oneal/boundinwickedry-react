import React from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route
} from "react-router-dom";

import Utils from './Utils';

import NavBar from './components/Navbar';
import Footer from './components/Footer';
import Home from './modules/Home';
import Login from './components/Login';
import Registration from './components/Registration';

export default class App extends React.Component<any, any>{
	Utils: any;

	constructor(props: any) {
		super(props);

		this.Utils = new Utils(window.socket);

		this.state = {
			categories: {
				gallery: {},
				blog: {},
				shop: {}
			},
			user: {
				loggedIn: false,
				isAdmin: false
			}
		};

		this.handleRegister = this.handleRegister.bind(this);
		this.handleLogin = this.handleLogin.bind(this);
	}

	async handleRegister(data: any) {
		const results = this.Utils.request('user-register', data);
	}

	async handleLogin(data: any) {
		const results = this.Utils.request('user-login', data);
	}

	render(): React.ReactNode {
		return (
			<Router>
				<div>
					<NavBar user={this.state.user} />
					<Routes>
						<Route path="/gallery">
							Gallery
						</Route>
						<Route path="/blog">
							Blog
						</Route>
						<Route path="/shop">
							Shop
						</Route>
						<Route path="/user">
							<Route path="register" element={<Registration onRegisterSubmit={this.handleRegister} />} />
							<Route path="login" element={<Login onLoginSubmit={this.handleLogin} />} />
						</Route>
						<Route path="/">
							<Home />
						</Route>
					</Routes>
					<Footer user={this.state.user} />
				</div>
			</Router>
		);
	}
}