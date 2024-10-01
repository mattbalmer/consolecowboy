import Config from '@client/config';
import { Environment } from '@env/types';

if (Config.ENV === Environment.LOCAL) {
    window['Config'] = Config;
    window['capsules'] = {
    };
}