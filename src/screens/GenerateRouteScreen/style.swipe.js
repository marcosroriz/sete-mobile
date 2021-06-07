import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
    headerBar: {
        backgroundColor: "#FF8D00",
        height: 50
    },
    stepIndicator: {
        // backgroundColor: "white",
        marginVertical: 15,
        // paddingVertical: 15,
    },
    pageContainer: {
        width: "100%",
        alignItems: 'center',
        flex: 1,
    },
    bannerStyle: {
        backgroundColor: '#EFF2F7',
        borderColor: '#EFF2F7',
        borderBottomWidth: 0
    },
    buttonProx: {
        marginTop: 40,
        marginBottom: 40,
    },
    inputContainer: {
        width: "100%",
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    txtInput: {
        width: "80%",
        backgroundColor: "white"
    },
    labelPicker: {
        marginTop: 20,
        fontWeight: "bold"
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
        justifyContent: 'space-between',
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFF2F7',
    },
    scrollContainer: {
        flex: 1,
        width: "100%"
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
        backgroundColor: '#EFF2F7',
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
