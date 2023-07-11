// @ts-ignore
import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    ViewStyle
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

export const CategoryIcon = (props: any) => {
    props = {...defaultProps, ...props};

    return (
        <View style={styles.IconContainer}>
            <Image
                source={{ uri : 'https://image.flaticon.com/icons/png/128/3587/3587929.png' }}
                style={styles.Icon}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    IconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)'
    },
    Icon: {
        resizeMode: 'contain',
        width: 20,
        height: 20,
        tintColor: Utils.Color.Primary
    }
});