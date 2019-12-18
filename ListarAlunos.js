import React from 'react';
import { Picker, View, ScrollView } from 'react-native';
import { Appbar, List, Provider as PaperProvider } from 'react-native-paper';
import styles from './style.js';
import parser from './parser.js';
import * as firebase from "firebase/app";

function pegarEscola(idAluno) {
  var escola = { "NOME": "Sem escola cadastrada", "ID_ESCOLA": -1 };
  global.db["escolatemalunos"].forEach(e => {
    if (e["ID_ALUNO"] == idAluno) {
      escola = global.escolas.get(e["ID_ESCOLA"]);
    }
  })
  return escola;
}

function pegarRota(idAluno) {
  var rota = { "NOME": "Sem rota cadastrada", "ID_ROTA": -1 };
  global.db["rotaatendealuno"].forEach(e => {
    if (e["ID_ALUNO"] == idAluno) {
      rota = global.rotas.get(e["ID_ROTA"]);
    }
  })
  return rota;
}

export default class ListaAlunos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alunos: this.Alunos
    }
  }

  Alunos = [];

  componentWillMount() {
    var rawArray = new Array();
    global.alunos.forEach(a => {
      rawArray.push(a["NOME"] + "//" + a["ID_ALUNO"])
    });

    rawArray.sort().forEach(a => {
      var key = a.split("//").slice(-1)[0];
      var alunoJSON = global.alunos.get(parseInt(key));
      alunoJSON["ESCOLA"] = pegarEscola(alunoJSON["ID_ALUNO"])
      alunoJSON["ROTA"] = pegarRota(alunoJSON["ID_ALUNO"])
      
      this.Alunos.push({
        id: alunoJSON["ID_ALUNO"],
        info: alunoJSON
      })
    })
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
            title="SETE: Alunos"
          />
        </Appbar.Header>
        <View style={styles.container}>
          <ScrollView style={styles.scrollContainer}>
            <List.Section>
              {
                this.Alunos.map((alunos, index) => {
                  return (
                    <List.Item
                      key={alunos.id}
                      title={alunos.info["NOME"]}
                      left={props => <List.Icon {...props} icon="face" />}
                      onPress={() => this.goToAluno(alunos.info)}
                    />
                  )
                })
              }
            </List.Section>
          </ScrollView>
        </View>
      </PaperProvider>
    )
  }
}
