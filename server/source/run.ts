import Config from 'config';
import { connectMongoose } from '@server/lib/mongoose';
import initschemas from '@server/initschemas';
import { getOrCreateServer } from '@server/index';

connectMongoose().then(async () => {
  await initschemas();
  const server = getOrCreateServer();
  server.listen(Config.PORT, () => {
    console.log(`Server listening on port ${Config.PORT}`);
  });
});
