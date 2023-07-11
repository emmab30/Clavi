/**
* MyRentHero App
*/

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Image,
    Platform
} from 'react-native';

// Modules
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

var {height, width} = Dimensions.get('window');

//Styles
import * as Utils from '../styles'

export default class HeaderBar extends Component {

    constructor(props) {
        super(props);

        this.onBack = this.onBack.bind(this);
        this.state = {

        }
    }

    onNavigatorEvent(event) {

    }

    componentWillMount() {

     }

    componentDidMount() {

    }

    onBack() {
        //this.props.navigator.pop();
    }

    render() {

        let hasLeftContent = (this.props.leftContent != null && this.props.leftContent() != null);
        let hasRightContent = (this.props.rightContent != null && this.props.rightContent() != null);
        let withShadow = (!this.props.shadow);

        return (
            <View style={[withShadow ? styles.parentContainer : null, { width: '100%', minHeight: Platform.select({ ios: 70, android: 70 }), paddingHorizontal: 10 }]}>
                <View
                    {...this.props}
                    style={[styles.container, this.props.containerStyle, {zIndex: 998}]}>
                    <View style={[styles.flex, styles.left, this.props.leftStyle]}>
                        { this.props.isBackButton &&
                            <TouchableOpacity
                                style={Utils.UI.BackButtonStyle}
                                onPress={() => {
                                    this.props.navigation.goBack();
                            }}>
                                <Icon
                                    name={'arrow-left'}
                                    size={25}
                                    color={Utils.Color.DarkGray}
                                />
                                { /* <Image
                                    source={require('../assets/images/common/back.png')}
                                    style={{ resizeMode: 'contain', maxHeight: 18, maxWidth: 18, tintColor: '#222' }} /> */ }
                            </TouchableOpacity>
                        }

                        { !this.props.isBackButton && hasLeftContent && this.props.leftContent() }
                    </View>
                    <View style={[styles.flex, styles.center, this.props.centerStyle]}>
                        { this.props.title &&
                            <Text style={[{fontFamily: Utils.Font.Montserrat(700), fontSize: Utils.UI.normalizeFont(14), color: Utils.Color.DarkGray, textAlign: 'center'}, this.props.titleStyle]}>{this.props.title}</Text>
                        }

                        { !this.props.title && this.props.centerContent !== undefined &&
                            this.props.centerContent()
                        }

                        { this.props.titleIcon &&
                            <Icon
                                style={{marginLeft: 10}}
                                name={this.props.titleIcon}
                                size={this.props.titleIconSize}
                                color={this.props.titleIconColor} />
                        }
                    </View>
                    <View style={[styles.flex, styles.right, this.props.rightStyle]}>
                        { hasRightContent && this.props.rightContent() }
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    parentContainer: {
        shadowOffset:{  width: 0,  height: 1,  },
        shadowColor: '#fff',
        shadowOpacity: .5
    },
    container: {
        width: '100%',
        height: Platform.select({
            ios: 65,
            android: 65
        }),
        backgroundColor: 'white',
        flexDirection: 'row',
        zIndex: 998
    },
    flex: {
        flex: 1,
        justifyContent : 'center'
    },
    left: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    center: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 5
    },
    right: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
