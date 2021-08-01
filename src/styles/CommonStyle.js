import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
    headerBar: {
        backgroundColor: "#FF8D00",
        height: 50,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EFF2F7",
        fontSize: 30,
        // paddingBottom: 30,
    },
    screenContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#EFF2F7",
        fontSize: 30,
        paddingBottom: 10,
    },
    scrollContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        fontSize: 30,
    },
    kbContainer: {
        width: "100%",
        height: "100%",
    },
    // Cabeçalho inferior
    subHeader: {
        backgroundColor: "white",
        height: 50,
    },

    // Floating buttons
    fabCancel: {
        backgroundColor: "red",
        position: "absolute",
        margin: 16,
        left: 0,
        bottom: 0,
    },
    fabSave: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },

    // Map Styles
    mapContainer: {
        resizeMode: "cover",
        width: "100%",
        height: "100%",
    },
    mapElement: {
        width: "100%",
        height: "100%",
    },
    mapFilterFAB: {
        position: "absolute",
        backgroundColor: "white",
        // borderColor: "gray",
        // borderWidth: 4,
        margin: 16,
        right: 0,
        top: 0,
        // width: 150,
        // // height: 200,
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
    },
    mapSecondFilterFAB: {
        position: "absolute",
        backgroundColor: "white",
        margin: 16,
        right: 0,
        top: 70,
    },
    moreMapInfoContainer: {
        width: "100%",
        padding: 0,
        margin: 0,
    },
    moreMapInfoList: {
        padding: 0,
        margin: 0,
    },
    moreMapInfoButtonsContainer: {
        marginTop: 10,
        padding: 10,
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 12,
    },
    moreMapInfoButtons: {
        marginRight: 20,
    },

    // Loading Styles
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EFF2F7",
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    loadingIndicator: {
        margin: 20,
    },
});
