import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Appbar, List, Text, Divider, Provider as PaperProvider } from 'react-native-paper';

import * as firebase from 'firebase'
import '@firebase/firestore';

import parser from './parser.js';
import styles from './style.js';

export default class Dashboard extends React.Component {

  state = {
    expanded: true,
    authenticating: false
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
        firebase.firestore().collection("data")
          .doc(user.uid)
          .get()
          .then((res) => {
            global.db = res.data();

            global.alunos = new Map();
            global.db["alunos"].forEach(a => global.alunos.set(parseInt(a["ID_ALUNO"]), parser.aluno(a)));

            global.escolas = new Map();
            global.db["escolas"].forEach(e => global.escolas.set(parseInt(e["ID_ESCOLA"]), parser.escola(e)));

            global.fornecedores = new Map();
            global.db["fornecedores"].forEach(f => global.fornecedores.set(parseInt(f["ID_FORNECEDOR"]), parser.fornecedor(f)));

            global.garagem = new Map();
            global.db["garagem"].forEach(g => global.garagem.set(parseInt(g["ID_GARAGEM"]), g));

            global.motoristas = new Map();
            global.db["motoristas"].forEach(m => global.motoristas.set(parseInt(m["ID_MOTORISTA"]), parser.motorista(m)));

            global.os = new Array();
            global.db["ordemdeservico"].forEach(o => global.os.push(o));

            global.rotas = new Map();
            global.db["rotas"].forEach(r => global.rotas.set(parseInt(r["ID_ROTA"]), parser.rota(r)));

            global.veiculos = new Map();
            global.db["veiculos"].forEach(v => global.veiculos.set(parseInt(v["ID_ROTA"]), parser.veiculo(v)));

            this.state.authenticating = true;
          })
          .catch(err => console.log(err))
      }
    });
  }

  render() {
    if (this.state.authenticating) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      )
    } else {
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
                  onPress={() => this.handleNavigate("ListarEscolas")}
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
}
