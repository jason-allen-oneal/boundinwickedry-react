class ShopService {
	constructor(app) {
		this.app = app;
	}
	
	async getCategories(parent=0) {
		const query = 'SELECT * FROM shop_categories WHERE parent = '+parent;
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
			query = 'SELECT * FROM shop_categories WHERE id = ?';
		}else{
			query = 'SELECT * FROM shop_categories WHERE slug = "?"';
		}
		
		return await this.app.db.query(query, [id]);
	}
	
	async getCategoryCount() {
		const query = 'SELECT COUNT(id) AS count FROM shop_categories';
		return await this.app.db.query(query);
	}
	
	async getCategoryItemCount(id) {
		const query = 'SELECT COUNT(*) AS count FROM shop_items WHERE category = ?';
		return this.app.db.query(query, [id]);
	}
	
	async getItems(category, perPage, offset, sorting) {
		const query = 'SELECT * FROM shop_items WHERE category = ? ORDER BY '+decodeURIComponent(sorting)+' LIMIT '+perPage+' OFFSET '+offset;
		const results = await this.app.db.query(query, [category]);
		
		return Promise.all(results.map(async result => {
			const item = {
				id: result.id,
				name: result.name,
				slug: result.slug,
				price: result.price,
				priceFormatted: this.app.utils.formatPrice(result.price),
				image: result.image
			};
			item.image = item.image.replaceAll("'", "");
			
			return item;
		}));
	}
	
	async getItem(id) {
		let query = '';
		if(typeof id == 'number'){
			query = 'SELECT * FROM shop_items WHERE id = ?';
		}else{
			query = 'SELECT * FROM shop_items WHERE slug = "?"';
		}
		const results = await this.app.db.query(query, [id]);
		return Promise.all(results.map(async result => {
			const item = {
				id: result.id,
				name: result.name,
				slug: result.slug,
				model: result.model,
				price: result.price,
				priceFormatted: this.app.utils.formatPrice(result.price),
				category: result.category,
				image: result.image,
				description: result.description,
				brand: result.brand,
				color: result.color,
				size: result.size,
				option: result.option,
				flavor: result.flavor,
				scent: result.scent,
				material: result.material,
				power: result.power,
				height: result.height,
				length: result.length,
				length_insertable: result.length_insertable,
				diameter: result.diameter,
				upc: result.upc,
				features: result.features
			};
			item.description = item.description.replaceAll("'", "");
			item.image = item.image.replaceAll("'", "");
			
			const extra = await Promise.all([
				this.getCategory(item.category)
			]);
			item.category = extra[0];
			
			return item;
		}));
	}
	
	async getHome() {
		const query = 'SELECT * FROM shop_items ORDER BY RAND() LIMIT 6';
		const results = await this.app.db.query(query);
		return Promise.all(results.map(async result => {
			const item = {
				id: result.id,
				name: result.name,
				slug: result.slug,
				price: result.price,
				priceFormatted: this.app.utils.formatPrice(result.price),
				image: result.image
			};
			item.image = item.image.replaceAll("'", "");
			
			const extra = await Promise.all([
				this.getCategory(result.category)
			]);
			item.category = extra[0];
			
			return item;
		}));
	}
	
	async updateCategory(data) {
		const query = 'UPDATE shop_categories SET name = "?", slug = "?", parent = ?, hidden = ? WHERE id = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.name), this.app.utils.normalize(data.name), data.parent, data.hidden, data.id]);
	}
	
	async deleteCategory(id) {
		const query = 'DELETE FROM shop_categories WHERE id = ?';
		return await this.app.db.query(query, [id]);
	}
	
	async createItem(item) {
		var data = {
			title: this.app.utils.normalizeName(item.title),
			slug: this.app.utils.normalize(item.title),
			model: item.model,
			price: item.price,
			category: item.cat,
			image: this.app.db.escape(item.image),
			description: this.app.db.escape(item.description),
			upc: (item.upc) ? parseInt(item.upc) : 0,
			brand: item.brand,
			color: item.color,
			size: item.size,
			option: item.option,
			flavor: item.flavor,
			scent: item.scent,
			material: item.material,
			power: (item.power) ? item.power : '',
			features: item.features,
			height: item.height,
			length: item.length,
			length_insertable: item.length_insertable,
			diameter: (item.diameter) ? item.diameter : ''
		};
		
		if(isNaN(data.upc)){
			data.upc = 0;
		}
		
		if(data.features.includes('"')){
			var newStr = data.features.replace('"', ' inch');
			data.features = newStr;
		}
		
		const query = `INSERT INTO shop_items (name, slug, model, price, category, image, description, upc, brand, color, size, option, flavor, scent, material, power, features, height, length, length_insertable, diameter) VALUES ("?", "?", "?", "?", ?, "?", "?", ?, "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?")`;
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.title), this.app.utils.normalize(data.title), data.model, data.price, data.category, data.image, data.description,  data.upc, data.brand, data.color, data.size, data.option, data.flavor, data.scent, data.material, data.power, data.features, data.height, data.length, data.length_insertable, data.diameter]);
	}
	
	async updateItem(data) {
		const query = 'UPDATE shop_items SET name = "?", slug = "?", model = "?", price = "?", category = ?, image = "?", description = "?", upc = ?, brand = "?", color = "?", size = "?", option = "?", flavor = "?", scent = "?", material = "?", power = "?", features = "?", height = "?", length = "?", length_insertable = "?", diameter = "?" WHERE id = ?';
		return await this.app.db.query(query, [this.app.utils.normalizeName(data.name), this.app.utils.normalize(data.slug), data.model, data.price, data.category, data.image, data.description,  data.upc, data.brand, data.color, data.size, data.option, data.flavor, data.scent, data.material, data.power, data.features, data.height, data.length, data.length_insertable, data.diameter]);
	}
	
	async getCategoryCount() {
		const query = 'SELECT COUNT(id) AS count FROM shop_categories';
		return await this.app.db.query(query);
	}
	
	async getItemCount() {
		const query = 'SELECT COUNT(id) AS count FROM shop_items';
		return await this.app.db.query(query);
	}
	
	async checkIfCategoryExists(cat) {
		const query = 'SELECT id FROM shop_categories WHERE name = "?"';
		const results = await this.app.db.query(query, [cat]);
		if(results.length > 0){
			return true;
		}else{
			return false;
		}
	}
	
	async checkIfItemExists(slug, cat) {
		const query = 'SELECT id FROM shop_items WHERE slug = "?" AND category = ?';
		const results = await this.app.db.query(query, [slug, cat]);
		if(results.length > 0){
			return results[0].id;
		}else{
			return false;
		}
	}
	
	async generateBreadcrumbs(currentCat, admin=false) {
		let parent = 0, gp = 0, ggp = 0, crumbs = '',
			current = await this.getCategory(currentCat);
		current = current[0];
		
		if(current.parent){
			parent = await this.getCategory(current.parent);
			parent = parent[0];
			if(parent.parent){
				gp = await this.getCategory(parent.parent);
				gp = gp[0];
				if(gp.parent){
					ggp = await this.getCategory(gp.parent);
					ggp = ggp[0];
				}
			}
		}
		
		crumbs = '<nav aria-label="breadcrumb"><ol class="breadcrumb">';
    if(admin){
      crumbs += '<li class="breadcrumb-item"><a href="/admin/">Dasboard</a></li><li class="breadcrumb-item">Shop</li><li class="breadcrumb-item"><a href="/admin/shop/categories/">Categories</a></li>';
    }
    
    if(ggp){
      var ggpUrl = '/';
      if(admin){
        ggpUrl += 'admin/';
      }
      ggpUrl += 'shop/';
      if(admin){
        ggpUrl += 'categories/'+ggp.id+'/';
      }else{
        ggpUrl += 'category/'+ggp.id+'/'+ggp.slug+'/';
      }
      crumbs += '<li class="breadcrumb-item"><a href="'+ggpUrl+'">'+ggp.name+'</a></li>';
    }
    
    if(gp){
      var gpUrl = '/';
      if(admin){
        gpUrl += 'admin/';
      }
      gpUrl += 'shop/';
      if(admin){
        gpUrl += 'categories/'+gp.id+'/';
      }else{
        gpUrl += 'category/'+gp.id+'/'+gp.slug+'/';
      }
      crumbs += '<li class="breadcrumb-item"><a href="'+gpUrl+'">'+gp.name+'</a></li>';
    }
    
    if(parent){
      var pUrl = '/';
      if(admin){
        pUrl += 'admin/';
      }
      pUrl += 'shop/';
      if(admin){
        pUrl += 'categories/'+parent.id+'/';
      }else{
        pUrl += 'category/'+parent.id+'/'+parent.slug+'/';
      }
      crumbs += '<li class="breadcrumb-item"><a href="'+pUrl+'">'+parent.name+'</a></li>';
    }
    
    var cUrl = '/';
    if(admin){
      cUrl += 'admin/';
    }
    
    crumbs += '<li class="breadcrumb-item active" aria-current="page">'+current.name+'</li></ol></nav>';
    
    return crumbs;
	}
}

module.exports = (app) => {
	return new ShopService(app);
};
