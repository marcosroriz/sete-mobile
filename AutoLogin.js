import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as firebase from "firebase";
import styles from './style.js';

export default class AutoLogin extends React.Component {
  static navigationOptions = {
    title: 'SETE',
  };

  componentWillMount() {
    var firebaseConfig = {
      apiKey: "AIzaSyDOHCjGDkv-tsIjVhHxOcEt0rzusFJwQxc",
      authDomain: "softwareter.firebaseapp.com",
      databaseURL: "https://softwareter.firebaseio.com",
      projectId: "softwareter",
      storageBucket: "softwareter.appspot.com",
      messagingSenderId: "881352897273",
      appId: "1:881352897273:web:acfe04f2804ca623bc6828"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Forçar o Sign Out para evitar cache no modo desenvolvimento
    // Retirar o código abaixo em produção
    firebase.auth()
      .signOut()
      .then(() => {
        this.props.navigation.navigate("Login")
      })
      .catch((err) => console.log("ERROR", err));
  }

  // Render 
  render() {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      </PaperProvider>
    );
  }
}
