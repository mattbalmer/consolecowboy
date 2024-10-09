import * as express from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
const route = express.Router();

const LEVELS_DIR = path.resolve('data/levels');
const resolveLevelFile = (level: string | number): string => path.join(LEVELS_DIR, `level-${level}.json`);

route.get('/', (req, res) => {
  // list all files in levels dir
  const levels = fs.readdirSync(LEVELS_DIR).map((file) => {
    return parseInt(
      file.split('.')[0].split('-')[1],
      10
    );
  });
  res.json(levels.sort((a, b) => a - b));
});

route.get('/:id', (req, res) => {
  const level = fs.readFileSync(
    resolveLevelFile(req.params.id),
    'utf-8'
  );
  res.json(JSON.parse(level));
});

route.put('/:id', (req, res) => {
  const id = req.params.id;
  const level = req.body;
  const filepath = resolveLevelFile(id);

  try {
    fs.writeFileSync(
      filepath,
      JSON.stringify(level, null, 2),
      'utf-8'
    );

    res.send(201);
  } catch (error) {
    res.send(500).json(error);
  }
});

module.exports = route;
export {}