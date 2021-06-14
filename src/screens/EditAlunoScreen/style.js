import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
    inputContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        fontSize: 30
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFF2F7',
    },
    infoHeadlineBold: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: "center",
    },
    loadingIndicator: {
        margin: 20
    },
    infoText: {
        fontSize: 14,
        textAlign: "justify",
        padding: 20
    },
    infoBold: {
        fontSize: 14,
        fontWeight: "bold",
        padding: 20

    },
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
    kbContainer: {
        width: "100%",
        height: "100%",
    },
    inputContainer: {
        width: "100%",
        height: "100%",
        // marginTop: 20,
        marginBottom: 100,
        // justifyContent: 'center',
        alignItems: 'center'
    },
    txtInput: {
        marginTop: 20,
        width: "80%",
        fontSize: 16,
        backgroundColor: "white"
    },
    rawInput: {
        width: "80%",
        marginTop: 20,
        marginBottom: 20,
        fontSize: 16,
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
    pickerWrap2: {
        width: "100%",
        height: 40,
        marginTop: 20,
        marginBottom: 20,
    },
    pickerWrapper: {
        width: "80%",
        marginTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 20,
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
    fabCancel: {
        backgroundColor: "red",
        position: 'absolute',
        margin: 16,
        left: 0,
        bottom: 0,
    },
    fabSave: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    container: {
        flex: 1,
        // paddingBottom: 10,
        // alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: '#EFF2F7',
        // fontSize: 30,
        // paddingBottom: 10
    },
    mapContainer: {
        resizeMode: "cover",
        width: "100%",
        height: "100%",
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
    dialogRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },

});

export default styles;
