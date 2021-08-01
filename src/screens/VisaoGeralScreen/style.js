import { StyleSheet, Dimensions } from "react-native";
import CommonStyle from "../../styles/CommonStyle";

const EstiloEspecifico = StyleSheet.create({
    numBadges: {
        alignSelf: "center",
        backgroundColor: "#ff9933",
    },
    infoDiv: {
        backgroundColor: "white",
        borderColor: "#E3E3E3",
        borderStyle: "solid",
        borderWidth: 2,
        borderRadius: 20,
        margin: 10,
        paddingRight: 20,
    },
    infoSection: {
        width: "90%",
        flex: 1,
        justifyContent: "center",
    },
});

const styles = StyleSheet.flatten(StyleSheet.compose(CommonStyle, EstiloEspecifico));

export default styles;
