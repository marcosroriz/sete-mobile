import { StyleSheet, Dimensions } from "react-native";
import CommonStyle from "../../styles/CommonStyle";

const SpecificStyle = StyleSheet.create({
    container: {
        position: "relative",
        flex: 1,
    },
    clusterWrapper: {
        padding: 10,
        backgroundColor: "#fee6ce",
        borderRadius: 50,
        borderColor: "orange",
        borderWidth: 2,
        borderStyle: "solid",
        alignItems: "center",
        width: 40,
        height: 40,
    },
    clusterText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    startButtonContainer: {
        position: "absolute",
        right: 16,
        bottom: 16,
        zIndex: 5,
    },
    startButton: {
        backgroundColor: "#312DDA",
    },
    optionsButtons: {},

    modalContainer: {
        width: "100%",
        height: "100%",
        backgroundColor: "#EFF2F7",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    modalCloseButtonContainer: {
        marginHorizontal: "auto",
        display: "flex",
        alignItems: "center",
        marginBottom: 20,
    },
    modalCloseButton: {
        backgroundColor: "#312DDA",
    },
    modalTitle: {
        textAlign: "center",
        fontSize: 20,
        marginBottom: 40,
        fontWeight: "700",
    },
});

const styles = StyleSheet.flatten(StyleSheet.compose(CommonStyle, SpecificStyle));

export default styles;
