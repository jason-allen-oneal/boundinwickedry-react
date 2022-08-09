const ffmpeg = require('fluent-ffmpeg'),
	mmm = require('mmmagic'),
	Magic = mmm.Magic;

class GalleryService {
	constructor(app) {
		this.app = app;
	}
	
	async getCategories(parent=0) {
		const query = 'SELECT * FROM gallery_categories WHERE parent = '+parent;
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
			query = 'SELECT * FROM gallery_categories WHERE id = ?';
		}else{
			query = 'SELECT * FROM gallery_categories WHERE slug = "?"';
		}
		
		return await this.app.db.query(query, [id]);
	}
	
	async getCategoryCount() {
		const query = 'SELECT COUNT(id) AS count FROM gallery_categories';
		return await this.app.db.query(query);
	}
	
	async getEntries(id, perPage, offset, sorting) {
		const query = 'SELECT * FROM gallery_entries WHERE category = ? ORDERY BY '+decodeURIComponent(sorting)+' LIMIT '+perPage+' OFFSET '+offset;
		const results = await this.app.db.query(query);
		return Promise.all(results.map(async result => {
			const data = {
				id: result.id,
				name: result.name,
				slug: result.slug,
				date: result.date,
				category: result.category,
				public: result.public,
				featured: result.featured,
				type: result.type
			};
			
			var extra = await Promise.all([
				this.getSingleItemByEntry(data.id)
			]);
			data.image = extra[0][0];
			
			return data;
		}));
	}
	
	async getEntry(id) {
		let query = '';
		
		if(typeof id == 'number'){
			query = 'SELECT * FROM gallery_entries WHERE id = ?';
		}else{
			query = 'SELECT * FROM gallery_entries WHERE slug = "?"';
		}
		
		const results = await this.app.db.query(query, [id]);
		return Promise.all(results.map(async result => {
			const data = {
				id: result.id,
		    name: result.name,
		    slug: result.slug,
		    date: result.date,
		    category: result.category,
		    type: result.type
			};
			
			const extra = await Promise.all([
		    _t.getItemsByEntryId(data.id),
		    _t.getComments(data.id)
		  ]);
		  data.items = extra[0];
		  data.comments = extra[1];
		  
		  return data;
		}));
	}
	
	async getLatest() {
		const query = 'SELECT * FROM gallery_entries ORDER BY date DESC LIMIT 6';
		const results = await this.app.db.query(query);
		return Promise.all(results.map(async result => {
			const data = {
		    id: result.id,
		    name: result.name,
		    slug: result.slug,
		    date: result.date,
		    category: result.category,
		    public: result.public,
		    featured: result.featured,
		    type: result.type
		  };
		  
		  const extra = await Promise.all([
		    this.getSingleItemByEntry(data.id)
		  ]);
		  data.image = extra[0][0];
		  
		  return data;
		}));
	}
	
	async getSingleItemByEntry(id) {
		const query = 'SELECT * FROM gallery_items WHERE entry = ? ORDER BY RAND()';
		const results = await this.app.db.query(query);
		return Promise.all(results.map(async result => {
			const data = {
				id: result.id,
				entry: result.entry,
				thumb: result.thumb,
				path: result.path.replace('assets', '')
			};
			
			return data;
		}));
	}
	
	async updateCategory(data) {
		const query = 'UPDATE gallery_categories SET name = "?", slug = "?" WHERE id = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.name), this.app.utils.normalize(data.slug), data.id]);
	}
	
	async deleteCategory(id) {
		const query = 'DELETE FROM gallery_categories WHERE id = ?';
		return await this.app.db.query(query, [id]);
	}
	
	async createCategory(name) {
		const query = 'INSERT INTO gallery_categories SET name = ?, slug = ?, count = 0';
		return await this.app.db.query(query, [this.app.utils.normalizeName(name), this.app.utils.normalize(name)]);
	}
	
	async createEntry(data) {
		const query = 'INSERT INTO gallery_entries SET name = "?", slug = "?", category = ?, date = ?, public = ?, featured = ?, type = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.name), this.app.utils.normalize(data.name), data.category, data.date, data.public, data.featured, data.type]);
	}
	
	async getItems(id) {
		const query = 'SELECT * FROM gallery_items WHERE entry = ?';
		const results = await this.app.db.query(query, [id]);
		return Promise.all(results.map(async result => {
			const data = {
				id: result.id,
				path: result.path.replace('assets', ''),
				entry: result.entry,
				thumb: result.thumb
			};
			
			return data;
		}));
	}
	
	async updateEntry(data) {
		const query = 'UPDATE gallery_entries SET name = "?", slug = "?", category = ?, public = ?, featured = ? WHERE id = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.name), this.app.utils.normalize(data.slug), data.category, data.public, data.featured, data.id]);
	}
	
	async deleteEntry(id) {
		const query = 'DELETE FROM gallery_entries WHERE id = ?';
		return await this.app.db.query(query, [id]);
	}
	
	async createItem(data) {
		const query = 'INSERT INTO gallery_items (path, entry, thumb) VALUES ("?", ?, "?")';
		return await this.app.db.query(query, [data.path, data.entry, data.thumb]);
	}
	
	async createThumbnail(file) {
		return new Promise((resolve, reject) => {
			ffmpeg(`${file.path}`).on('end', () => {
				resolve();
			}).on('error', (err, stdout, stderr) => {
				reject(err);
			}).screenshots({
				timestamps: ['10%'],
				count: 1,
				filename: `${file.filename}`,
				folder: `/var/www/biw/html/public/images/thumbnails/`,
				size: '100x100'
			});
		});
	}
	
	async bulkCreateItem(data) {
		const promises = [];
		for(const file of data){
			promises.push(this.createItem(file));
		}
		await Promis.all(promises);
	}
	
	async getEntryCount(id=null) {
		let query = '';
		
		if(id == null){
			query = "SELECT COUNT(id) AS count FROM gallery_entries";
		}else{
			query = "SELECT COUNT(id) AS count FROM gallery_entries WHERE category = "+id;
		}
		
		return await this.app.db.query(query);
	}
	
	async addComment(data) {
		const query = 'INSERT INTO gallery_comments SET title = "?", entry = ?, text = "?", date = ?, author = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.title), data.entry, data.text, data.date, data.author]);
	}
	
	async getCommentCount() {
		const query = 'SELECT COUNT(id) AS count FROM gallery_comments';
		return await this.app.db.query(query);
	}
	
	async getComments(id) {
		const query = 'SELECT * FROM gallery_comments WHERE entry = ?';
		const results = await this.app.db.query(query, [id]);
		return Promise.all(results.map(async result => {
			const data = {
				id: result.id,
				title: result.title,
				entry: result.entry,
				text: result.text,
				date: result.date,
				author: {}
			};
			
			var extra = await Promise.all([
				this.app.services.user.getUser(data.author)
			]);
			
			data.author = extra[0][0];
			
			return data;
		}));
	}
	
	async updateVotes(id) {
		const query = 'UPDATE gallery_comments SET votes = votes + 1 WHERE id = ?';
		const results = await this.app.db.query(query, [id]);
		var q = 'SELECT votes FROM gallery_comments WHERE id = ?';
		return await this.app.db.query(q, [id]);
	}
	
	async getFileData(path) {
		return new Promise((resolve, reject) => {
			const magic = new Magic(mmm.MAGIC_MIME_TYPE);
			magic.detectFile(path, (err, result) => {
				if(err){
					console.log(err);
					reject(err);
				}
				resolve(result);
			});
		});
	}
}

module.exports = (app) => {
	return new GalleryService(app);
};
