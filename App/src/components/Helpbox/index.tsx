// @ts-ignore
import React from 'react';
import {
    View,
    Text,
    TextStyle
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Services from '../../services';
import * as Utils from '../../styles';

const defaultProps = {
    tx: null,
    text: null,
    style: {}
}

export const Helpbox = (props: any) => {
    props = {...defaultProps, ...props};

    let txt = props.children;
    if(props.tx) {
        txt = Services.LanguageService.string(props.tx);
    }

    const inheritStyle = {
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: Utils.UI.normalizeFont(12),
        flex: 1,
        color: 'white'
    }

    return (
        <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 0, backgroundColor: 'rgba(0,0,0,.8)', borderRadius: 10 }, props.boxStyle]}>
            <Icon
                name={'help-box'}
                color={Utils.Color.White}
                style={[{ fontSize: Utils.UI.normalizeFont(17), marginRight: 10, flex: 0 }, props.iconStyle]}
            />
            <Text style={[inheritStyle, props.textStyle]}>{ txt }</Text>
        </View>
    )
}

const TEXT_INPUT_STYLE: TextStyle = {
    backgroundColor: Utils.Color.Primary,
    padding: 0,
    borderColor: 'rgba(0,0,0,.25)',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    fontFamily: Utils.Font.Montserrat(400),
    fontSize: Utils.UI.normalizeFont(13),
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: Utils.Color.White,
    shadowColor: "#333",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
}