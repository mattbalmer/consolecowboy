import Config from '@client/config';
import { Environment } from '@env/types';
import { playerCapsule } from '@client/capsules/player';
import { transitionsCapsule } from '@client/capsules/transitions';
import { vendorsCapsule } from '@client/capsules/vendors';

if (Config.ENV === Environment.LOCAL) {
    window['Config'] = Config;
    window['capsules'] = {
        player: playerCapsule,
        transitions: transitionsCapsule,
        vendors: vendorsCapsule,
    };
}

window['DEBUG_COMMANDS_ENABLED'] = true;