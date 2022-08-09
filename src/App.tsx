import React from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route
} from "react-router-dom";

import io from "socket.io-client";
let socket = io(`http://23.234.250.103:33032`);

import NavBar from './components/Navbar';
import Footer from './components/Footer';
import Home from './modules/Home';


export default class App extends React.Component<any, any>{
	constructor(props: any) {
		super(props);

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
		}
	}

	render(): React.ReactNode {
		return (
			<Router>
				<div>
					<NavBar user={this.state.user} socket={socket} />
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
							User
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