import { ApiService } from 'app/src/services/BaseService.js';
import {
    AsyncStorage,
    Platform,
    Vibration
} from 'react-native';
var Sound = require('react-native-sound');

if(Platform.OS === 'ios') {
    Sound.setCategory('Ambient', true);
} else {
    Sound.setCategory('Ambient');
}

var SoundService = {
    playSound: function(soundName, vibrate = false, volume = 1) {
        var sound = new Sound(soundName, Sound.MAIN_BUNDLE, (err) => {
            if(!err){
                sound.setVolume(volume);
                sound.play();
            }
            if(vibrate)
                SoundService.vibrate(500);
        });
    },
    vibrate: function(time) {
        Vibration.vibrate(time);
    }
};

export default SoundService;
