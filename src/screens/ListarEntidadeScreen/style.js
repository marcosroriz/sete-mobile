import { StyleSheet } from "react-native";
import CommonStyle from "../../styles/CommonStyle";
import InputStyle from "../../styles/InputStyle";

const estilosBasicos = StyleSheet.flatten(StyleSheet.compose(CommonStyle, InputStyle));
const SpecificStyle = StyleSheet.create({
    listItemContainer: {
        flex: 1,
        height: 60,
        paddingHorizontal: 15,
        justifyContent: "center",
        borderTopColor: "#e6ebf2",
        borderTopWidth: 1,
    },

    listItemLabel: {
        color: "#1c1b1e",
        fontSize: 14,
    },

    sectionHeaderContainer: {
        height: 45,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        paddingHorizontal: 15,
    },

    sectionHeaderLabel: {
        color: "black",
        fontWeight: "bold",
    },

    numBadges: {
        alignSelf: "center",
        backgroundColor: "#ff9933",
        marginRight: 10,
    },
});
const styles = StyleSheet.flatten(StyleSheet.compose(estilosBasicos, SpecificStyle));

export default styles;
