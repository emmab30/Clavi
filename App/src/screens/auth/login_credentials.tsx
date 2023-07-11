// @ts-ignore
import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Image
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Container from 'app/src/components/Container';
import HeaderBar from 'app/src/components/HeaderBar'
import * as Services from '../../services';
import * as Utils from '../../styles'
import {
    Input
} from 'app/src/components';
import Button from 'app/src/components/Button';
import { showMessage } from 'react-native-flash-message';
import { FloatingAction } from 'react-native-floating-action';
import { TouchableOpacity } from 'react-native-gesture-handler';

const defaultProps = {
    tx: null,
    text: null,
    style: {},
    leftNode: null
}

const { width, height } = Dimensions.get('window');

const LoginCredentialsScreen = (props: any) => {
    props = {...defaultProps, ...props};
    const {
        screenProps,
        navigation
    } = props;

    const [email, setEmail] = React.useState(__DEV__ ? 'cloy@cloy.com' : '');
    const [password, setPassword] = React.useState(__DEV__ ? 'iloveyou30' : '');
    const [showPassword, setShowPassword] = React.useState(false);

    useEffect(() => {
        if(navigation.getParam('email') != null) {
            setEmail(navigation.getParam('email'));
        }
    }, []);

    const onLogin = () => {
        navigation.getParam('onAttempt')({
            email,
            password
        });
    }

    return (
        <Container style={[styles.container]}>
            <ScrollView
                keyboardShouldPersistTaps={'always'}
                contentContainerStyle={{
                    paddingBottom: 35,
                    minHeight: '100%'
                }}
                style={styles.form}>

                <HeaderBar
                    containerStyle={{ paddingTop: 0, backgroundColor: 'transparent' }}
                    isBackButton={true}
                    shadow={false}
                    title={'Ingresa con tu cuenta'}
                    navigation={props.navigation}
                />

                <View style={{ flex : 1, alignItems: 'center' }}>

                    <Image
                        source={require('app/src/assets/images/illustrations/2021.png')}
                        style={styles.logo}
                    />

                    <Input
                        autoFocus
                        autoCapitalize={'none'}
                        placeholder={'Tu email'}
                        value={email}
                        onChangeText={(text) => {
                            Services.UIService.Animate();
                            setEmail(text);
                        }}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                        <View style={{ width: '85%' }}>
                            <Input
                                autoCapitalize={'none'}
                                placeholder={'Tu contraseña'}
                                value={password}
                                secureTextEntry={!showPassword}
                                onChangeText={(text) => {
                                    Services.UIService.Animate();
                                    setPassword(text);
                                }}
                            />
                        </View>

                        <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', maxHeight: 60 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowPassword(!showPassword);
                                }}
                                style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <Icon
                                    name={'eye'}
                                    size={Utils.UI.normalizeFont(20)}
                                    color={showPassword ? Utils.Color.PrimaryLight : Utils.Color.Primary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Button
                        text={'Ingresar'}
                        buttonStyle={{
                            width: '100%',
                            alignSelf: 'center',
                            marginTop: 20,
                            backgroundColor: email != null && password != null && email.length > 0 && password.length > 0 ? Utils.Color.Primary : Utils.Color.setAlpha(Utils.Color.Primary, .5),
                            elevation: 0,
                            borderWidth: 0
                        }}
                        textStyle={{ color: Utils.Color.Primary, fontFamily: Utils.Font.Montserrat(600), color: 'white' }}
                        onPress={onLogin}
                    />
                </View>
            </ScrollView>
        </Container>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Utils.Color.White
    },
    logo: {
        width: width,
        height: 150,
        resizeMode: 'contain',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20
    },
    form: {
        flexDirection: 'column',
        padding: 10
    }
});

export default LoginCredentialsScreen;