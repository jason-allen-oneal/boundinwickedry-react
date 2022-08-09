const express = require('express'),
	multer = require('multer'),
	{Server} = require('socket.io'),
	fs = require('fs'),
	db = require('./db');

class App {
	constructor(rootDir){
		this.appRoot = rootDir;
		this.express = express;
		this.app = express();
		
		this.allowedGalleryMimes = ["image/png", "image/jpg", "image/jpeg", "image/bmp", "video/mp4", "video/webm", "video/x-m4v", "video/quicktime"];
		this.allowedAvatarMimes = ["image/png", "image/jpg", "image/jpeg", "image/bmp", "image/gif"];
	}
	
	async initialize(server) {
		this.db = await db.initialize();
		this.config = await this.getConfig();
		
		this.galleryUpload = multer({
			dest: this.appRoot+'/public/assets/images/gallery/',
			fileFilter: (_req, file, cb) => {
				if(this.allowedGalleryMimes.includes(file.mimetype)){
					cb(null, true);
				}else{
					cb(null, false);
					return cb(new Error('File format not allowed!'));
				}
			}
		});
	
		this.avatarUpload = multer({
			dest: this.appRoot+'/public/assets/images/avatars/',
			fileFilter: (_req, file, cb) => {
				if(this.allowedAvatarMimes.includes(file.mimetype)){
					cb(null, true);
				}else{
					cb(null, false);
					return cb(new Error('File format not allowed!'));
				}
			}
		});
		
		this.io = new Server(server);
		
		this.services = {
			blog: require('./services/blog')(this),
			gallery: require('./services/gallery')(this),
			shop: require('./services/shop')(this),
			user: require('./services/user')(this)
		};
		this.utils = require('./utils.js')(this);
		
		return this;
	}
	
	async getConfig(){
		let config = {};
		
		var query = "SELECT * FROM config";
		const results = await this.db.query(query);
		
		for(let i = 0; i < results.length; i++){
			const name = results[i].name,
				value = results[i].value;
			config[name] = value;
		}
		
		return config;
	}
	
	async updateConfig(name, value){
	  var query = 'UPDATE config SET value = "'+value+'" WHERE name = "'+name+'"';
	  await this.db.query(query);
	}
}

module.exports = (rootDir) => {
	return new App(rootDir);
};