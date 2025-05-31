const autoBind = require("auto-bind");

class UserService {
    constructor() {
        autoBind(this);
    }
}

module.exports = new UserService();
