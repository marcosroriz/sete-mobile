import React from "react";
import {
    View,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from "react-native";

class FormView extends React.Component {
    handlePressKeyboard() {
        Keyboard.dismiss();
    }
    render() {
        const { children, scrollViewStyle, ...props } = this.props;
        return (
            <ScrollView style={[{ height: "100%" }, scrollViewStyle]}>
                <TouchableWithoutFeedback
                    onPress={this.handlePressKeyboard}
                    accessible={false}
                >
                    <View {...props}>{children}</View>
                </TouchableWithoutFeedback>
            </ScrollView>
        );
    }
}

export default FormView;
