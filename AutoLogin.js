import React from 'react';
import {
  ActivityIndicator, StatusBar, Text, View
} from 'react-native';

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

    // Check if use has login
    // firebase.auth().onAuthStateChanged(async user => {
    //   if (user) {
    //     console.log("LOGADO");
    //     this.props.navigation.navigate("Dashboard");
    //   } else {
    //     console.log("NÃO LOGOU");
    //     this.props.navigation.navigate("Login");
    //   }
    // });
    firebase.auth()
      .signOut()
      .then(() => {
        console.log("AQUI");
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
