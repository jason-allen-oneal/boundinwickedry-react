/**
 * Abstract Route class.
 *
 * @class Route
 */
class Route {
	constructor(app, express) {
		if(this.constructor == Route) {
			throw new Error('Abstract class "Route" cannot be instantiated.');
		}
		
		this.app = app;
		this.router = express.Router();
	}
	
	init() {
		throw new Error("Method 'init()' must be implemented.");
	}
}

module.exports = Route;
