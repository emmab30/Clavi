// @ts-ignore
import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    Image,
    RefreshControl,
    Alert,
    Dimensions,
    ActivityIndicator
} from 'react-native';

import firebase from 'react-native-firebase';
import _ from 'lodash';
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
import { TouchableOpacity } from 'react-native-gesture-handler';
import RowTransactionSharedAccount from 'app/src/components/Transactions/RowTransactionSharedAccount';
import { FloatingAction } from 'react-native-floating-action';

const Banner = firebase.admob.Banner;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();

const defaultProps = {
    tx: null,
    text: null,
    style: {},
    leftNode: null
}

const { width, height } = Dimensions.get('window');

const DetailsSharedAccount = (props: any) => {
    props = {...defaultProps, ...props};
    const {
        screenProps,
        navigation
    } = props;
    
    const [loading, setLoading] = React.useState(false);
    const [sharedAccount, setSharedAccount] = React.useState(null);
    const [loadingTransactions, isLoadingTransactions] = React.useState(true);
    const [transactions, setTransactions] = React.useState(null);
    const [filteredTransactions, setFilteredTransactions] = React.useState(null);
    const [selectedMember, setSelectedMember] = React.useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        screenProps.setLoading(true);
        setLoading(true);
        Services.SharedAccountService.getSharedAccounById(navigation.getParam('id'), (data) => {
            if(data.success) {
                setSharedAccount(data.shared_account);

                isLoadingTransactions(true);
                setTransactions([]);
                setFilteredTransactions([]);

                Services.SharedAccountService.getSharedAccountTransactionsById(navigation.getParam('id'), (data) => {
                    if(data.success) {
                        setTransactions(data.transactions);
                        setFilteredTransactions(_.take(data.transactions, 5));
                        isLoadingTransactions(false);
                    }
                }, (err) => {});

                setLoading(false);
                screenProps.setLoading(false);
            }
        }, (err) => {
            screenProps.setLoading(false);
        });
    }

    const removeSharedAccount = () => {
        Alert.alert('Seguro?', 'Estás seguro que deseas salir de esta cuenta compartida?', [
            {
                text : 'Salir de la cuenta',
                onPress: () => {
                    screenProps.setLoading(true);
                    Services.SharedAccountService.kickMember(sharedAccount.id, 'me', (data) => {
                        if(data.success) {
                            showMessage({
                                message: 'Éxito',
                                description: 'Haz salido de la cuenta compartida con éxito',
                                type: "success"
                            });
                            navigation.pop();
                        } else {
                            showMessage({ message: 'Oh oh!', description: data.message, type: "danger" });
                        }

                        screenProps.setLoading(false);
                    }, (err) => {
                        screenProps.setLoading(false);
                    })
                }
            },
            {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => {
                    // Do nothing
                }
            }
        ], {
            cancelable: true
        });
    }

    const onDeleteMember = (memberId) => {
        Alert.alert('Seguro?', 'Estás seguro que deseas eliminar este miembro de la cuenta compartida? No se eliminarán sus ingresos ni sus gastos.', [
            {
                text : 'Eliminar',
                onPress: () => {
                    screenProps.setLoading(true);
                    Services.SharedAccountService.kickMember(
                        sharedAccount.id,
                        memberId, data => {
                            setMember(null);
                            loadData()

                            showMessage({
                                message: 'Éxito',
                                description: 'El miembro fue quitado de la cuenta compartida',
                                type: "success",
                            });
                        },
                        err => {
                            screenProps.setLoading(true);
                            showMessage({
                                message: 'Oh oh!',
                                description: 'No se ha podido remover al miembro de la cuenta compartida',
                                type: "danger",
                            });
                        }
                    );
                }
            },
            {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => {
                    // Do nothing
                }
            }
        ],
        { cancelable : true });
    }

    const setMember = (member) => {
        setSelectedMember(member);
        if(!member) {
            setFilteredTransactions(transactions);
        } else {
            setFilteredTransactions(_.filter(transactions, t => t.user_account.user_id == member.id));
        }
    }

    return (
        <Container style={[styles.container]}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={loadData}
                    />
                }
                contentContainerStyle={{
                    paddingBottom: 35,
                    minHeight: '100%'
                }}
                style={styles.form}>

                <HeaderBar
                    containerStyle={{ paddingTop: 0, backgroundColor: 'transparent' }}
                    isBackButton={true}
                    shadow={false}
                    title={sharedAccount != null ? sharedAccount.name : 'Cuenta compartida'}
                    navigation={props.navigation}
                    rightStyle={{ alignItems: 'flex-end', paddingRight: 5 }}
                    rightContent={() => {
                        return (
                            <TouchableOpacity
                                activeOpacity={.6}
                                style={{ paddingLeft: 20 }}
                                onPress={() => removeSharedAccount()}>
                                <Icon
                                    name={'delete'}
                                    style={{ fontSize: Utils.UI.normalizeFont(18), alignSelf: 'flex-end', color: Utils.Color.PrimaryRed }}
                                />
                            </TouchableOpacity>
                        )
                    }}
                />

                <View
                    style={{ width: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', paddingVertical: 5, marginBottom: 10 }}>
                    <Banner
                        style={{ top: 0, left: 0 }}
                        size={"MINI_BANNER"}
                        unitId={Services.AdsService.getBannerIdentifier('new_transaction')}
                        request={request.build()}
                        onAdLoaded={() => {
                            // Do nothing
                        }}
                    />
                </View>

                { sharedAccount != null &&
                    <View style={{ paddingHorizontal: 15 }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(20), color: Utils.Color.Primary }}>{ sharedAccount.name }</Text>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(300), marginTop: 5, marginBottom: 20 }}>Cuenta compartida</Text>

                        <View style={{ flexDirection: 'column', maxWidth: '100%' }}>
                            <View style={{ width: '100%', flexDirection: 'column', marginVertical: 5, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ width: '100%', alignSelf: 'center', backgroundColor: Utils.Color.setAlpha(Utils.Color.SuccessGreen, .15), height: 15, borderRadius: 3 }}>
                                    <View style={{ width: `${sharedAccount.balance.percentageIncomes}%`, backgroundColor: Utils.Color.setAlpha(Utils.Color.SuccessGreen, 1), height: 15, borderRadius: 3, position: 'absolute', left: 0, top: 0 }}></View>
                                    <View style={{ width: `${sharedAccount.balance.percentageOutcomes}%`, backgroundColor: Utils.Color.setAlpha(Utils.Color.PrimaryRed, .9), height: 15, borderRadius: 3, position: 'absolute', left: 0, top: 0 }}></View>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, alignItems: 'center' }}>
                                <View style={{ backgroundColor: Utils.Color.PrimaryRed, width: 20, height: 6, marginRight: 10, borderRadius: 3 }}></View>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(12), color: Utils.Color.PrimaryRed }}>Gastos: { Services.CurrencyService.formatAmount(sharedAccount.balance.outcomes) }</Text>
                            </View>

                            <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, alignItems: 'center' }}>
                                <View style={{ backgroundColor: Utils.Color.SuccessGreen, width: 20, height: 6, marginRight: 10, borderRadius: 3 }}></View>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(12), color: Utils.Color.SuccessGreen }}>Ingresos: { Services.CurrencyService.formatAmount(sharedAccount.balance.incomes) }</Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                                { sharedAccount.balance.final_balance > 0 ?
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(23), fontWeight: '800', color: Utils.Color.SuccessGreen }}>+ { Services.CurrencyService.formatAmount(sharedAccount.balance.final_balance) }</Text>
                                :
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(23), fontWeight: '800', color: Utils.Color.ErrorRed }}>- { Services.CurrencyService.formatAmount(sharedAccount.balance.final_balance) }</Text>
                                }
                            </View>

                            {/* <View style={{ width: '100%', flex: 1, flexDirection: 'column', marginVertical: 5, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ width: '100%', alignSelf: 'center', backgroundColor: Utils.Color.setAlpha(Utils.Color.PrimaryRed, .15), height: 15, borderRadius: 8 }}>
                                    <View style={{ width: `${sharedAccount.balance.percentageOutcomes}%`, backgroundColor: Utils.Color.PrimaryRed, height: 15, borderRadius: 8 }}></View>
                                </View>

                                <Text style={{ flex: 0, fontFamily: Utils.Font.Montserrat(700), color: Utils.Color.DarkGray, fontSize: Utils.UI.normalizeFont(11), alignSelf: 'center', marginVertical: 10 }}>Gastos totales: { Services.CurrencyService.formatAmount(sharedAccount.balance.outcomes) }</Text>
                            </View> */}
                        </View>

                        <View style={{ width: '100%', height: 2, backgroundColor: 'rgba(0,0,0,.025)', marginTop: 10, marginBottom: 5 }}></View>

                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(20), color: Utils.Color.DarkGray, marginVertical: 10 }}>Miembros</Text>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(300), fontSize: Utils.UI.normalizeFont(12), marginBottom: 10 }}>Toca sobre un miembro para ver los detalles</Text>

                        <FlatList
                            data={sharedAccount.members}
                            horizontal
                            renderItem={({ item }) => {
                                let URLAvatar = `https://ui-avatars.com/api/?name=${item.name.replace(' ', '+')}&background=efefef`;

                                // Change avatar to be active
                                if(selectedMember && selectedMember.id == item.id)
                                    URLAvatar = `https://ui-avatars.com/api/?name=${item.name.replace(' ', '+')}&background=7876c7&color=ffffff`;

                                return (
                                    <TouchableOpacity
                                        activeOpacity={.6}
                                        onPress={() => {
                                            Services.UIService.Animate();

                                            if(selectedMember && selectedMember.id == item.id) {
                                                setMember(null);
                                            } else {
                                                setMember(item);
                                            }
                                        }}
                                        style={{ marginTop: 5, marginRight: 10 }}>
                                        <Image
                                            source={{ uri: URLAvatar }}
                                            style={{ borderRadius: 18, width: 36, height: 36 }}
                                        />
                                    </TouchableOpacity>
                                )
                            }}
                        />

                        { selectedMember && 
                            <View style={{ flexDirection : 'row', alignItems: 'center' }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(300), color: '#222', paddingVertical: 10 }}>{ selectedMember.name } - </Text>
                                <TouchableOpacity
                                    activeOpacity={.8}
                                    style={{ paddingVertical: 10 }}
                                    onPress={() => onDeleteMember(selectedMember.id)}>
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.PrimaryRed }}>Eliminar miembro</Text>
                                </TouchableOpacity>
                            </View>
                        }

                        <Button
                            text={'Agregar miembros'}
                            buttonStyle={{ backgroundColor: Utils.Color.Primary, borderWidth: 0, marginTop: 20 }}
                            textStyle={{ color: 'white' }}
                            onPress={() => {
                                navigation.navigate('SearchUserModal', {
                                    onPickUser: (user) => {
                                        if(user && user.username && user.id) {
                                            Services.SharedAccountService.addMember(sharedAccount.id, {
                                                user_id: user.id
                                            }, (data) => {
                                                if(data.success) {
                                                    showMessage({
                                                        message: 'Éxito',
                                                        description: 'El miembro fue agregado a tu cuenta compartida y ya tiene acceso',
                                                        type: "success",
                                                    });
                                                    loadData();
                                                } else {
                                                    showMessage({
                                                        message: 'Oh oh!',
                                                        description: data.message,
                                                        type: "danger",
                                                    });
                                                }
                                            });
                                            /* transaction.owe_to_alias = user.username;
                                            transaction.owe_to_id = user.id;
                                            this.setState({
                                                transaction,
                                                showNameInput: true
                                            }); */
                                        }
                                        navigation.pop();
                                    }
                                });
                            }}
                        />

                        { selectedMember != null &&
                            <View style={{ width: '100%', flexDirection: 'row', marginVertical: 30, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ flex: 0, marginRight: 20 }}>
                                    <Image
                                        source={{ uri : `https://ui-avatars.com/api/?name=${selectedMember.name.replace(' ', '+')}&background=7876c7&color=ffffff&size=128` }}
                                        style={{ height: 80, width: 80, borderRadius: 40 }}
                                    />
                                </View>
                                <View style={{ flex : 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.DarkGray, fontSize: Utils.UI.normalizeFont(13), marginBottom: 5 }}>{ selectedMember.name }</Text>
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.Secondary, fontSize: Utils.UI.normalizeFont(13), marginVertical: 5 }}>
                                        Ingresos:
                                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), marginLeft: 10 }}>
                                            {
                                                ` $${_.sumBy(transactions, i => {
                                                    if(i.transaction_type_id == 1 && i.user_account && i.user_account.user_id == selectedMember.id) {
                                                        return i.amount;
                                                    }

                                                    return null;
                                                }) || "0"}`
                                            }
                                        </Text>
                                    </Text>
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.PrimaryRed, fontSize: Utils.UI.normalizeFont(13), marginTop: 5 }}>
                                        Gastos: 
                                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), marginLeft: 10 }}>
                                            {
                                                ` $${_.sumBy(transactions, i => {
                                                    if(i.transaction_type_id == 2 && i.user_account && i.user_account.user_id == selectedMember.id) {
                                                        return i.amount;
                                                    }

                                                    return null;
                                                }) || "0"}`
                                            }
                                        </Text>
                                    </Text>
                                </View>
                            </View>
                        }

                        <View style={{ marginVertical: 10 }}>
                            <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(20), color: Utils.Color.DarkGray, marginVertical: 10 }}>Ingresos / Gastos</Text>

                            { selectedMember != null &&
                                <Text style={{ fontFamily: Utils.Font.Montserrat(300), fontSize: Utils.UI.normalizeFont(12), color: Utils.Color.DarkGray, marginBottom: 10, maxWidth: '90%' }}>Estás viendo ingresos & gastos de <Text style={{ fontWeight: '800', color: Utils.Color.Primary }}>{selectedMember.name}</Text></Text>
                            }
                        </View>

                        { (!filteredTransactions || filteredTransactions.length == 0) &&
                            <Text style={{ fontFamily: Utils.Font.Montserrat(200), color: Utils.Color.MiddleGray }}>Aún no hay transacciones compartidas</Text>
                        }

                        <View style={{ overflow: 'hidden', borderRadius: 5 }}>
                            { loadingTransactions &&
                                <View style={{ padding: 20, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator
                                        color={Utils.Color.DarkGray}
                                    />
                                </View>
                            }

                            { filteredTransactions && filteredTransactions.length > 0 && filteredTransactions.map((e) => {
                                return (
                                    <RowTransactionSharedAccount
                                        transaction={e}
                                        onPress={() => {
                                            navigation.push('TransactionDetailsModal', {
                                                transaction: e,
                                                onReload: loadData,
                                                onDelete: (transaction) => {
                                                    screenProps.showInteractableAlertWithButtons(Services.LanguageService.string('delete'), Services.LanguageService.string('ask_delete_transaction'), [
                                                        {
                                                            id: 1,
                                                            text: 'Confirmar',
                                                            onPress: () => {
                                                                screenProps.hideInteractableAlert()
                                
                                                                screenProps.setLoading(true);
                                                                Services.TransactionService.removeById(transaction.id, (data) => {
                                                                    if(data.success) {
                                                                        loadData()
                                                                    }
                                
                                                                    screenProps.setLoading(false);
                                                                    navigation.pop();
                                
                                                                    Services.AnalyticsService.postEvent({
                                                                        type: 'deleted_transaction',
                                                                        view: 'TransactionDetailsModal'
                                                                    });
                                
                                                                    showMessage({
                                                                        message: Services.LanguageService.string('success'),
                                                                        description: Services.LanguageService.string('success_message'),
                                                                        type: "success",
                                                                    });
                                                                }, (err) => {
                                                                    loadData()
                                
                                                                    screenProps.setLoading(false);
                                                                    navigation.pop();
                                                                });
                                                            }
                                                        }
                                                    ], {
                                                        vibrate : true,
                                                        shadowBackgroundImage: require('app/src/assets/images/illustrations/delete.png'),
                                                        shadowBackgroundColor: 'white'
                                                    });
                                                }
                                            });
                                        }}
                                    />
                                );
                            })}
                        </View>

                        { filteredTransactions && filteredTransactions.length < transactions.length &&
                            <Button
                                text={'Ver más'}
                                buttonStyle={{ marginTop: 5, backgroundColor: Utils.Color.Primary, borderWidth: 0 }}
                                textStyle={{ color: 'white' }}
                                onPress={() => {
                                    Services.UIService.Animate();
                                    setFilteredTransactions(transactions);
                                }}
                            />
                        }
                    </View>
                }
            </ScrollView>

            <FloatingAction
                overlayColor={'rgba(22,22,22,.9)'}
                color={Utils.Color.Primary}
                actions={[
                    {
                        render: () => {
                            return (
                                <View style={{ padding: 8, backgroundColor: 'white', borderRadius: 5 }}>
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.DarkGray, textAlign: 'center', fontSize: Utils.UI.normalizeFont(11) }}>Agregar Ingreso / Gasto</Text>
                                </View>
                            );
                        },
                        name: "btn_income"
                    }
                ]}
                onPressItem={name => {
                    navigation.push('NewIncomeOutcome', {
                        shared_account_id: sharedAccount.id,
                        onCreated: loadData
                    });
                }}
            />
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
        padding: 0
    }
});

export default DetailsSharedAccount;