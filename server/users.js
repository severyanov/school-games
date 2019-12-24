const uuid = require('uuid/v4');

class User {
    constructor(name) {
        this.id = uuid();
        this.name = name;
    }

    toJSON() {
        return {
            name: this.name
        };
    }
}

class Users {
    constructor() {
        this.sessions = new Map();
    }

    exists(name) {
        return this.all.some(user => user.name === name);
    }

    add(name) {
        if (!this.exists(name)) {
            const user = new User(name);
            this.sessions.set(user.id, user);
            return user.id;
        }
    }

    get(sid) {
        if (sid && this.sessions.has(sid)) {
            return this.sessions.get(sid);
        }
    }

    remove(user) {
        if (user) {
            this.sessions.delete(user.id);
        }
    }

    get all() {
        return Array.from(this.sessions.values());
    }
}

function user(users) {
    return function (req, res, next) {
        req.user = users.get(req.cookies.sid);
        next();
    }
}

function auth() {
    return function (req, res, next) {
        if (!req.user) {
            res.sendStatus(401);
        } else {
            next();
        }
    }
}

module.exports = {
    Users,
    user,
    auth
}