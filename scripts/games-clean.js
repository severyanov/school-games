const fs = require('fs').promises;
const path = require('path');
const { games } = require(path.join(process.cwd(), 'package.json'));
const gamesPath = path.join(process.cwd(), games.dir);

(async () => {
    console.log(`Clean folder ${gamesPath}`);
    const contents = await fs.readdir(gamesPath);
    return await Promise.all(contents.map(async (item) => {
        const itemPath = path.join(gamesPath, item);
        const stat = await fs.stat(itemPath);
        return await (stat.isDirectory()
            ? fs.rmdir(itemPath, { recursive: true })
            : fs.unlink(itemPath));
    }));
})();
