// @ts-ignore
import React from 'react';
import {
    View,
    Text,
    TextInput,
    TextStyle,
    ViewStyle,
    StyleSheet,
    Dimensions
} from 'react-native';
import * as Services from '../../services';
import * as Utils from '../../styles';
import NumberFormat from 'react-number-format';
import { TouchableOpacity } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const defaultProps = {
    tx: null,
    text: null,
    style: {},
    leftNode: null
}

export const KeyboardEntry = (props: any) => {
    props = {...defaultProps, ...props};

    const [amount, setAmount] = React.useState('');

    const onPress = (value) => {
        const newAmount = String(amount) + String(value);
        setAmount(newAmount);
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={{ flex: 0, flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 0, backgroundColor: Utils.Color.PrimaryDark, padding: 20 }}>
                    <NumberFormat
                        value={amount}
                        displayType={'text'}
                        thousandSeparator={true}
                        prefix={`$ `}
                        renderText={value => {
                            return (
                                <TextInput
                                    style={{ fontFamily: Utils.Font.Montserrat(900), fontSize: Utils.UI.normalizeFont(20), textAlign: 'center', padding: 10, color: 'white' }}
                                    value={value}
                                />
                            )
                        }}
                    />
                </View>
                <View style={styles.keyboardContainer}>
                    <View style={styles.left}>
                        <KeyboardField
                            text={'1'}
                            onPress={(value) => onPress(1)}
                        />
                        <KeyboardField
                            text={'2'}
                            onPress={(value) => onPress(2)}
                        />
                        <KeyboardField
                            text={'3'}
                            onPress={(value) => onPress(3)}
                        />
                        <KeyboardField
                            text={'4'}
                            onPress={(value) => onPress(4)}
                        />
                        <KeyboardField
                            text={'5'}
                            onPress={(value) => onPress(5)}
                        />
                        <KeyboardField
                            text={'6'}
                            onPress={(value) => onPress(6)}
                        />
                        <KeyboardField
                            text={'7'}
                            onPress={(value) => onPress(7)}
                        />
                        <KeyboardField
                            text={'8'}
                            onPress={(value) => onPress(8)}
                        />
                        <KeyboardField
                            text={'9'}
                            onPress={(value) => onPress(9)}
                        />
                        <KeyboardField
                            text={'<'}
                            onPress={() => {
                                setAmount(amount.substring(0, amount.length - 1));
                            }}
                        />
                        <KeyboardField
                            text={'0'}
                            onPress={(value) => onPress(0)}
                        />
                        <KeyboardField
                            text={'.'}
                            onPress={(value) => onPress('.')}
                        />
                    </View>
                    <View style={styles.right}>
                        <KeyboardField
                            text={'OK'}
                        />
                        <KeyboardField
                            text={'OK'}
                        />
                        <KeyboardField
                            text={'OK'}
                        />
                        <KeyboardField
                            text={'OK'}
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}

const KeyboardField = (props) => {
    return (
        <TouchableOpacity
            onPress={props.onPress}
            style={styles.keyboardField}>
            <Text style={styles.keyboardFieldText}>{ props.text }</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100
    },
    keyboardContainer: {
        width: '100%',
        flex: 1,
        flexDirection: 'row'
    },
    left: {
        flex: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: width * .75
    },
    right: {
        width: width * .25
    },
    keyboardField: {
        width: (width * .75) / 3,
        height: 60,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.02)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    keyboardFieldText: {
        fontFamily: Utils.Font.Montserrat(900),
        color: '#222',
        textAlign: 'center'
    }
});