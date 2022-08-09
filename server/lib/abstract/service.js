/**
 * Abstract Service class.
 *
 * @class Service
 */
class Service {
	constructor(type, app) {
		if(this.constructor == Service) {
			throw new Error('Abstract class "Service" cannot be instantiated.');
		}
		
		this.app = app;
		this.type = type;
	}
	
	async getCategories(parent=0) {
		const query = 'SELECT * FROM '+this.type+'_categories WHERE parent = '+parent;
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
			query = 'SELECT * FROM '+this.type+'_categories WHERE id = ?';
		}else{
			query = 'SELECT * FROM '+this.type+'_categories WHERE slug = "?"';
		}
		
		return await this.app.db.query(query, [id]);
	}
	
	async getCategoryCount() {
		const query = 'SELECT COUNT(id) AS count FROM '+this.type+'_categories';
		return await this.app.db.query(query);
	}
}

module.exports = Service;
