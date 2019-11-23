import React from 'react';
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as firebase from "firebase";
import styles from './style.js';

export default class Login extends React.Component {

  state = {
    email: '',
    password: '',
    authenticating: false
  }

  onPressSignIn() {
    this.setState({
      authenticating: true
    });

    firebase.auth()
    .signInWithEmailAndPassword(this.state.email, this.state.password)
    .then((firebaseUser) => {
      console.log(firebaseUser);
      console.log("LOGIN COM sucesso");
      this.props.navigation.navigate("Dashboard");
    })
    .catch((err) => console.log(err))
  }

  renderCurrentState() {
    if (this.state.authenticating) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      )
    } else {
      return (
        <View style={styles.container}>
          <Image
            source={require('./img/logo.png')}
            style={styles.logo}
          />

          <Text style={styles.txtLabel}>E-mail</Text>
          <TextInput
            style={styles.txtInput}
            autoCorrect={false}
            placeholder="Digite seu e-mail"
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
          />

          <Text style={styles.txtLabel}>Senha</Text>
          <TextInput
            style={styles.txtInput}
            autoCorrect={false}
            placeholder="Digite sua senha"
            value={this.state.password}
            secureTextEntry
            onChangeText={password => this.setState({ password })}
          />
          <TouchableOpacity style={styles.btnContainer} onPress={() => this.onPressSignIn()}>
            <Text style={styles.txtBtn}>Entrar</Text>
          </TouchableOpacity>
        </View>
      )

    }
  }
  render() {
    return (
      <PaperProvider>
        {this.renderCurrentState()}
      </PaperProvider>
    )
  }
}
