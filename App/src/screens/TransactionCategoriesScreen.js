import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    Alert,
    SafeAreaView,
    ScrollView,
    AsyncStorage
} from 'react-native';

// Modules
import { showMessage, hideMessage } from "react-native-flash-message";
import Icon from 'react-native-vector-icons/AntDesign';
import { FloatingAction } from "react-native-floating-action";
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');

// Styles
import * as Utils from '../styles'

// Components
import HeaderBar from '../components/HeaderBar';
import Button from '../components/Button';

// Services
import * as Services from 'app/src/services';

export default class TransactionCategoriesScreen extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            transaction_type_id: null,
            category: {
                name: '',
                color_hex: '#222',
                transaction_type_id: this.props.navigation.state.params.transaction_type_id
            },
            isCreatingOrEditing: false
        };
    }

    componentDidMount() {
        const { getParam } = this.props.navigation;
        this.setState({
            transaction_type_id: getParam('transaction_type_id')
        });

        if(getParam('focusOnCreation') == true) {
            this.setState({ isCreatingOrEditing : true });
        }
    }

    onSubmit = () => {
        // Create the color
        const {
            category
        } = this.state;

        this.props.screenProps.setLoading(true);
        Services.TransactionService.createCategory(category, (data) => {
            this.props.screenProps.setLoading(false);
            if(data.success){
                showMessage({
                    message: Services.LanguageService.string('success'),
                    description: data.message,
                    type: "success",
                });

                // Modify state
                this.setState({
                    category: null,
                    isCreatingOrEditing: false
                }, () => {
                    this.props.screenProps.setLoading(true);
                    Services.TransactionService.syncCategories(() => {
                        this.forceUpdate();
                        this.props.screenProps.setLoading(false);

                        console.log(this.props.navigation.state.params);
                        if(this.props.navigation.state.params && this.props.navigation.state.params.onCreated) {
                            // Dismiss the modal
                            this.props.navigation.state.params.onCreated(_.last(Services.TransactionService.categories));
                            this.props.navigation.pop();
                        }
                    });
                });
            } else {
                showMessage({
                    message: "Error",
                    description: data.message,
                    type: "danger",
                });
            }
        }, (err) => {

        });
    }

    onEdit = (e) => {
        this.setState({
            category: e,
            isCreatingOrEditing: true
        });
    }

    onDelete = (e) => {
        this.props.screenProps.setLoading(true);
        Services.TransactionService.deleteCategoryById(e.id, (data) => {
            if(data.success) {
                Services.TransactionService.syncCategories(() => {
                    this.forceUpdate();
                    this.props.screenProps.setLoading(false);

                    showMessage({
                        message: Services.LanguageService.string('success'),
                        description: data.message,
                        type: "success",
                    });
                });
            } else {
                showMessage({
                    message: "Error",
                    description: data.message,
                    type: "danger",
                });
                this.props.screenProps.setLoading(false);
            }
        }, (err) => {
            showMessage({
                message: "Error",
                description: "Error al eliminar la categoría",
                type: "danger",
            });
            this.props.screenProps.setLoading(false);
        });
    }

    render() {

        const {
            isCreatingOrEditing,
            transaction_type_id,
        } = this.state;

        // Get categories
        const { getParam } = this.props.navigation;
        let categories = Services.TransactionService.categories;
        const isIncome = getParam('transaction_type_id') == 1;
        if(isIncome)
            categories = categories.filter((e) => e.transaction_type_id == 1);
        else
            categories = categories.filter((e) => e.transaction_type_id == 2);

        return (
            <SafeAreaView style={[styles.container, { backgroundColor : 'white' }]}>
                <HeaderBar
                    containerStyle={{ paddingTop: 0 }}
                    isBackButton={true}
                    navigation={this.props.navigation}
                    title={isIncome ? 'Categorias de Ingresos' : 'Categorias de Gastos'}
                />

                { isCreatingOrEditing && this.renderCreating() }

                { isCreatingOrEditing == false &&
                    <ScrollView>
                        { categories.map((e) => {
                            if(e == null)
                                return null;

                            return (
                                <View style={{ width: '100%', flexDirection: 'row', height: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,.1)' }}>
                                    <View style={{ flex: 1, paddingLeft: '5%', paddingRight: '5%', flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[{ fontFamily: Utils.Font.Montserrat(400), color: '#222', flex: 1, fontSize: Utils.UI.normalizeFont(13) }]}>{ e.name }</Text>
                                        <View style={{ flex: 0, padding: 5 }}>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 24, height: 24, borderRadius: 12, backgroundColor: e.color_hex, justifyContent: 'center', alignItems: 'center' }}></View>
                                        </View>
                                    </View>

                                    { e.user_id != null &&
                                        <View style={{ flex : 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                            <TouchableWithoutFeedback onPress={() => this.onEdit(e)}>
                                                <View style={{ flex : 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: Utils.Color.Blue }}>
                                                    <Text style={{ fontFamily: Utils.Font.Montserrat(500), color: 'white', fontSize: Utils.UI.normalizeFont(13) }}>{ Services.LanguageService.string('edit') }</Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                            <TouchableWithoutFeedback onPress={() => this.onDelete(e)}>
                                                <View style={{ flex : 1, height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: Utils.Color.ErrorRed }}>
                                                    <Text style={{ fontFamily: Utils.Font.Montserrat(500), color: 'white', fontSize: Utils.UI.normalizeFont(13) }}>{ Services.LanguageService.string('delete') }</Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                    }
                                </View>
                            );
                        })}

                        { (categories == null || categories.length == 0) &&
                            <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: 'gray', textAlign: 'center', fontSize: Utils.UI.normalizeFont(15), marginTop: 20 }}>No hay resultados</Text>
                        }
                    </ScrollView>
                }

                <FloatingAction
                    overlayColor={'rgba(22,22,22,.9)'}
                    color={Utils.Color.Primary}
                    actions={[
                        {
                            render: () => {
                                return (
                                    <View style={{ padding: 8, backgroundColor: 'white', borderRadius: 5 }}>
                                        <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.DarkGray, textAlign: 'center', fontSize: Utils.UI.normalizeFont(11) }}>{ Services.LanguageService.string('TransactionCategoriesScreen.add_new') }</Text>
                                    </View>
                                );
                            },
                            name: "btn_add",
                            position: 0
                        }
                    ]}
                    onPressItem={name => {
                        if(name == 'btn_add') {
                            this.setState({
                                isCreatingOrEditing: true,
                                category: {
                                    name: '',
                                    color_hex: Utils.Color.DarkGray,
                                    transaction_type_id: this.props.navigation.state.params.transaction_type_id
                                }
                            });
                        }
                    }}
                />
            </SafeAreaView>
        );
    }

    renderCreating() {
        const {
            isCreatingOrEditing,
            categories,
            category,
            transaction_type_id
        } = this.state;

        return (
            <ScrollView>
                <View style={styles.formInput}>
                    <Text style={styles.label}>{ Services.LanguageService.string('TransactionCategoriesScreen.name') }</Text>
                    <View style={styles.valueContainer}>
                        <TextInput
                            autoFocus
                            style={styles.value}
                            value={this.state.category != null ? this.state.category.name : null}
                            onChangeText={(text) => {
                                category.name = text;
                                this.setState({ category });
                            }}
                            placeholder={Services.LanguageService.string('TransactionCategoriesScreen.name_placeholder')}
                        />
                    </View>
                </View>

                <View style={styles.formInput}>
                    <Text style={styles.label}>{ Services.LanguageService.string('TransactionCategoriesScreen.color') }</Text>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            let colors = require('../assets/json/colors.json');
                            let options = [];
                            for(var idx in colors) {
                                const color = colors[idx];
                                options.push({
                                    id: color.id,
                                    hexString: color.hexString,
                                    customRow: () => {
                                        return (
                                            <View style={{ padding: 5 }}>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 30, height: 30, borderRadius: 15, backgroundColor: color.hexString, justifyContent: 'center', alignItems: 'center' }}></View>
                                            </View>
                                        );
                                    }
                                })
                            }

                            this.props.navigation.push('OptionsPickerModal', {
                                options: options,
                                scrollViewContentContainerProps: {
                                    flexDirection: 'row',
                                    flexWrap: 'wrap'
                                },
                                onSelectedOption: (option) => {
                                    this.props.navigation.pop();

                                    category.color_hex = option.hexString;
                                    this.setState({
                                        category
                                    });
                                }
                            })
                        }}>
                        <View style={styles.valueContainer}>
                            <View style={{ width: 20, height: 20, borderRadius: 20, backgroundColor: category.color_hex }}></View>
                            <Icon
                                name={'caretdown'}
                                style={{ marginLeft: 5 }}
                                size={18}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                <Button
                    text={Services.LanguageService.string('TransactionCategoriesScreen.save')}
                    buttonStyle={{ width: '90%', alignSelf: 'center', marginTop: 20 }}
                    textStyle={{ color: Utils.Color.PrimaryDark, fontFamily: Utils.Font.Montserrat(600) }}
                    icon={
                        <Icon
                            name={'plus'}
                            size={20}
                            style={{ marginRight: 10 }}
                            color={Utils.Color.PrimaryDark}
                        />
                    }
                    onPress={this.onSubmit}
                />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#877aaf'
    },
    sectionTitle: {
        flex: 0,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    sectionTitleText: {
        fontFamily: Utils.Font.Montserrat(600),
        fontSize: Utils.UI.normalizeFont(20),
        color: 'white'
    },
    form: {
        flex: 0,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10
    },
    formInput: {
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10
    },
    label: {
        flex: 0.5,
        justifyContent: 'flex-start',
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: Utils.UI.normalizeFont(13),
        color: '#222'
    },
    valueContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        padding: 10,
        borderRadius: 5
    },
    value: {
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: Utils.UI.normalizeFont(12),
        color: '#222',
        textAlign: 'center'
    }
});