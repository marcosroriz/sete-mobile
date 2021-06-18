import { StyleSheet, Dimensions } from "react-native";
import CommonStyle from "../../styles/CommonStyle";

const SpecificStyle = StyleSheet.create({
    clusterWrapper: {
        padding: 10,
        backgroundColor: "#fee6ce",
        borderRadius: 50,
        borderColor: "orange",
        borderWidth: 2,
        borderStyle: "solid",
        alignItems: "center",
        width: 40,
        height: 40
    },
    clusterText: {
        fontSize: 16,
        fontWeight: "bold"
    }
})

const styles = StyleSheet.flatten(StyleSheet.compose(CommonStyle, SpecificStyle));

export default styles;