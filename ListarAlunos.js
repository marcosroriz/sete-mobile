import React from 'react';
import { ActivityIndicator, Image, ScrollView, View } from 'react-native';
import { Appbar, List, Text, Divider, Provider as PaperProvider } from 'react-native-paper';
import * as firebase from "firebase";
import styles from './style.js';

export default class ListarAlunos extends React.Component {

  componentWillMount() {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        console.log("LOGADO");
      } else {
        console.log("NÃO LOGOU");
      }
    });
  }

  goBackToDashboard = () => {
    this.props.navigation.navigate("Dashboard");
  }

  render() {
    return (
      <PaperProvider>
        <Appbar.Header style={styles.headerBar}>
          <Appbar.BackAction
            onPress={() => this.goBackToDashboard()}
          />
          <Appbar.Content
            title="SETE"
          />
        </Appbar.Header>
        <View style={styles.container}>
          <Text>
            Listar os alunos (semelhante ao datatables)
            permitir filtro/procurar
          </Text>
        </View>
      </PaperProvider>
    )
  }
}
