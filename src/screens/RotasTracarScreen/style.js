import { StyleSheet } from "react-native";
import CommonStyle from "../../styles/CommonStyle";
import InputStyle from "../../styles/InputStyle";

const SpecificStyle = StyleSheet.create({
    // Tab scroll container
    tabScrollContainer: {
        flex: 1,
        width: "100%",
    },

    // Steps
    stepIndicator: {
        marginTop: 15, // marginVertical
        paddingBottom: 10,
        borderBottomColor: "#cacdd0",
        borderBottomWidth: 2,
        borderStyle: "solid",
    },

    // Buttons
    buttonProx: {
        marginTop: 40,
        marginBottom: 40,
    },

    buttonContainer: {
        height: "18%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    // Ultima parte
    infoContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EFF2F7",
    },

    // Mapa
    mapContainer: {
        resizeMode: "cover",
        width: "100%",
        height: "80%",
    },

    // Banner
    bannerStyle: {
        backgroundColor: "#EFF2F7",
        borderColor: "#EFF2F7",
        borderBottomWidth: 0,
    },

});

const estilosBasicos = StyleSheet.flatten(StyleSheet.compose(CommonStyle, InputStyle));
const styles = StyleSheet.flatten(StyleSheet.compose(estilosBasicos, SpecificStyle));

export default styles;

/*
const styles = StyleSheet.create({
    infoContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EFF2F7",
    },
    infoHeadlineBold: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    loadingIndicator: {
        margin: 20,
    },
    infoText: {
        fontSize: 14,
        textAlign: "justify",
        padding: 20,
    },
    infoBold: {
        fontSize: 14,
        fontWeight: "bold",
        padding: 20,
    },
    headerBar: {
        backgroundColor: "#FF8D00",
        height: 50,
    },
    pageContainer: {
        width: "100%",
        alignItems: "center",
        flex: 1,
    },
    
    buttonProx: {
        marginTop: 40,
        marginBottom: 40,
    },
    inputContainer: {
        width: "100%",
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    txtInput: {
        width: "80%",
        backgroundColor: "white",
    },
    labelPicker: {
        marginTop: 20,
        fontWeight: "bold",
    },
    inputWrapper: {
        width: "80%",
        marginTop: 20,
        paddingLeft: 20,
        backgroundColor: "white",
        borderColor: "#bbb",
        borderStyle: "solid",
        borderWidth: 2,
        borderRadius: 5,
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        // justifyContent: 'center',
        alignItems: "center",
        backgroundColor: "#EFF2F7",
    },
    scrollContainer: {
        flex: 1,
        width: "100%",
    },
    // container: {
    //     flex: 1,
    //     backgroundColor: "#fff",
    //     alignItems: "center",
    //     justifyContent: "space-between",
    //     // paddingTop: 60,
    //     // paddingBottom: 50,
    // },
    container: {
        flex: 1,
        // alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "#EFF2F7",
        // fontSize: 30,
        // paddingBottom: 10
    },
    mapContainer: {
        resizeMode: "cover",
        width: "100%",
        height: "80%",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    buttonContainer: {
        height: "18%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default styles;
*/