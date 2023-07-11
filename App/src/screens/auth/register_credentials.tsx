// @ts-ignore
import React from 'react';
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

const RegisterCredentialsScreen = (props: any) => {
    props = {...defaultProps, ...props};
    const {
        screenProps,
        navigation
    } = props;

    const [fullName, setFullName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [password_confirmation, setPasswordConfirmation] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    const onRegister = () => {

        // Some validations
        if(password != password_confirmation) {
            showMessage({ message: 'Oh oh', description: 'Las contraseñas no coinciden', type: 'danger' });
            return;
        } else if(!isValidFormData()) {
            return;
        }

        screenProps.setLoading(true);

        Services.AuthService.register({
            full_name: fullName,
            email,
            password
        }, (data) => {
            if(data.success) {
                if(navigation.getParam('onRegistered')) {
                    navigation.pop();
                    setTimeout(() => {
                        navigation.getParam('onRegistered')(data.user);
                    }, 250);
                }
            } else {
                showMessage({
                    message: "Oh oh",
                    description: data.message,
                    type: "danger",
                });
            }
            screenProps.setLoading(false);
        }, (err) => {
            screenProps.setLoading(false);
        });
    }

    const isValidFormData = () => {
        return email != null &&
            password != null &&
            email.length > 0 &&
            password.length >= 6 &&
            password_confirmation.length >= 6;
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
                    title={'Registra tu cuenta'}
                    navigation={props.navigation}
                />

                <View style={{ flex : 1, alignItems: 'center' }}>

                    <Image
                        source={require('app/src/assets/images/illustrations/2021.png')}
                        style={styles.logo}
                    />

                    <Input
                        autoCapitalize={'words'}
                        placeholder={'Tu nombre completo'}
                        value={fullName}
                        onChangeText={(text) => {
                            Services.UIService.Animate();
                            setFullName(text);
                        }}
                    />

                    <Input
                        autoCapitalize={'none'}
                        placeholder={'Tu email'}
                        value={email}
                        onChangeText={(text) => {
                            Services.UIService.Animate();
                            setEmail(text);
                        }}
                        style={{ marginTop: 10 }}
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

                    { password != null && password.length >= 6 &&
                        <Input
                            autoCapitalize={'none'}
                            placeholder={'Confirma tu contraseña'}
                            value={password_confirmation}
                            secureTextEntry={!showPassword}
                            onChangeText={(text) => {
                                Services.UIService.Animate();
                                setPasswordConfirmation(text);
                            }}
                            style={{ marginTop: 10 }}
                        />
                    }

                    <Button
                        text={'Registrarme'}
                        buttonStyle={{
                            width: '100%',
                            alignSelf: 'center',
                            marginTop: 20,
                            backgroundColor: isValidFormData() ? Utils.Color.Primary : Utils.Color.setAlpha(Utils.Color.Primary, .5),
                            elevation: 0,
                            borderWidth: 0
                        }}
                        textStyle={{ color: Utils.Color.Primary, fontFamily: Utils.Font.Montserrat(600), color: 'white' }}
                        onPress={onRegister}
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

export default RegisterCredentialsScreen;