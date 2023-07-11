import React from 'react';
import {
    LayoutAnimation
} from 'react-native';

var UIService = {
    Animate: () => {
        LayoutAnimation.configureNext({
            duration: 600,
            create: {
                type: LayoutAnimation.Types.spring,
                property: LayoutAnimation.Properties.opacity,
                springDamping: 0.8,
                /*springDamping: 2,
                property: LayoutAnimation.Properties.opacity,
                type: LayoutAnimation.Types.spring,*/
            },
            update: {
                type: LayoutAnimation.Types.spring,
                property: LayoutAnimation.Properties.opacity,
                springDamping: 0.8,
                /*springDamping: 2,
                property: LayoutAnimation.Properties.opacity,
                type: LayoutAnimation.Types.spring,*/
            }
        });
    }
}

export default UIService;