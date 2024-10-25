import Config from '@client/config';
import { Environment } from '@env/types';
import { playerCapsule } from '@client/capsules/player';
import { transitionsCapsule } from '@client/capsules/transitions';

if (Config.ENV === Environment.LOCAL) {
    window['Config'] = Config;
    window['capsules'] = {
        playerCapsule,
        transitionsCapsule,
    };
}

window['DEBUG_COMMANDS_ENABLED'] = true;