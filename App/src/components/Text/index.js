import React from 'react';
import {
    Text
} from 'react-native';
import * as Services from '../../services';
import * as Utils from '../../styles';
import { Font } from '../../styles';

/* interface TextProps {
    tx?: string;
    style?: any;
    children?: any;
} */

const defaultProps = {
    tx: null,
    text: null,
    style: {},
    bold: false,
    light: false,
    black: false
}

export function Txt(props) {
    props = {...defaultProps, ...props};

    let txt = props.children;
    if(props.tx) {
        txt = Services.LanguageService.string(props.tx);
    }

    let inheritStyle = {
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: Utils.UI.normalizeFont(14)
    };

    if(props.light) inheritStyle.fontFamily = Utils.Font.Montserrat(200)
    else if(props.bold) inheritStyle.fontFamily = Utils.Font.Montserrat(600)
    else if(props.black) inheritStyle.fontFamily = Utils.Font.Montserrat(800)

    return (
        <Text style={[inheritStyle, props.style]}>
            { txt }
        </Text>
    )
}