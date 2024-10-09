import * as express from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
const route = express.Router();

route.get('/:id', (req, res) => {
  const level = fs.readFileSync(
    path.resolve(`data/levels/level-${req.params.id}.json`),
    'utf-8'
  );
  res.json(JSON.parse(level));
});

module.exports = route;
export {}