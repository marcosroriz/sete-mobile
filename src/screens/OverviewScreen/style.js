import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    listItemContainer: {
        flex: 1,
        height: 60,
        paddingHorizontal: 15,
        justifyContent: 'center',
        borderTopColor: "#e6ebf2",
        borderTopWidth: 1,
    },

    listItemLabel: {
        color: "#1c1b1e",
        fontSize: 14,
    },

    sectionHeaderContainer: {
        height: 30,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        paddingHorizontal: 15,
    },

    sectionHeaderLabel: {
        color: 'black',
        fontWeight: "bold"
    },

    listHeaderContainer: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    numBadges: {
        alignSelf: "center",
        backgroundColor: "#ff9933",
        marginRight: 10
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
        justifyContent: 'center',
    },
    cardWelcome: {
        flexWrap: 'wrap'
    },
    loginContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#EFF2F7',
        fontSize: 30,
    },
    rodapeContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    mapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFF2F7',
        fontSize: 30,
        marginTop: 100,
        paddingBottom: 30,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#EFF2F7',
        fontSize: 30,
        paddingBottom: 10
    },
    containerTable: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#EFF2F7',
        fontSize: 30,
    },
    scrollContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        fontSize: 30
    },
    headerBar: {
        backgroundColor: "#FF8D00",
        height: 50
    },
    headerBarTitle: {
        color: "red",
        fontWeight: "700"
    },
    dtheader: {
        marginTop: 15,
        fontSize: 20,
        width: "80%",
        textAlign: 'center', // <-- the magic
        marginLeft: 10,
        marginRight: 10,
        borderBottomColor: "#ecb24a",
        borderBottomWidth: 2,
    },
    dtcell: {
        fontSize: 30
    },
    paperBtn: {
        width: "60%",
        margin: 0,
        marginTop: 12
    },
    image: {
        height: 40,
        width: 40,
        margin: 8,
    },
    overlay: {
        backgroundColor: 'rgba(255,0,0,0.5)',
    },
    imgBg: {
        width: '100%',
        height: '100%',
        flex: 1
    },
    logo: {
        marginTop: 50,
        marginBottom: 10,
        // width: 400,
        height: 65,
        resizeMode: 'contain',
    },
    logoRodape: {
        height: 65,
        marginBottom: 10,
        resizeMode: 'contain',
    },
    txtInput: {
        height: 40,
        backgroundColor: "white",
        borderColor: "#E3E3E3",
        borderStyle: "solid",
        borderWidth: 2,
        margin: 5,
        borderRadius: 20,
        width: "80%",
        paddingLeft: 20
    },
    txtLabel: {
        fontWeight: "700",
        margin: 5,
        marginBottom: 0,
        padding: 10,
        paddingBottom: 0,
        borderBottomColor: "#ecb24a",
        borderBottomWidth: 2,
        width: "80%"
    },
    txtBtn: {
        fontWeight: "700",
        marginTop: 5,
        color: "white",
        width: "80%",
        alignItems: "center",
        textAlign: 'center', // <-- the magic
        justifyContent: 'center',
        textTransform: "uppercase"
    },
    btnContainer: {
        textAlign: "center",
        height: 35,
        backgroundColor: "#547da0",
        color: "white",
        borderColor: "#E3E3E3",
        borderStyle: "solid",
        borderWidth: 2,
        margin: 10,
        width: "50%",
        paddingLeft: 20
    },
    mapView: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
