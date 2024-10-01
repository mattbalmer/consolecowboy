import { ClientConfig, Environment } from '@env/types';
// @ts-ignore
import EnvConfig from '@env/@{ENV}-client';

export {
  Environment as Envs
};
const Config: ClientConfig = EnvConfig;
export default Config;