class ShopRoutes {
	constructor(app, express) {
		this.app = app;
		this.router = app.express.Router();
		
		this.defaultPerPage = 18;
		this.defaultSorting = 'name ASC';
		this.Pagination = require('../lib/pagination.js');
	}
	
	init() {
		this.router.get('/item/:id/:slug/', async (req, res) => {
			const id = req.params.id;
			let item, category;
			const i = await this.app.services.shop.getItem(id);
			item = i[0];
			
			const cat = await this.app.services.shop.getCategory(item.category);
			category = cat[0];
			
			const keywords = await this.app.utils.generateKeywords(item.description);
			
			res.render('shop/item', {
				layout: 'site',
				pageTitle: item.name,
				item: item,
				category: cateogry,
				keywords: keywords
			});
		});
		
		this.router.get('/category/:id/:slug/*?', async (req, res) => {
			const id = req.params.id,
				slug = req.params.slug,
				page = parseInt(req.params[0]);
			
			const perPage = req.query.pp || this.defaultPerPage,
				sorting = req.query.sort || this.defaultSorting;
			
			const currentPage = (page > 0) ? page : 1;
			const pageUri = `/shop/category/${id}/${slug}/`;
			
			let cat = false, items = [], categories = [];
			
			const results = await this.app.services.shop.getCategoryItemCount(id);
			const paginate = new this.Pagination(results[0].count, currentPage, pageUri, perPage);
			
			const category = await this.app.services.shop.getCategory(id);
			if(category.length > 0){
				cat = category[0];
			}
			
			const itms = await this.app.services.shop.getItems(id, paginate.perPage, paginate.offset, sorting);
			items = itms;
			
			categories = await this.app.services.shop.getSubMenu(cat.id);
			
			const breadcrumbs = await this.app.services.shop.generateBreadcrumbs(cat.id);
			
			res.render('shop/category', {
				layout: 'site',
				pageTitle: (cat.name) ? cat.name : 'Error',
				items: items,
				category: cat,
				subs: categories,
				breadcrumbs: breadcrumbs,
				pages: paginate.links(true),
				perPageDropdown: this.app.utils.buildPerPageDropdown(perPage),
				sortingDropdown: this.app.utils.buildSortingDropdown(sorting)
			});
		});
		
		this.router.get('/', async (req, res) => {
			const items = await this.app.services.shop.getHome();
			const subs = this.app.services.shop.getSubMenu(0);
			
			res.render('shop/home', {
				layout: 'site',
				pageTitle: 'Shop',
				items: items,
				subs: subs
			});
		});
		
		return this.router;
	}
}

module.exports = (app, express) => {
	const SR = new ShopRoutes(app, express);
	return SR.init();
};
