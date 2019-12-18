const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const uuid = require('uuid/v4');
const { Users, user, auth } = require('./users');
const { withDb } = require('./db');

const users = new Users();
const withUser = user(users);
const withAuth = auth();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'client')));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});

app.get('/api/users', withUser, withAuth, (req, res) => {
    res.json(users.all);
});

app.post('/api/users', withUser, (req, res) => {
    const name = req.body.name;

    if (!name || users.exists(name)) {
        res.sendStatus(400).end();
    } else {
        if (req.user) {
            users.remove(req.user);
        }

        const sid = users.add(name);
        res.cookie('sid', sid, { httpOnly: true }).end();
    }
});

app.delete('/api/users', withUser, (req, res) => {
    if (req.user) {
        users.remove(req.user);
        res.clearCookie('sid', { httpOnly: true });
    }

    res.end();
});

app.get('/api/records', withUser, withAuth, withDb(async (req, res) => {
    const records = await req.db.all(`
        SELECT game, user, finish - start AS time, score
        FROM records
        WHERE finish > 0
        ORDER BY score DESC, finish DESC
    `);
    res.json(records);
}));

app.post('/api/records', withUser, withAuth, withDb(async (req, res) => {
    const id = uuid();
    await req.db.run(`
        INSERT INTO records
        (id, game, user, start)
        VALUES ($id, $game, $user, $start)
    `, {
        $id: id,
        $game: req.body.game,
        $user: req.user.name,
        $start: Date.now()
    });
    res.json({ id });
}));

app.patch('/api/records/:id', withUser, withAuth, withDb(async (req, res) => {
    await req.db.run(`
        UPDATE records
        SET finish = $finish,
            score = $score
        WHERE id = $id
    `, {
        $id: req.params.id,
        $finish: Date.now(),
        $score: req.body.score
    });
    res.end();
}));

app.get('/api/messages', withUser, withAuth, withDb(async (req, res) => {
    let chat = await req.db.all(`
        SELECT * 
        FROM (
            SELECT *
            FROM messages
            ORDER BY time DESC
            LIMIT 5
        )
        ORDER BY time ASC
    `);
    chat = chat.map(msg => ({ ...msg, isMine: msg.user === req.user.name }));
    res.json(chat);
}));

app.post('/api/messages', withUser, withAuth, withDb(async (req, res) => {
    const text = (req.body.text || '').slice(0, 500);

    if (!text) {
        return;
    }

    try {
        const game = await req.db.get(`
            SELECT game
            FROM records
            WHERE user=$user AND finish IS NULL
            ORDER BY start DESC
            LIMIT 1
        `, {
            $user: req.user.name
        });

        await req.db.run(`
            INSERT INTO messages
            (user, game, text, time)
            VALUES ($user, $game, $text, $time)
        `, {
            $user: req.user.name,
            $game: game && game.game || '',
            $text: text,
            $time: Date.now()
        });

        res.end();
    } catch (e) {
        console.error(e.message);
        res.sendStatus(503);
    }
}));
