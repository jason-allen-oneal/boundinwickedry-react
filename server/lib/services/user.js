const bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken");

class UserService {
  constructor(core) {
    this.core = core;
  }

  async create(data) {
    let error, json;

    const query = "SELECT id FROM users WHERE email = ?";
    const result = await this.core.db.query(query, [data.email]);
    if (Array.isArray(result) && result.length > 0) {
      error = "You already have an account!";
    }

    if (error != null) {
      json = {
        status: "error",
        message: error,
      };
    } else {
      const hash = await bcrypt.hash(data.password, 12);
      const token = jwt.sign({ data: data.id }, this.core.config.secret, {
        expiresIn: 60 * 60,
      });
      
      const joined = this.core.utils.getEpochTime();
						
					const userData = {
						email: data.email,
						name: data.username,
						fullname: data.fullname || '',
						joined: joined,
						subtype: data.subtype,
						verified: data.verified || 0,
						admin: data.admin || 0
					};
					
					const q = 'INSERT INTO users SET fullname = "'+userData.fullname+'", email = "'+userData.email+'", name = "'+userData.name+'", name_clean = "'+this.core.utils.normalize(userData.name)+'", password = "'+hash+'", joined = '+userData.joined+', admin = '+userData.admin+', subtype = '+userData.subtype+', verified = '+userData.verified;
					const results = await this.core.db.query(q);
					
					userData.id = results.insertId;
					userData.token = jwt.sign(userData, this.core.config.secret, { expiresIn: 60*60 });
					
					const result = await this.update(userData);
					
					if(result){
						const user = await this.getUser(userData.id);
						
						json = {
							status: "ok",
							data: user,
						};
					}
    }

    return json;
  }

  async login(data) {
    let json;

    const query = "SELECT * FROM users WHERE name = ?";
    const results = await this.core.db.query(query, [data.username]);
    if (results.length > 0) {
      const authenticated = await bcrypt.compare(data.password, results[0].pass);
      if (!authenticated) {
        json = {
          status: "error",
          message: "Incorrect username or password.",
        };
      } else {
        const token = jwt.sign(
          { data: results[0].id },
          this.core.config.secret,
          { expiresIn: 60 * 60 }
        );

        const u = {
          id: results[0].id,
          email: results[0].email,
          name: results[0].name,
          fullname: results[0].fullname,
          joined: results[0].joined,
          subtype: results[0].subtype,
          verified: results[0].verified,
          admin: results[0].admin,
          token: token,
          avatar: results[0].avatar,
          bio: results[0].bio,
          slug: results[0].name_clean,
          company: results[0].company,
          address1: results[0].address1,
          address2: results[0].address2,
          city: results[0].city,
          state: results[0].state,
          zip: results[0].zip,
          country: results[0].country
        };

        await this.update(u);

        json = {
          status: "ok",
          data: u,
        };
      }
    } else {
      json = {
        status: "error",
        message: "Incorrect username or password.",
      };
    }

    return json;
  }

  async getUser(id) {
    const query = "SELECT * FROM users WHERE id = ?";
    const results = await this.core.db.query(query, [id]);
    return {
      id: results[0].id,
          email: results[0].email,
          name: results[0].name,
          fullname: results[0].fullname,
          joined: results[0].joined,
          subtype: results[0].subtype,
          verified: results[0].verified,
          admin: results[0].admin,
          token: token,
          avatar: results[0].avatar,
          bio: results[0].bio,
          slug: results[0].name_clean,
          company: results[0].company,
          address1: results[0].address1,
          address2: results[0].address2,
          city: results[0].city,
          state: results[0].state,
          zip: results[0].zip,
          country: results[0].country
    };
  }

  async update(obj) {
    if (typeof obj !== "object") {
      console.log("User update error!");
      return false;
    }

    let query = "UPDATE users SET ";
    let i = 1;

    for (const [key, value] of Object.entries(obj)) {
      query += key + " = ";
      if (key === "zip") {
        if (value === "") {
          value = 0;
        }
      }
      if (!this.core.utils.isNumeric(value)) {
        query += '"' + value + '"';
      } else {
        query += parseInt(value);
      }

      if (i < Object.keys(obj).length) {
        query += ", ";
      }

      i++;
    }

    query += " WHERE id = " + obj.id;
    
    const result = await this.core.db.query(query);
    
    if(result.affectedRows > 0){
      return true;
    } else {
      return false;
    }
  }
}

module.exports = (app) => {
  return new UserService(app);
};
