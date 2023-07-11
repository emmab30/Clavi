// @ts-ignore
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView
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

const defaultProps = {
    tx: null,
    text: null,
    style: {},
    leftNode: null
}

const NewSharedAccount = (props: any) => {
    props = {...defaultProps, ...props};
    const {
        screenProps,
        navigation
    } = props;

    const [name, setName] = React.useState('');

    const onCreated = () => {
        screenProps.setLoading(true);

        Services.SharedAccountService.createSharedAccount({
            name
        }, (data) => {
            if(data.success) {
                if(navigation.getParam('onCreated')) {
                    navigation.getParam('onCreated')(data.shared_account);
                }

                navigation.pop();
            }
        }, (err) => {
            console.log(err);
            showMessage({
                message: 'Error',
                description: 'Error al intentar crear una cuenta compartida',
                type: "danger",
            });
        }, () => {
            screenProps.setLoading(false);
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
                    title={'Nueva cuenta compartida'}
                    navigation={props.navigation}
                />

                <Input
                    autoFocus
                    placeholder={'Ingresa el nombre de la cuenta'}
                    value={name}
                    onChangeText={(text) => {
                        Services.UIService.Animate();
                        setName(text);
                    }}
                />

                { name != null && name.length > 0 &&
                    <Button
                        text={'Crear cuenta compartida'}
                        buttonStyle={{ width: '100%', alignSelf: 'center', marginTop: 20, backgroundColor: Utils.Color.Primary }}
                        textStyle={{ color: Utils.Color.Primary, fontFamily: Utils.Font.Montserrat(600), color: 'white' }}
                        onPress={onCreated}
                    />
                }

                <View style={{ width: '95%', alignSelf: 'center', borderRadius: 40, height: 2, backgroundColor: Utils.Color.setAlpha('#111111', .1), marginTop: 30, marginBottom: 10 }}></View>

                <View style={{ width: '90%', flexDirection: 'column', alignSelf: 'center', justifyContent: 'center' }}>
                    <Icon
                        name={'help-rhombus'}
                        style={{ fontSize: Utils.UI.normalizeFont(25), alignSelf: 'center' }}
                        color={Utils.Color.PrimaryLight}
                    />
                    <View style={{ flex: 1, flexDirection: 'column', alignSelf: 'center' }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(13), color: Utils.Color.Primary, textAlign: 'center', marginVertical: 10 }}>Las cuentas compartidas te permitirán agregar a miembros de tu familia o amigos, y podrán cargar ingresos y gastos independientemente de los propios.</Text>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(13), color: Utils.Color.Primary, textAlign: 'center', marginVertical: 10 }}>¡Muy útil si decides irte de vacaciones y mantener trackeado todos los gastos!</Text>
                    </View>
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
    form: {
        flexDirection: 'column',
        padding: 10
    }
});

export default NewSharedAccount;