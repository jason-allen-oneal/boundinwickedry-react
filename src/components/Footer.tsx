import React from 'react';

type Props = {
	user: User;
}

type State = {
	user: User;
}

export default class Footer extends React.Component<Props, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			user: this.props.user
		}
	}

	render(): React.ReactNode {
		return (
			<footer className="footer mt-auto bg-dark py-3 fixed-bottom">
				<div className="container">
					<p>&copy; Copyright {new Date().getFullYear()} <strong><span>Bound In Wickedry</span></strong>. All Rights Reserved.</p>
					{this.state.user.isAdmin &&
						<p><a href="/admin/?token={{site.user.token}}">Admin Panel</a></p>
					}
				</div>
			</footer>
		);
	}
}