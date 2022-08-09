class BlogRoutes {
	constructor(app) {
		this.app = app;
		this.router = app.express.Router();
	}
	
	init() {
		this.router.get('/article/:id/', async (req, res) => {
			let article;
			
			const art = await this.app.services.blog.getArticle(article.id);
			article = art[0];
			
			const comments = await this.app.services.blog.getComments(article.id);
			
			const keywords = await this.app.utils.generateKeywords(article.text);
			
			res.render('blog/article', {
				layout: 'site',
				pageTitle: article.title+' :: Article',
				article: article,
				keywords: keywords
			});
		});
		
		this.router.get('/article/add/:id/', this.app.utils.tokenAuth, async (req, res) => {
			const cat = parseInt(req.params.id);
			
			const cats = await this.app.services.blog.getCategories();
			let categoryOpts = '';
			for(let i = 0; i < cats.length; i++){
				let selected = '';
				if(cat == cats[i].id){
					selected = ' selected';
				}
				categoryOpts += '<option value="'+cats[i].id+'"'+selected+'>'+cats[i].name+'</option>';
			}
			
			res.render('blog/article-add', {
				layout: 'site',
				pageTitle: 'Add Article',
				categoryOpts: categoryOpts,
				cat: cat
			});
		});
		
		this.router.post('/article/add/:id/', this.app.utils.tokenAuth, async (req, res) => {
			let isPublic = false;
			
			if(req.body.public != undefined){
				isPublic = true;
			}
			
			const data = {
				title: this.app.utils.normalizeName(req.body.title),
				text: req.body.body,
				slug: this.app.utils.normalize(req.body.title),
				category: req.body.category,
				featured: 0,
				public: (isPublic) ? 1 : 0,
				date: this.app.utils.getEpochTime(),
				author: req.session.User.id
			};
			
			const result = await this.app.services.blog.createArticle(data);
			let msg, pageTitle;
			
			if(result.affectedRows){
				msg = 'You have successfully added the article. <a href="/blog/article/'+data.slug+'/">Click here to view.</a>';
				pageTitle = 'Success!';
			}else{
				msg = 'Something went wrong. Please try again later.';
				pageTitle = 'Ooops!';
			}
			
			res.render('message', {
				layout: 'site',
				pageTitle: pageTitle,
				message: msg
			});
		});
		
		this.router.post('/comments/add/:id/', async (req, res) => {
			const data = {
				title: '',
		    text: req.body.comment,
		    author: req.session.User.id,
		    date: this.app.utils.getEpochTime(),
		    article: req.params.id
			};
			
			const results = await this.app.services.blog.addComment(data);
			
			let msg = '', article, category;
			
			if(results.affectedRows){
				msg = 'Comment successfully added.';
			}else{
				msg = 'Something went wrong. Please try again later.';
			}
			
			const a = this.app.services.blog.getArticle(data.article);
			article = a[0];
			
			const date = this.app.utils.getDate(article.date);
			
			res.render('blog/article', {
				layout: 'site', 
				pageTitle: category.name,
				article: article,
				message: msg
			});
		});
		
		this.router.get('/category/:id/', async (req, res) => {
			let hasArticles = true, category;
			
			const cat = await this.app.services.blog.getCategory(req.params.id);
			category = cat[0];
			
			const articles = await this.app.services.blog.getArticles(category.id);
			
			if(articles.length === 0){
				hasArticles = false;
			}
			
			res.render('blog/home', {
				layout: 'site',
				pageTitle: category.name,
				hasArticles: hasArticles,
				articles: articles,
				category: category
			});
		});
		
		this.router.get('/', async (req, res) => {
			let fArticle = false, featuredArticle;
			
			const featured = await this.app.services.blog.getFeatured();
			
			if(featured.length > 0){
				fArticle = featured[0];
				const date = this.app.utils.getShortDate(fArticle.date),
					text = this.app.utils.truncate(fArticle.text);
				
				const featuredArticle = {
					title: fArticle.title,
					date: date,
					slug: fArticle.slug,
					text: text
				};
			}
			
			const articles = await this.app.services.blog.getHome();
			const cats = await this.app.services.blog.getCategories();
			
			res.render('blog/home', {
				layout: 'site',
				pageTitle: 'Blog',
				category: {id: 0, name: 'Blog'},
				categories: cats,
				articles: articles,
				featured: featuredArticle
			});
		});
		
		return this.router;
	}
}

module.exports = (app, express) => {
	const BR = new BlogRoutes(app, express);
	return BR.init();
};
