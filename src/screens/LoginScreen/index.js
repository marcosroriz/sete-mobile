/**
 * LoginScreen.js
 *
 * Esta tela controla o login do usuário no sistema.
 * Atualmente, usamos o firebase para verificar as credenciais do mesmo.
 * As credenciais também são criptografas e salvas para serem usadas sem que o usuário tenha que digitar novamente.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React, { Component } from "react";

// Redux Store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { finalizaAcaoLogin } from "../../redux/actions/usuario";

// Secure Store (para as credentials)
import * as SecureStore from "expo-secure-store";

// Widgets
import { Alert, Image, View, KeyboardAvoidingView } from "react-native";
import { ActivityIndicator, Button, Colors, TextInput } from "react-native-paper";
import { withTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";

// Style
import styles from "./style";

// Firebase
import firebase from "firebase";

// Location (para pedir permissão)
import * as Location from "expo-location";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENTES ////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// LoginScreen
export class LoginScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            senha: "",
            tentandoAutenticar: false,
            erroPermissaoLocalizacao: true,
        };

        this.apertouBotaoLogin = this.apertouBotaoLogin.bind(this);
    }

    async componentDidMount() {
        let rawCredentials = await SecureStore.getItemAsync("credentials");
        if (rawCredentials) {
            const credentials = JSON.parse(rawCredentials);
            this.setState({
                email: credentials.email,
                senha: credentials.senha,
            });
        }

        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            this.setState({ erroPermissaoLocalizacao: false });
        }
    }

    /**
     * Handler que é ativado quando o usuário aperta o botão de login ou clica em próximo no campo de senha
     */
    apertouBotaoLogin() {
        const { email, senha } = this.state;

        this.setState({
            tentandoAutenticar: true,
        });

        firebase
            .auth()
            .signInWithEmailAndPassword(email, senha)
            .then(async (firebaseUser) => {
                // Salva as credenciais
                await SecureStore.setItemAsync("credentials", JSON.stringify({ email, senha }));

                // Dispara ação que configura o usuário logado como usuário atual e redireciona o mesmo para dashboard
                this.props.finalizaAcaoLogin(firebaseUser.user.uid);
            })
            .catch((err) => {
                // Não conseguimos autenticar
                Alert.alert("Erro!", "Usuário ou senha inválido", [
                    {
                        text: "OK",
                        onPress: () => {
                            this.setState({ tentandoAutenticar: false });
                        },
                    },
                ]);
            });
    }

    render() {
        if (this.state.tentandoAutenticar) {
            // Mostra loading
            return (
                <View style={styles.loginContainer}>
                    <ActivityIndicator animating={true} color={Colors.orange500} size={100} style={styles.syncLoadingIndicator} />
                </View>
            );
        } else {
            // Mostra inputs pro usuário entrar email/senha
            return (
                <KeyboardAvoidingView behavior="padding" style={styles.loginContainer}>
                    <Image source={require("../../../assets/banner-topo.png")} style={styles.logo} />

                    <TextInput
                        style={styles.txtInput}
                        autoCorrect={false}
                        left={<TextInput.Icon name={() => <Icon name={"envelope"} size={20} />} />}
                        label="E-mail"
                        placeholder="Digite seu e-mail"
                        returnKeyType="next"
                        mode="outlined"
                        value={this.state.email}
                        onChangeText={(email) => this.setState({ email })}
                        onSubmitEditing={() => {
                            this.inputSenha.focus();
                        }}
                    />

                    <TextInput
                        style={styles.txtInput}
                        autoCorrect={false}
                        left={<TextInput.Icon name={() => <Icon name={"lock"} size={20} />} />}
                        label="Senha"
                        returnKeyType="done"
                        placeholder="Digite sua senha"
                        mode="outlined"
                        secureTextEntry
                        value={this.state.senha}
                        ref={(input) => {
                            this.inputSenha = input;
                        }}
                        onChangeText={(senha) => this.setState({ senha })}
                        onSubmitEditing={() => {
                            this.apertouBotaoLogin();
                        }}
                    />

                    <Button style={styles.btnSubmit} mode="contained" onPress={() => this.apertouBotaoLogin()}>
                        Entrar
                    </Button>

                    <View style={styles.rodapeContainer}>
                        <Image style={styles.logoRodape} source={require("../../../assets/banner-rodape-completo.png")} />
                    </View>
                </KeyboardAvoidingView>
            );
        }
    }
}

// Mapeamento redux
const mapDispatchProps = (dispatch) => bindActionCreators({ finalizaAcaoLogin }, dispatch);

export default connect(null, mapDispatchProps)(withTheme(LoginScreen));
