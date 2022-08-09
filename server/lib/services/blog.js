class BlogService {
	constructor(app) {
		this.app = app;
	}
	
	async getCategories(parent=0) {
		const query = 'SELECT * FROM blog_categories WHERE parent = '+parent;
		const results = await this.app.db.query(query);
		
		return Promise.all(results.map(async result => {
			const data = {
				id: result.id,
				name: result.name,
				slug: result.slug,
				count: result.count,
				parent: result.parent,
				hidden: result.hidden,
				subCats: []
			};
			
			const extra = await Promise.all([
				this.getCategories(data.id)
			]);
			data.subCats = extra[0];
			
			return data;
		}));
	}
	
	async getCategory(id) {
		let query = '';
		
		if(typeof id == 'number'){
			query = 'SELECT * FROM blog_categories WHERE id = ?';
		}else{
			query = 'SELECT * FROM blog_categories WHERE slug = "?"';
		}
		
		return await this.app.db.query(query, [id]);
	}
	
	async getCategoryCount() {
		const query = 'SELECT COUNT(id) AS count FROM blog_categories';
		return await this.app.db.query(query);
	}
	
	async getFeaturedArticle() {
		const query = 'SELECT * FROM blog_articles WHERE featured = 1';
		return await this.app.db.query(query);
	}
	
	async getHome() {
		const query = 'SELECT * FROM blog_articles WHERE featured = 0 AND public = 1 LIMIT 4';
		const results = await this.app.db.query(query);
		return Promise.all(results.map(async result => {
			const data = {
		    id: result.id,
		    title: result.title,
		    date: _t.core.getShortDate(result.date),
		    author: result.author,
		    text: result.text.length > 200 ? this.app.utils.truncate(result.text) : result.text,
		    slug: result.slug,
		    category: result.category
		  };
		  
		  const extra = await Promise.all([
		    this.app.services.user.getUser(data.author),
		    this.getCategory(data.category)
		  ]);
		  
		  data.author = extra[0][0];
		  data.category = extra[1][0];
		  
		  return data;
		}));
	}
	
	async updateCategory(data) {
		const query = 'UPDATE blog_categories SET name = "?", slug = "?", count = ? WHERE id = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.name), this.app.utils.normalize(data.slug), data.count]);
	}
	
	async deleteCategory(id) {
		const query = 'DELETE FROM blog_categories WHERE id = ?';
		return await this.app.db.query(query);
	}
	
	async createCategory(name) {
		const query = 'INSERT INTO blog_categories SET name = "?", slug = "?", count = 0';
		return await this.app.db.query(query, [this.app.utils.normalizeName(name), this.app.utils.normalize(name)]);
	}
	
	async getArticle(id) {
		let query = '';
		
		if(typeof id == 'number'){
			query = 'SELECT * FROM blog_articles WHERE id = ?';
		}else{
			query = 'SELECT * FROM blog_articles WHERE slug = "?"';
		}
		
		const results = await this.app.db.query(query, [id]);
		return Promise.all(results.map(async result => {
			const data = {
		    id: result.id,
		    title: result.title,
		    date: this.app.utils.getShortDate(result.date),
		    author: result.author,
		    text: result.text.length > 200 ? this.app.utils.truncate(result.text) : result.text,
		    slug: result.slug,
		    category: result.category
		  };
		  
		  const extra = await Promise.all([
		    this.app.services.user.getUser(data.author),
		    this.getCategory(data.category),
		    this.getComments(data.id)
		  ]);
		  
		  data.author = extra[0][0];
		  data.category = extra[1][0];
		  data.comments = extra[2];
		  
		  return data;
		}));
	}
	
	async getArticles(id) {
		const query = 'SELECT * FROM blog_articles WHERE category = ?';
		const results = await this.app.db.query(query, [id]);
		return Promise.all(results.map(async result => {
			const data = {
		    id: result.id,
		    title: result.title,
		    date: this.app.utils.getShortDate(result.date),
		    author: result.author,
		    text: result.text.length > 200 ? this.app.utils.truncate(result.text) : result.text,
		    slug: result.slug,
		    category: result.category
		  };
		  
		  const extra = await Promise.all([
		    _this.app.services.user.getUser(data.author)
		  ]);
		  
		  data.author = extra[0][0];
		  
		  return data;
		}));
	}
	
	async updateArticle(data) {
		const query = 'UPDATE blog_articles SET title = "?", slug = "?", date = ?, author = ?, text = "?", , featured = ?, category  = "?", public = ? WHERE id = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.title), this.app.utils.normalize(data.slug), data.date, data.author, data.text, data.featured, data.category, data.public, data.id]);
	}
	
	async deleteArticle(id) {
		const query = 'DELETE FROM blog_articles WHERE id = ?';
		return await this.app.db.query(query, [id]);
	}
	
	async createArticle(data) {
		const query = 'INSERT INTO blog_articles SET title = "?", date = ?, author = ?, text = "?", featured = ?, slug = "?", category  = ?, public = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.title), this.app.utils.normalize(data.title), data.date, data.author, data.text, data.featured, data.category, data.public, data.id]);
	}
	
	async getArticleCount() {
		const query = 'SELECT COUNT(id) AS count FROM blog_articles';
		return await this.app.db.query(query);
	}
	
	async addComment(data) {
		const query = 'INSERT INTO blog_comments SET title = "?", article = ?, text = "?", date = ?, author = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.title), data.article, data.text, data.author]);
	}
	
	async getCommentCount() {
		const query = 'SELECT COUNT(id) AS count FROM blog_comments';
		return await this.app.db.query(query);
	}
	
	async getComments(id) {
		const query = 'SELECT * FROM blog_comments WHERE article = ?';
		const results = await this.app.db.query(query, [id]);
		return Promise.all(results.map(async result => {
			const data = {
		    id: result.id,
		    title: result.title,
		    article: result.article,
		    text: result.text,
		    date: result.date,
		    author: result.author
		  };
		  
		  const extra = await Promise.all([
		    this.app.services.user.getUser(data.author)
		  ]);
		  
		  data.author = extra[0][0];
		  
		  return data;
		}));
	}
}

module.exports = (app) => {
	return new BlogService(app);
};
