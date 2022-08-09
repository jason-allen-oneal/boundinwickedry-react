const fs = require('fs');

class UserController {
	constructor(){}
	
	init(app, socket) {
		socket.on('user-login', async (input) => {
			const data = {
				name: input.name,
				password: input.password
			};
			
			const result = await app.services.user.login(data);
			
			if(result.status === "ok"){
				socket.request.session.User = result.data;
				socket.request.session.save();
			}
			
			result.redirect = global.redirect;
			
			if(result.redirect.includes('login')){
				result.redirect = '/';
			}
			
			socket.emit('user-login-response', result);
		});
		
		socket.on('user-register', async (input) => {
			const data = {
				username: input.username,
				email: input.email,
				password: input.password,
				subtype: input.subtype
			};
			
			fs.promises.readFile('views/partials/register2.html', 'UTF8').then((html) => {
				const json = {
					data: data,
					html: html
				};
				
				socket.emit('user-register-response', json);
			});
		});
		
		socket.on('user-register-complete', async (input) => {
			const result = await app.services.user.create(input);
			socket.emit('user-register-complete-response', result);
		});
		
		socket.on('user-logout', () => {
			socket.request.session.User = {
				id: 0,
				name: 'Guest',
				email: '',
				joined: 0,
				admin: 0,
				token: '',
				verified: 0,
				fullname: '',
				subtype: 0
			};
			
			socket.emit('user-logout-response', {status: 'ok'});
		});
		
		socket.on('user-forgot-password', async (input) => {
      const data = {
				username: input.username,
				email: input.email
			};
			
			const result = await app.services.user.recover(data);
			let msg = '';
			
			if(result){
				msg = 'An email has been sent to the email address on file, if it exists, with instructions on how to reset your password.';
			}else{
				 msg = 'An error has occurred. Please try again later.';
			}
			
			socker.emit('user-forgot-password-response', {msg: msg});
    });
    
    socket.on('user-recover-account', async (input) => {
      const data = {
				password: input.password,
				id: input.id,
				token: input.token
			};
			
			if(data.token === global.token){
				var decoded = jwt.verify(data.token, config.server.secret);
				
				if(decoded.id === data.id){
					const data = await app.services.user.resetPassword(data);
					socket.emit('user-recover-account-response', {msg: 'Your password has been reset, and you may now login securely.'});
				}else{
				  socket.emit('user-recover-account-response', {msg: 'Password recovery ID mismatch'});
				}
			}else{
				socket.emit('user-recover-account-response', {msg: 'Password recovery token mismatch'});
			}
    });
	}
}

module.exports = new UserController();
