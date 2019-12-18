const path = require('path');
const exec = require('util').promisify(require('child_process').exec);
const { games } = require(path.join(process.cwd(), 'package.json'));
const gamesPath = path.join(process.cwd(), games.dir);

(async () => {
    await Promise.all(games.repos.map((repo, i) =>
        exec(`git clone ${repo} --depth 1 ${path.join(gamesPath, String(i))}`)
    ));
})();
