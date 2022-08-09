class UserRoutes {
	constructor(app) {
		this.app = app;
		this.router = app.express.Router();
	}
	
	init() {
		this.router.get('/login/', (req, res) => {
			res.render('login', {
				layout: 'site', 
				pageTitle: 'Login'
			});
		});
		
		this.router.get('/register/', (req, res) => {
			res.render('register', {
				layout: 'site',
				pageTitle: 'Register'
			});
		});
		
		/*
		this.router.get('/cheat', (req, res) => {
			var user = {
				name: 'jason',
				password: 'P455w3rd3d!123',
				fullname: "Jason O'Neal",
				email: "jason.allen.oneal@gmail.com",
				subtype: 0,
				verified: 1,
				admin: 1
			};
			this.service.create(user, (result) => {
				console.log(result);
			});
		});
		*/

		this.router.post('/payment/webhook/', (req, res) => {
			const event = req.body.event_type;
			const data = {
				tid: req.body.id,
				rid: req.body.resource.id,
				name: req.body.resource.payer.name.given_name +' '+req.body.resource.payer.name.surname,
				email: req.body.resource.payer.email_address,
				time: req.body.resource.create_time,
				pid: req.body.resource.payer.payer_id,
				event: event
			};
			
			this.app.services.user.payment(data, (result) => {
				res.send();
			});
		});

		this.router.get('/register/success/', (req, res) => {
			res.render('register-success', {
				layout: 'site',
				pageTitle: 'Register'
			});
		});

		this.router.get('/forgot-password/', (req, res) => {
			res.render('forgot-password', {
				layout: 'site',
				pageTitle: 'Forgot Password'
			});
		});

		this.router.get('/recover-account/', async (req, res) => {
			const ref = req.params.ref;
			const result = await this.app.services.user.checkReset(ref);
			if(result){
				res.render('password-reset', {
					layout: 'site',
					id: result.id,
					token: result.token,
					pageTitle: 'Password Reset'
				});
			}
		});
		
		this.router.get('/account/:slug*?', this.app.utils.tokenAuth, async (req, res) => {
		  var slug = req.params.slug,
		    u;
		  if(slug === undefined){
		    u = req.session.User;
		    
		    res.render('account', {
				  layout: 'site',
				  pageTitle: 'My Account',
				  user: u
			  });
		  }else{
		  	const user = await this.app.services.user.getUser(slug);
		  	u = user[0];
		  	u.joined = this.app.utils.getDate(u.joined);
		  	
		  	res.render('profile', {
		  		layout: 'site',
		  		pageTitle: 'User Profile',
		  		user: u
		  	});
		  }
		});
		
		this.router.post('/account/', this.app.avatarUpload.single('avatar'), this.app.utils.tokenAuth, async (req, res) => {
		  var d = req.body;
		  var file = req.file;
		  
		  let data = {
		    ...req.session.User,
		    ...d
		  };
		  
		  if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
		    data.avatar = file.path.replace("assets", "");
		  }
		  
		  if(data.password === 'PASSWORD'){
		    delete data.password;
		  }
		  delete data.name;
		  delete data.name_clean;
		  
		  await this.app.services.user.update(data);
		  const u = await this.app.services.user.getUser(data.id);
		  req.session.User = u[0];
		  req.session.save();
		  
		  res.render('account', {
		  	layout: 'site',
				pageTitle: 'User Profile',
				user: u[0],
				message: 'User data successfully updated!',
				alert: 'success'
		  });
		});
		
		return this.router;
	}
}

module.exports = (app, express) => {
	const UR = new UserRoutes(app, express);
	return UR.init();
};
