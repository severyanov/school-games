const path = require('path');
const sqlite = require('sqlite');
const dbPath = path.join(process.cwd(), 'db');

const sql = {
    records: `
        drop table if exists records;
        create table records (
            id text primary key,
            game text not null,
            user text not null,
            start integer not null,
            finish integer,
            score integer default 0
        )`,
    messages: `
        drop table if exists messages;
        create table messages (
            user text not null,
            game text not null,
            text text not null,
            time integer not null
        )`
};

console.log(`Opening database ${dbPath}`);

(async () => {
    const db = await sqlite.open(dbPath, { mode: 6 });
    console.log('Database opened.');

    let tables = process.argv.slice(2).filter(t => sql[t]);
    if (!tables.length) {
        tables = Object.keys(sql);
    }

    for (const table of tables) {
        console.log(`Recreate table "${table}"...`);
        await db.exec(sql[table]);
    }

    console.log('Database reset.');
    db.close();
})();
