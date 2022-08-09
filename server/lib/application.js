const express = require("express"),
  { create } = require("express-handlebars"),
  session = require("express-session"),
  MySQLStore = require("express-mysql-session")(session),
  { Server } = require("socket.io"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  compression = require("compression"),
  helmet = require("helmet"),
  logger = require("./logger"),
  db = require("./db");
require("dotenv").config({ path: process.cwd()+"/.env" });

class Application {
  constructor() {
    this.logger = logger;

    this.express = express;
    this.expressApp = express();
  }

  async initialize() {
    this.db = await db.initialize();
    this.config = await this.getConfig();

    this.server = require("./server.js")(this);
    this.io = new Server(this.server.server, {
      cors: {
        origin: false,
      },
    });

    this.services = {
      user: require("./services/user")(this),
    };

    this.utils = require("./utils")(this);

    return this;
  }

  start() {
    /*
		this.expressApp.use(
			helmet({
				contentSecurityPolicy: {
					useDefaults: false,
					directives: {
						defaultSrc: ["'self'"],
						scriptSrc: ["'self'"],
						fontSrc: ["'self'", "use.fontawesome.com"],
						styleSrc: ["'self'", "cdn.jsdelivr.net", "use.fontawesome.com"],
						imgSrc: ["'self'"],
						connectSrc: ["'self'"],
						frameSrc: [],
						objectSrc: ["'none'"],
						upgradeInsecureRequests: [],
					},
				},
				hsts: {
					maxAge: 31536000,
					preload: true
				},
				noSniff: true,
				referrerPolicy: {
					policy: 'strict-origin'
				},
				originAgentCluster: true
			})
		);
		*/
    this.expressApp.disable("x-powered-by");

    this.expressApp.use(
      bodyParser.urlencoded({
        extended: false,
      })
    );
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(cookieParser());
    this.expressApp.use(this.express.static(process.cwd()+"/public/assets"));
    this.expressApp.use(compression());

    this.expressApp.use((req, res, next) => {
      res.set("Cache-Controle", "no-store");
      next();
    });

    const handlebars = create({
      extname: "html",
      defaultLayout: "index",
      layoutsDir: process.cwd()+"/public/views/layouts/",
      partialsDir: process.cwd()+"/public/views/partials/",
    });
    this.expressApp.set("view engine", "html");
    this.expressApp.engine("html", handlebars.engine);
    this.expressApp.set("views", process.cwd()+"/public/views");

    const sessionStore = new MySQLStore({}, this.db.pool);

    const sessionMiddleware = session({
      secret: this.config.secret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
    });
    this.expressApp.use(sessionMiddleware);
    const wrap = (middleware) => (socket, next) =>
      middleware(socket.request, {}, next);
    this.io.use(wrap(sessionMiddleware));

    // routes
    const baseRoutes = require("../routes/base")(this);
    this.expressApp.use("/", baseRoutes);

    // controllers
    const userController = require("../controllers/user");

    this.io.on("connection", (socket) => {
      this.logger.info("user connected");

      userController.init(this, socket);
    });

    this.expressApp.use((req, res, next) => {
      req.logdata = {
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        ip: req.ip,
      };

      next();
    });

    // Log all requests
    this.expressApp.use((req, res, next) => {
      this.logger.info("Request", req.logdata);

      next();
    });

    // Set req._data = {}
    this.expressApp.use((req, res, next) => {
      req._data = {};
      next();
    });

    // Handle 404
    this.expressApp.use((req, res) => {
      this.logger.error("404", {
        method: req.method,
        url: req.url,
        query: req.query,
        ip: req.ip,
      });

      res.status(404);
      res.send("404: Page not found");
    });

    // Handle 500 errors
    this.expressApp.use((err, req, res, next) => {
      if (!err) {
        return next();
      }

      this.logger.error("500", {
        method: req.method,
        url: req.url,
        query: req.query,
        ip: req.ip,
        error: err,
      });

      res.status(500);
      res.send("500: Internal server error");
    });

    this.expressApp.locals.globals = {
      sitename: this.config.sitename,
      base: this.config.protocol + "://" + this.config.servername,
      copyYear: new Date().getFullYear(),
    };

    this.server.start(this.config.port);
  }

  async getConfig() {
    let config = {};

    var query = "SELECT * FROM config";
    const results = await this.db.query(query);

    for (let i = 0; i < results.length; i++) {
      const name = results[i].name,
        value = results[i].value;
      config[name] = value;
    }

    return config;
  }

  async updateConfig(name, value) {
    var query =
      'UPDATE config SET value = "' + value + '" WHERE name = "' + name + '"';
    await this.db.query(query);
  }
}

module.exports = new Application();