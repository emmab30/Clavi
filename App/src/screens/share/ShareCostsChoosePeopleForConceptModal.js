import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    SafeAreaView,
    AsyncStorage,
    TouchableWithoutFeedback,
    ScrollView,
    Dimensions,
    FlatList
} from 'react-native';

// Modules
import Icon from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { showMessage, hideMessage } from "react-native-flash-message";
import Modal from "react-native-modalbox";
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import _ from 'lodash';
import {
    Checkbox,
    Divider,
    TouchableRipple
} from 'react-native-paper';

// Styles
import * as Utils from '../../styles'

// Components
import Button from '../../components/Button';

// Services
import * as Services from 'app/src/services';
import { Txt, Helpbox } from 'app/src/components';
import { UIService } from 'app/src/services';

const { width, height } = Dimensions.get('window');
var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

export default class ShareCostsChoosePeopleForConceptModal extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            item: null,
            people: null
        };
    }

    componentDidMount() {
        const { getParam } = this.props.navigation;
        this.setState({
            item: getParam('item'),
            people: getParam('people')
        })
    }

    render() {

        const {
            item,
            people
        } = this.state;

        if(!item || !people)
            return null;

        return (
            <SafeAreaView style={[styles.container, { backgroundColor : 'white' }]}>
                <View style={{ width: '100%', alignSelf: 'center', justifyContent: 'center', marginTop: 0, paddingLeft: 15 }}>
                    <TouchableOpacity
                        style={{ paddingBottom: 20, paddingRight: 20, paddingTop: 20 }}
                        onPress={() => {
                            this.props.navigation.pop()
                        }}>
                        <Txt black style={{ fontSize: 16, color: '#222' }}>{ Services.LanguageService.string('back') }</Txt>
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    <Helpbox
                        boxStyle={{ maxWidth: '97%', alignSelf: 'center', padding: 10, marginBottom: 10 }}>
                        Sólo deja seleccionadas las personas que consumieron <Txt black>{ item.concept }</Txt>
                    </Helpbox>
                    { people.map((e) => {
                        const isOnList = item.excluded_people.length == 0 || !_.some(item.excluded_people, (i) => i.people_id == e.id);

                        return [
                            <TouchableOpacity
                                activeOpacity={.95}
                                onPress={() => {
                                    UIService.Animate();

                                    let isExcluding = !_.some(item.excluded_people, (i) => i.people_id == e.id);
                                    if(isExcluding){
                                        if(item.excluded_people == null)
                                            item.excluded_people = [];

                                        item.excluded_people.push({
                                            id: ID(),
                                            people_id: e.id,
                                            name: e.name
                                        });
                                    } else {
                                        item.excluded_people.splice(item.excluded_people.indexOf(_.find(item.excluded_people, (i) => i.people_id == e.id)), 1);
                                    }

                                    this.setState({
                                        item
                                    });

                                    // Also, update the concept on back
                                    if(this.props.navigation.state.params.onUpdatedItem)
                                        this.props.navigation.state.params.onUpdatedItem(item)
                                }}
                                style={[styles.item, !isOnList ? styles.item_unactive : null]}>
                                <View style={[styles.item, !isOnList ? styles.item_unactive : null, { paddingVertical: 0, paddingHorizontal: 0 }]}>
                                    <Text style={styles.label}>{ e.name }</Text>
                                    <Checkbox
                                        color={Utils.Color.DarkGray}
                                        status={item.excluded_people.length == 0 || !_.some(item.excluded_people, (i) => i.people_id == e.id) ? 'checked' : 'unchecked'}
                                    />
                                </View>
                            </TouchableOpacity>
                        ];
                    })}
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    item: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#FFF',
        marginVertical: 2
    },
    item_unactive: {
        backgroundColor: Utils.Color.White
    },
    label: {
        flex: 1,
        fontFamily: Utils.Font.Montserrat(800),
        fontSize: Utils.UI.normalizeFont(14),
        color: '#333'
    }
});