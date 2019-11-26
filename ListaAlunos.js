import React from 'react';
import { View, ScrollView } from 'react-native';
import { Appbar, List, Provider as PaperProvider } from 'react-native-paper';

import * as firebase from "firebase";
import styles from './style.js';

export default class ListaAlunos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alunos: this.Alunos
    }
  }

  Alunos = [
    {
      _id: 1,
      info: {
        nome: "Zezinho",
        escola: "Colégio Dinâmico",
        turno: "Integral",
        endereco: "Rua X",
        cidade: "Cidade F"
      }
    },
    { 
      _id: 2,
      info: {
        nome: "Rafaelinha",
        escola: "Colégio do Sesi de Campinas",
        turno: "Verpertino",
        endereco: "Rua do Limoeiro",
        cidade: "Cidade Z"
      }
    }, 
    {
      _id: 3,
      info: { 
        nome: "Mariazinha",
        escola: "Escola Assis Chateaubriand",
        turno: "Verpertino",
        endereco: "Avenida M",
        cidade: "Cidade A"
      }      
    },
    {
      _id: 4,
      info: {         
        nome: "Pedrinho",
        escola: "Escola Pedro Gomes",
        turno: "Matutino",
        endereco: "rua r", 
        cidade: "Cidade A"       
      }
    },
    {
      _id: 5,
      info: {         
        nome: "Marquinhos",
        escola: "Escola Pedro Gomes",
        turno: "Norturno",
        endereco: "rua r",
        cidade: "Cidade A"       
      }
    },
    {
      _id: 6,
      info: {         
        nome: "Marquinhos",
        escola: "Escola Pedro Gomes",
        turno: "Norturno",
        endereco: "rua r",
        cidade: "Cidade A"       
      }
    },
    {
      _id: 7,
      info: {         
        nome: "Marquinhos",
        escola: "Escola Pedro Gomes",
        turno: "Norturno",
        endereco: "rua r",
        cidade: "Cidade A"       
      }
    },
    {
      _id: 8,
      info: {         
        nome: "Marquinhos",
        escola: "Escola Pedro Gomes",
        turno: "Norturno",
        endereco: "rua r",
        cidade: "Cidade A"       
      }
    },
    {
      _id: 9,
      info: {         
        nome: "Marquinhos",
        escola: "Escola Pedro Gomes",
        turno: "Norturno",
        endereco: "rua r",
        cidade: "Cidade A"       
      }
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
    this.props.navigation.navigate("Dashboard")
  }

  goToAluno = (info) => {
    this.props.navigation.navigate("InfoAluno", {
      infoAluno: info
    });
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
        <View>           
          <List.Section title="Alunos">
            <ScrollView>
              {
                this.Alunos.map((alunos, index)=> {
                  console.log("ALUNO", alunos)
                  return (
                    <List.Accordion
                      key={alunos._id}
                      title={alunos.info.nome}
                      left={props => <List.Icon {...props} icon="face" />}
                      onPress={() => this.goToAluno(alunos.info)}
                    />
                  )
                })
              }
            </ScrollView>
          </List.Section> 
        </View>
      </PaperProvider>
    )
  }
}
