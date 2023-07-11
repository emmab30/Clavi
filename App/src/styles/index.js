import React from 'react';
import {
    Platform,
    Dimensions,
    PixelRatio
} from 'react-native';
import _ from 'lodash';
var tinycolor = require("tinycolor2");

const {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export const UI = {
    BackButtonStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        height: '100%',
        marginLeft: 0
    },
    NextButtonStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '100%',
        height: '100%',
        marginRight: 10
    },
    CloseButton: {

    },
    CloseButtonImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: '#565656'
    },
    normalizeFont : (size) => {
        const newSize = size * scale
        if (Platform.OS === 'ios') {
            return Math.round(PixelRatio.roundToNearestPixel(newSize))
        } else {
            return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
        }
    }
}

export const Font = {
    CharlotteFont: (Platform.OS === 'ios' ? 'charlotte' : 'charlotte'),
    MontserratBlack: (Platform.OS === 'ios' ? 'Montserrat-Black' : 'Montserrat-Black'),
    MontserratExtraBold: (Platform.OS === 'ios' ? 'Montserrat-ExtraBold' : 'Montserrat-ExtraBold'),
    MontserratBold: (Platform.OS === 'ios' ? 'Montserrat-Bold' : 'Montserrat-Bold'),
    MontserratSemiBold: (Platform.OS === 'ios' ? 'Montserrat-SemiBold' : 'Montserrat-SemiBold'),
    MontserratMedium: (Platform.OS === 'ios' ? 'Montserrat-Medium' : 'Montserrat-Medium'),
    MontserratRegular: (Platform.OS === 'ios' ? 'Montserrat-Regular' : 'Montserrat-Regular'),
    MontserratLight: (Platform.OS === 'ios' ? 'Montserrat-Light' : 'Montserrat-Light'),
    MontserratExtraLight: (Platform.OS === 'ios' ? 'Montserrat-ExtraLight' : 'Montserrat-ExtraLight'),
    MontserratThin: (Platform.OS === 'ios' ? 'Montserrat-Thin' : 'Montserrat-Thin'),
    Charlotte: () => {
        return Font.CharlotteFont;
    },
    Montserrat: (weight) => {
        if(weight == 100) return Font.MontserratThin;
        if(weight == 200) return Font.MontserratExtraLight;
        if(weight == 300) return Font.MontserratLight;
        //if(weight == 400) return Font.MontserratRegular;
        if(weight == 500) return Font.MontserratMedium;
        if(weight == 600) return Font.MontserratSemiBold;
        if(weight == 700) return Font.MontserratBold;
        if(weight == 800) return Font.MontserratExtraBold;
        if(weight == 900) return Font.MontserratBlack;

        return Font.MontserratRegular; // Weight = 400 or by default
    }
}

export const Styles = {
    Shadowed: {
        shadowColor: '#444',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 1,
    },
    LightShadowed: {
        shadowColor: '#aaa',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        elevation: 1,
    }
}

export const Color = {

    // Palette colors
    Primary: '#7876C7',
    PrimaryDark: '#6B63FD',
    PrimaryLight: '#d2d0f1',
    Secondary: '#8fc1c0',
    SecondaryDark: '#396463',
    SecondaryLight: '#afd3d2',
    LightGray: '#E4DFDA',
    MiddleGray: '#555555',
    LightBrown: '#D4B483',
    PrimaryRed: '#FF764B',
    DarkGray: '#595959',

    SuccessGreen: '#8fc1c0',
    ErrorRed: '#FF764B',
    Blue: '#006cff',
    LightGray: '#f3f3f3',
    White: '#ffffff',
    DarkPink: '#f10764',
    toOpacity: (hex, opacity) => {
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + opacity + ')';
        }

        return null;
    },
    setAlpha: (hex, alpha = 1) => {
        var color = tinycolor(hex);
        const retVal = color.setAlpha(alpha).toRgbString();
        return retVal;
    },
    darken: (hex, darkenValue = 20) => {
        return tinycolor(hex).darken(darkenValue);
    }
};