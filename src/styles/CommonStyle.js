import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    headerBar: {
        backgroundColor: "#FF8D00",
        height: 50
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFF2F7',
        fontSize: 30,
        // paddingBottom: 30,
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
        position: 'absolute',
        backgroundColor: "white",
        margin: 16,
        right: 0,
        top: 0,
    },
    moreMapInfoContainer: {
        width: "100%",
        padding: 0,
        margin: 0
    },
    moreMapInfoList: {
        padding: 0,
        margin: 0
    },
    moreMapInfoButtonsContainer: {
        marginTop: 10,
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
    },
    moreMapInfoButtons: {
        marginRight: 20
    },
    // Loading Styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFF2F7',
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: "center",
    },
    loadingIndicator: {
        margin: 20
    }
})