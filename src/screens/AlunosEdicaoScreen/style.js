import { StyleSheet } from "react-native";
import CommonStyle from "../../styles/CommonStyle";
import InputStyle from "../../styles/InputStyle";

const estilosBasicos = StyleSheet.flatten(StyleSheet.compose(CommonStyle, InputStyle));
const SpecificStyle = StyleSheet.create({
    scrollContainer: {
        width: "100%",
    },
});
const styles = StyleSheet.flatten(StyleSheet.compose(estilosBasicos, SpecificStyle));

export default styles;
