import * as express from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
const route = express.Router();

route.get('/', (req, res) => {
  // list all files in levels dir
  const levels = fs.readdirSync(path.resolve('data/levels')).map((file) => {
    return parseInt(
      file.split('.')[0].split('-')[1],
      10
    );
  });
  res.json(levels.sort((a, b) => a - b));
});

route.get('/:id', (req, res) => {
  const level = fs.readFileSync(
    path.resolve(`data/levels/level-${req.params.id}.json`),
    'utf-8'
  );
  res.json(JSON.parse(level));
});

module.exports = route;
export {}