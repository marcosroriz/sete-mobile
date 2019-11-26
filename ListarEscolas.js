import React from 'react';
import { ActivityIndicator, Image, ScrollView, View } from 'react-native';
import { Appbar, DataTable, List, Text, Divider, Provider as PaperProvider } from 'react-native-paper';
import * as firebase from "firebase";
import styles from './style.js';

export default class ListarEscolas extends React.Component {

  Alunos = [
      {
        Nome: "Zezinho",
        Escola: "Colégio Dinâmico",
        Turno: "Integral"
      },
      { 
        Nome: "Rafaelinha",
        Escola: "Colégio do Sesi de Campinas",
        Turno: "Verpertino"
      }, 
      { 
        Nome: "Pedrinho",
        Escola: "Escola Pedro Gomes",
        Turno: "Matutino"
      },
      { 
        Nome: "Mariazinha",
        Escola: "Escola Assis Chateaubriand",
        Turno: "Verpertino"
      },
      {
        Nome: "Laurinha",
        Escola: "CEPAE UFG",
        Turno: "Verpertino"
      }
    ] 

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
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Nome</DataTable.Title>
              <DataTable.Title numeric>Escola</DataTable.Title>
              <DataTable.Title numeric>Turno</DataTable.Title>
            </DataTable.Header>
            {
            this.Alunos.map((alunos, index)=> {
              return (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{alunos.Nome}</DataTable.Cell>
                  <DataTable.Cell>{alunos.Escola}</DataTable.Cell>
                  <DataTable.Cell>{alunos.Turno}</DataTable.Cell>
                </DataTable.Row>
              )
            }) 
            }
            <DataTable.Pagination
              page={1}
              numberOfPages={3}
              onPageChange={(page) => { console.log(page); }}
              label="1-2 of 6"
            />
          </DataTable>
        </View>
      </PaperProvider>
    )
  }
}
