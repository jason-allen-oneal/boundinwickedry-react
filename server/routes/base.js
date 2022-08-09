class BaseRoutes {
	constructor(core){
		this.core = core;
		this.router = this.core.express.Router();
	}
	
	init(){
		this.router.get('/', (req, res) => {
			
			res.render("site-home", {
    	layout: "index",
     pageTitle: "Home " + req.app.locals.globals.sitename,
    });
		});
		
		return this.router;
	}
}

module.exports = (core, express) => {
	var BR = new BaseRoutes(core, express);
	return BR.init();
};