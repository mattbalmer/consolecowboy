import { UserModel, UserSchema } from '@server/schemas/User';

export default async () => {
  console.log('Init: User', UserModel);
  // await UserModel.deleteMany({});
}