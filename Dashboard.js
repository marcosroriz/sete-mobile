import React from 'react';
import { ActivityIndicator, Image, ScrollView, View } from 'react-native';
import { Appbar, List, Text, Divider, Provider as PaperProvider } from 'react-native-paper';
import * as firebase from "firebase";
import styles from './style.js';

export default class Dashboard extends React.Component {

  state = {
    expanded: true,
  };

  handlePress = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  handleNavigate = (destination) => {
    this.props.navigation.navigate(destination);
  };

  componentWillMount() {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        console.log("LOGADO");
      } else {
        console.log("NÃO LOGOU");
      }
    });
  }

  render() {
    return (
      <PaperProvider>
        <Appbar.Header style={styles.headerBar}>
          <Appbar.Content
            title="SETE"
          />
        </Appbar.Header>
        <View style={styles.container}>
          <ScrollView style={styles.scrollContainer}>
            <List.Section>
              <List.Item
                left={props => <List.Icon {...props} icon="face" />}
                title="Alunos"
                onPress={() => this.handleNavigate("ListarAlunos")}
              />
              <List.Item
                left={props => <List.Icon {...props} icon="school" />}
                title="Escolas"
              />
              <List.Item
                left={props => <List.Icon {...props} icon="account-details" />}
                title="Motoristas"
              />
              <List.Item
                left={props => <List.Icon {...props} icon="bus" />}
                title="Frota"
              />
              <List.Item
                left={props => <List.Icon {...props} icon="gas-station" />}
                title="Fornecedores"
              />
              <List.Item
                left={props => <List.Icon {...props} icon="map-marker-path" />}
                title="Rotas"
                onPress={() => this.handleNavigate("MapaRotas")}
              />
            </List.Section>
          </ScrollView>
        </View>
      </PaperProvider>
    )
  }
}
