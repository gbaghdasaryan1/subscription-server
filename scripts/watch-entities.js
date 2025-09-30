/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable prettier/prettier */
const chokidar = require('chokidar');
const path = require('path');

const entitiesPath = path.join(__dirname, '../src/**/*.entity.ts');

console.log('Watching entity files for changes...');

const watcher = chokidar.watch(entitiesPath, { ignoreInitial: true });

watcher.on('all', (event, filePath) => {
    console.log(`[${event}] Detected change in: ${filePath}`);
    console.log('Now run: npm run migration:generate -- ./src/migrations/YourMigrationName');
});
