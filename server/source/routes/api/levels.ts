import * as express from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
const route = express.Router();

const LEVELS_DIR = path.resolve('data/levels');
const resolveLevelFile = (level: string | number): string => path.join(LEVELS_DIR, `${level}.level.json`);

route.get('/', (req, res) => {
  const zone = req.query.zone; // TODO: implement zone filtering

  // list all files in levels dir
  // todo: sort based on id number
  const levels = fs.readdirSync(LEVELS_DIR)
    .filter(file => file.endsWith('.level.json') && file !== '.level.json')
    .map((file) => {
      const id = file.split('.')[0];
      const parsed = Number(id);
      return isNaN(parsed) ? id : parsed;
    })
    .sort((a, b) =>
      typeof a === 'number' && typeof b === 'number' ? a - b
        : typeof a === 'number'? -1
        : typeof b === 'number' ? 1
        : a < b ? -1
        : a > b ? 1
        : 0
    );
  res.json(levels);
});

route.get('/:id', (req, res) => {
  const filepath = resolveLevelFile(req.params.id);
  if (fs.existsSync(filepath)) {
    const level = fs.readFileSync(
      filepath,
      'utf-8'
    );
    res.json(JSON.parse(level));
  } else {
    const level = fs.readFileSync(
      resolveLevelFile(''),
      'utf-8'
    );
    res.status(404).json(JSON.parse(level));
  }
});

route.put('/:id', (req, res) => {
  const id = req.params.id;
  const level = req.body;
  const filepath = resolveLevelFile(id);

  if (!fs.existsSync(LEVELS_DIR)) {
    fs.mkdirSync(LEVELS_DIR);
  }

  if (id === 'empty') {
    res.send(400).json({
      error: 'Cannot overwrite empty level template'
    });
  }

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