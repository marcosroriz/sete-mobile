// Step Config options and style
import React, { Component } from "react"
import { Text } from 'react-native-paper';
import { StyleSheet } from "react-native";

export let stepStyle = StyleSheet.create({
    stepLabel: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
        color: '#999999',
    },
    stepLabelSelected: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
        color: '#4aae4f',
    },
});

export let stepStyleOptions = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: '#fe7013',
    stepStrokeWidth: 3,
    separatorStrokeFinishedWidth: 4,
    stepStrokeFinishedColor: '#fe7013',
    stepStrokeUnFinishedColor: '#aaaaaa',
    separatorFinishedColor: '#fe7013',
    separatorUnFinishedColor: '#aaaaaa',
    stepIndicatorFinishedColor: '#fe7013',
    stepIndicatorUnFinishedColor: '#ffffff',
    stepIndicatorCurrentColor: '#ffffff',
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: '#fe7013',
    stepIndicatorLabelFinishedColor: '#ffffff',
    stepIndicatorLabelUnFinishedColor: '#aaaaaa',
    labelColor: '#999999',
    labelSize: 13,
    currentStepLabelColor: '#fe7013',
};

export function getStepIcon({ position, stepStatus }) {
    const iconConfig = {
        name: 'feed',
        color: stepStatus === 'finished' ? '#ffffff' : '#fe7013',
        size: 15,
    };
    switch (position) {
        case 0: {
            iconConfig.name = 'description';
            break;
        }
        case 1: {
            iconConfig.name = 'map';
            break;
        }
        case 2: {
            iconConfig.name = 'cloud-upload';
            break;
        }
        default: {
            break;
        }
    }
    return iconConfig;
};

export function renderStepLabel({ position, label, currentPosition }) {
    return (
        <Text
            style={
                position === currentPosition 
                    ? stepStyle.stepLabelSelected
                    : stepStyle.stepLabel
            }
        >
            {label}
        </Text>
    );
};
