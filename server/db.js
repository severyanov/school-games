const path = require('path');
const sqlite = require('sqlite');
const dbPath = path.join(process.cwd(), 'db');

function open() {
    return sqlite.open(dbPath, { mode: 6 });
}

function withDb(fn) {
    return async (req, res) => {
        const db = await open();
        try {
            req.db = db;
            await fn(req, res);
        } catch (e) {
            res.status(503).send(e.message);
        } finally {
            db.close();
        }
    };
}

module.exports = { open, withDb };