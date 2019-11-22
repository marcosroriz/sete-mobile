import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFF2F7',
        fontSize: 30,
        paddingBottom: 50,
    },
    logo: {
        width: 200,
        resizeMode: 'contain',
    },
    txtInput: {
        height: 45,
        backgroundColor: "white",
        borderColor: "#E3E3E3",
        borderStyle: "solid",
        borderWidth: 2,
        margin: 10,
        borderRadius: 20,
        width: "80%",
        paddingLeft: 20
    },
    txtLabel: {
        fontWeight: "700",
        margin: 10,
        marginBottom: 0,
        padding: 10,
        paddingBottom: 0,
        borderBottomColor: "#ecb24a",
        borderBottomWidth: 2,
        width: "80%"
    },
    txtBtn: {
        fontWeight: "700",
        marginTop: 10,
        color: "white",
        width: "80%",
        alignItems: "center",
        textAlign: 'center', // <-- the magic
        justifyContent: 'center',
        textTransform: "uppercase"
    },
    btnContainer: {
        textAlign: "center",
        height: 45,
        backgroundColor: "#547da0",
        color: "white",
        borderColor: "#E3E3E3",
        borderStyle: "solid",
        borderWidth: 2,
        margin: 10,
        width: "50%",
        paddingLeft: 20
    }
});
