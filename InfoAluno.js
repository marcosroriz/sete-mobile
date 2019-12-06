import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Appbar, DataTable, Provider as PaperProvider } from 'react-native-paper';

import * as firebase from "firebase";
import styles from './style.js';

export default class AlunoInfo extends React.Component {
  constructor(props){
    super(props);
    const { navigation } = this.props;
    this.state = {
      info: navigation.state.params.infoAluno
    }
  } 

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
    this.props.navigation.navigate("ListaAlunos");
  }

  goToMap = () => {
    console.log(this.state)
    /*
    this.props.navigation.navigate("InfoAluno", {
      
    });
    */
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
        <View style={styles.containerTable}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>
                <Text>{this.state.info.nome}</Text>
              </DataTable.Title>              
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>Escola</DataTable.Cell>
              <DataTable.Cell>{this.state.info.escola}</DataTable.Cell>              
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Turno</DataTable.Cell>
              <DataTable.Cell>{this.state.info.turno}</DataTable.Cell>              
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Endereço</DataTable.Cell>
              <DataTable.Cell>{this.state.info.endereco}</DataTable.Cell>              
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Cidade</DataTable.Cell>
              <DataTable.Cell>{this.state.info.cidade}</DataTable.Cell>              
            </DataTable.Row>
          </DataTable>
          <TouchableOpacity style={styles.btnContainer} onPress={() => this.goToMap()}>
            <Text style={styles.txtBtn}>Ver mapa</Text>
          </TouchableOpacity>
        </View>
      </PaperProvider>
    )
  }
}
