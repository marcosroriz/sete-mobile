// Basic React Imports
import React, { Component } from "react"

// Redux Store
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { finishLoginUserAction } from "../../redux/actions/userActions"

// Secure Store (for credentials)
import * as SecureStore from 'expo-secure-store';

// Widgets
import { Alert, Image, View, KeyboardAvoidingView } from 'react-native';
import { ActivityIndicator, Button, Colors, TextInput } from 'react-native-paper';
import { withTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

// Style
import styles from "./style"

// Firebase
import firebase from "firebase";

// Location
import * as Location from 'expo-location';

// LoginScreen
export class LoginScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            authenticating: false,
            locationError: true,
        }

        this.onPressSignIn = this.onPressSignIn.bind(this);
    }

    async componentDidMount() {
        let rawCredentials = await SecureStore.getItemAsync("credentials");
        if (rawCredentials) {
            const credentials = JSON.parse(rawCredentials);
            this.setState({
                email: credentials.email,
                password: credentials.password
            });
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log("LOCATION STATUS", status);
        if (status !== 'granted') {
            this.setState({ locationError: false });
        }
    }

    onPressSignIn() {
        const { email, password } = this.state;

        this.setState({
            authenticating: true
        });

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then(async (firebaseUser) => {
                console.log("LOGIN COM SUCESSO");
                await SecureStore.setItemAsync('credentials', JSON.stringify({ email, password }));
                this.props.finishLoginUserAction(firebaseUser.user.uid);
            })
            .catch((err) => {
                console.log(err)
                Alert.alert("Erro!", "Usuário ou senha inválido",
                    [{
                        text: "OK",
                        onPress: () => { this.setState({ authenticating: false }); }
                    }]);
            })
    }

    renderCurrentState() {
        if (this.state.authenticating) {
            return (
                <View style={styles.loginContainer}>
                    <ActivityIndicator animating={true} color={Colors.orange500} size={100}
                        style={styles.syncLoadingIndicator} />
                </View>

            )
        } else {
            return (
                <KeyboardAvoidingView behavior="padding" style={styles.loginContainer}>
                    <Image
                        source={require('../../../assets/banner-topo.png')}
                        style={styles.logo}
                    />

                    <TextInput
                        style={styles.txtInput}
                        autoCorrect={false}
                        left={<TextInput.Icon name={() => <Icon name={'envelope'} size={20} />} />}
                        label="E-mail"
                        placeholder="Digite seu e-mail"
                        returnKeyType="next"
                        mode="outlined"
                        value={this.state.email}
                        onChangeText={email => this.setState({ email })}
                        onSubmitEditing={() => { this.passwordInput.focus(); }}
                    />

                    <TextInput
                        style={styles.txtInput}
                        autoCorrect={false}
                        left={<TextInput.Icon name={() => <Icon name={'lock'} size={20} />} />}
                        label="Senha"
                        returnKeyType="done"
                        placeholder="Digite sua senha"
                        mode="outlined"
                        secureTextEntry
                        value={this.state.password}
                        ref={(input) => { this.passwordInput = input; }}
                        onChangeText={password => this.setState({ password })}
                        onSubmitEditing={() => { this.onPressSignIn() }}
                    />

                    <Button style={styles.btnSubmit}
                        mode="contained"
                        onPress={() => this.onPressSignIn()}>
                        Entrar
                    </Button>

                    <View style={styles.rodapeContainer}>
                        <Image
                            style={styles.logoRodape}
                            source={require("../../../assets/banner-rodape-completo.png")} />
                    </View>
                </KeyboardAvoidingView >
            )
        }
    }

    render() {
        return (
            this.renderCurrentState()
        )
    }
}

const mapDispatchProps = (dispatch) => bindActionCreators({ finishLoginUserAction }, dispatch)

export default connect(null, mapDispatchProps)(withTheme(LoginScreen))
