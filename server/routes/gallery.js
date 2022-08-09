class GalleryRoutes {
	constructor(app) {
		this.app = app;
		this.router = app.express.Router();
		
		this.defaultPerPage = 18;
		this.defaultSorting = 'date ASC';
		this.Pagination = require('../lib/pagination.js');
	}
	
	init() {
		this.router.get('/category/:slug/*?', async (req, res) => {
			const category = {},
				page = parseInt(req.params[0]),
				slug = req.params.slug,
				perPage = req.query.pp || this.defaultPerPage,
				sorting = req.query.sort || this.defaultSorting;
			let paginate;
			const currentPage = (page > 0) ? page : 1;
			const pageUri = `/gallery/category/${slug}/`;
			
			category = await this.app.services.gallery.getCategory(slug);
			
			const ct = await this.app.services.gallery.getEntryCount(category.id);
			paginate = new this.Pagination(ct[0].count, currentPage, pageUri, perPage);
			
			res.render('galler/category', {
				layout: 'site',
				pageTitle: category.name || 'Not Found',
				category: category,
				pages: paginate.links(true),
				perPageDropdown: this.app.utils.buildPerPageDropdown(perPage),
				sortingDropdown: this.app.utils.buildSortingDropdown(sorting)
			});
		});
		
		this.router.get('/entry/:slug/', async (req, res) => {
			const imgTypes = ["image/png", "image/jpg", "image/jpeg", "image/bmp"];
			let entry, isVideo = false;
			
			const e = await this.app.services.gallery.getEntry(req.params.slug);
			entry = e[0];
			
			const cat = await this.app.services.gallery.getCategory(entry.category);
			let items = entry.items;
			
			const info = await this.app.services.gallery.getFileData('/var/www/biw/html/public/assets'+items[0].path);
			
			if(!imgTypes.includes(info)){
				items = items[0];
				isVideo = true;
			}
			
			res.render('gallery/entry', {
				layout: 'site',
				pageTitle: entry.name+' :: Entry',
				entry: entry,
				category: cat[0],
				items: items,
				info: info,
				isVideo: isVideo
			});
		});
		
		this.router.get('/entry/add/:cat/', async (req, res) => {
			const categories = await this.app.services.gallery.getCategories();
			const category = await this.app.services.gallery.getCategory(req.params.cat);
			
			res.render('gallery/entry-add', {
				layout: 'site',
				pageTitle: 'Add Entry',
				categories: categories,
				category: category
			});
		});
		
		this.router.post('/entry/add/:cat/', this.app.galleryUpload.array('file', 24), async (req, res) => {
			const data = {
				name: this.app.utils.normalizeName(req.body.name),
        slug: this.app.utils.normalize(req.body.name),
        category: parseInt(req.params.cat),
        date: this.app.utils.getEpochTime(),
        public: 1,
        featured: 0,
        type: parseInt(req.body.type)
			};
			
			const result = await this.app.services.gallery.createEntry(data);
			const fileData = {};
			const entryId = result.insertId;
			
			if(data.type === 0){
				const file = req.files[0];
				
				await this.app.services.gallery.createThumbnail(file);
				
				fileData = {
					entry: entryId,
					path: file.path,
					thumb: '/images/thumbnails/'+file.filename
				};
				
				await this.app.services.gallery.createItem(fileData);
			}else{
				const files = [];
				for(const f of req.files){
					fileData = {
						entry: entryId,
						path: f.path
					};
					files.push(fileData);
				}
				
				await this.app.services.gallery.bulkCreateItem(files);
			}
			
			res.render('message', {
				layout: 'site',
				pageTitle: 'Success!',
				message: 'You have successfully added the entry. You may <a href="/gallery/entry/'+data.slug+'/">view it here</a>.'
			});
		});
		
		this.router.post('/comments/add/:id/', async (req, res) => {
			const data = {
				title: '',
				text: req.body.comment,
				author: req.session.User.id,
				date: this.app.utils.getEpochTime(),
				entry: req.params.id
			};
			
			const results = await this.app.services.gallery.addComment(data);
			
			let msg = '', entry, category;
			
			if(results.affectedRows){
				msg = 'Comment successfully added.';
			}else{
				msg = 'Something went wrong. Please try again later.';
			}
			
			const e = await this.app.services.gallery.getEntry(data.entry);
			entry = e[0];
			
			const c = await this.app.services.gallery.getCategory(entry.category);
			category = c[0];
			
			const date = this.app.utils.getDate(entry.date);
			
			res.render('gallery/entry', {
				layout: 'site',
				pageTitle: entry.name+' :: Entry',
				entry: entry,
				category: category,
				message: msg
			});
		});
		
		this.router.get('/', async (req, res) => {
			const entries = await this.app.services.gallery.getLatest();
			
			res.render('gallery/home', {
				layout: 'site', 
				pageTitle: 'Gallery',
				entries: entries
			});
		});
		
		return this.router;
	}
}

module.exports = (app, express) => {
	const GR = new GalleryRoutes(app, express);
	return GR.init();
};
