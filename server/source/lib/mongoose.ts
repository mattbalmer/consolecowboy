import mongoose from 'mongoose';
import Config from '@server/config';
import { Environment } from '@env/types';

if (Config.ENV === Environment.LOCAL || Config.ENV === Environment.STAGING) {
  mongoose.set('debug', true);
}

const mongoURI = (db: string): string => `mongodb://localhost/${db}`;

const getConnectionArgs = () => {
  const connectArgs: any = {
    family: 4
  };

  if (Config.MONGO_USER && Config.MONGO_PW) {
    connectArgs.user = encodeURIComponent(Config.MONGO_USER);
    connectArgs.pass = encodeURIComponent(Config.MONGO_PW);
  }

  return connectArgs;
}

export const connectMongoose = async () => {
  const uri = mongoURI(Config.MONGO_DB);
  const connectArgs = getConnectionArgs();

  console.log('Attempting to connect to mongo', uri, connectArgs);

  try {
    await mongoose.connect(uri, connectArgs)
    console.log('Mongoose connected');
  } catch(err) {
    console.log('Mongoose failed to connect', err);
  }
}

export default mongoose;