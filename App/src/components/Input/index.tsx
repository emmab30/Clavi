// @ts-ignore
import React from 'react';
import {
    View,
    Text,
    TextInput,
    TextStyle,
    ViewStyle,
    Platform
} from 'react-native';
import * as Services from '../../services';
import * as Utils from '../../styles';
import NumberFormat from 'react-number-format';

const defaultProps = {
    tx: null,
    text: null,
    style: {},
    leftNode: null
}

export const Input = (props: any) => {
    props = {...defaultProps, ...props};

    let txt = props.children;
    if(props.tx) {
        txt = Services.LanguageService.string(props.tx);
    }

    const inheritStyle = {
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: Utils.UI.normalizeFont(14)
    }

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            { props.leftNode && props.leftNode }

            { props.isNumberFormat == true ?
                <NumberFormat
                    value={props.value}
                    displayType={'text'}
                    thousandSeparator={'.'}
                    decimalSeparator={','}
                    prefix={`$ `}
                    renderText={value => {
                        return (
                            <TextInput
                                {...props}
                                placeholderTextColor={'rgba(255,255,255,.6)'}
                                selectionColor={'white'}
                                style={[TEXT_INPUT_STYLE, props.style]}
                                value={value}
                                onChangeText={(text) => {
                                    text = text.replace('$', '');
                                    text = text.replace(',', '.');
                                    text = text.replace(' ', '');
                                    props.onChangeText(text);
                                }}
                            />
                        )
                    }}
                />
            :
                <TextInput
                    placeholderTextColor={'rgba(255,255,255,.6)'}
                    selectionColor={'white'}
                    {...props}
                    style={[TEXT_INPUT_STYLE, props.style]}
                />
            }
        </View>
    )
}

const TEXT_INPUT_STYLE: TextStyle = {
    backgroundColor: Utils.Color.Primary,
    padding: 0,
    /* borderColor: 'rgba(0,0,0,.25)',
    borderWidth: 1, */
    borderRadius: 5,
    width: '100%',
    fontFamily: Utils.Font.Montserrat(400),
    fontSize: Utils.UI.normalizeFont(13),
    paddingVertical: Platform.select({
        android: 10,
        ios: 15
    }),
    paddingHorizontal: 15,
    color: Utils.Color.White,
    shadowColor: "#333",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6
}