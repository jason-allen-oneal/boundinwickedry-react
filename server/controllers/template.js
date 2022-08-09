const template = require('../lib/template.js');

class TemplateController {
	constructor() { }

	init(app, socket) {
		socket.on('site-categories', async () => {
			const galleryCategories = await app.services.gallery.getCategories();
			const blogCategories = await app.services.blog.getCategories();
			const shopCategories = await app.services.shop.getCategories();

			const json = {
				gallery: galleryCategories,
				blog: blogCategories,
				shop: shopCategories
			};

			socket.emit('site-categories-response', json);
		});

		socket.on('template-gallery-carousel', async (input) => {
			const id = input.entry;

			const e = await app.services.gallery.getEntry(id);
			const entry = e[0];

			const json = {
				data: {
					items: entry.items,
					title: entry.name
				},
				html: 'carousel'
			};

			const html = template.build(json);

			socket.emit('template-gallery-carousel-response', { data: json.data.title, html: html });
		});
	}
}

module.exports = new TemplateController();
