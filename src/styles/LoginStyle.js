import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    loginContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF2F7',
        padding: 10,
        fontSize: 30
    },
    logo: {
        marginTop: 100,
        marginBottom: 50,
        width: width,
        height: 65,
        resizeMode: 'contain',
    },
    txtInput: {
        marginTop: 20,
        width: "80%",
    },
    btnSubmit: {
        marginTop: 40,
        width: "80%",
        padding: 10,
        fontSize: 30,
    },
    rodapeContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        overflow: "hidden"
    },
    logoRodape: {
        width: width,
        height: 65,
        marginBottom: 10,
        resizeMode: 'contain',
    },
});
