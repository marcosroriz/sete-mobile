import React from 'react';
import {
  ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

import { Provider as PaperProvider } from 'react-native-paper';
import * as firebase from "firebase";
import styles from './style.js';

export default class Dashboard extends React.Component {

  state = {
    email: '',
    password: '',
    authenticating: false
  }

  onPressSignIn() {
    this.setState({
      authenticating: true
    })
    firebase.auth().signInWithEmailAndPassword(this.state.email,
      this.state.password)
      .then((firebaseUser) => {
        console.log("deu certo");
        console.log(firebaseUser);
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
          <Text style={styles.txtLabel}>LOGADO</Text>
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
