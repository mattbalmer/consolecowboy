import Config from '@client/config';
import { Environment } from '@env/types';
import { playerCapsule } from '@client/capsules/player';

if (Config.ENV === Environment.LOCAL) {
    window['Config'] = Config;
    window['capsules'] = {
        playerCapsule,
    };
}