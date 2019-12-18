import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Appbar, Button, Title, DataTable, Provider as PaperProvider } from 'react-native-paper';
import GeoJSON from "ol/format/GeoJSON"
import styles from './style.js';

export default class AlunoInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      info: this.props.navigation.state.params.infoAluno
    }
  }

  goBackToDashboard = () => {
    this.props.navigation.navigate("ListarAlunos");
  }

  goToMap = () => {
    this.props.navigation.navigate("MapaAluno", {
      info: this.state.info,
      desc: this.state.info["NOME"],
      lat: this.state.info["LOC_LATITUDE"],
      lng: this.state.info["LOC_LONGITUDE"],
    });
  }

  goToRota = () => {
    var msgErro = "Aluno não possui rota";
    if (this.state.info["ROTA"]["SHAPE"] != null && this.state.info["ROTA"]["SHAPE"] != "") {
      msgErro = "Rota cadastrada não possui mapa";
    }

    if (this.state.info["ROTA"]["SHAPE"] != null && this.state.info["ROTA"]["SHAPE"] != "") {
      var rawSHP = new GeoJSON().readFeatures(this.state.info["ROTA"]["SHAPE"],
        {
          featureProjection: "EPSG:4326",
          dataProjection: "EPSG:3857"
        })
      var targetSHP = new GeoJSON().writeFeatures(rawSHP, { dataProjection: "EPSG:4326" })

      this.props.navigation.navigate("MapaRota", {
        info: this.state.info,
        desc: this.state.info["NOME"],
        lat: this.state.info["LOC_LATITUDE"],
        lng: this.state.info["LOC_LONGITUDE"],
        shp: targetSHP,
      });
    } else {
      Alert.alert("Erro!", msgErro,
        [{
          text: "Retornar",
          onPress: () => { }
        }]);
    }
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
          <Title style={styles.dtheader}>{this.state.info["NOME"]}</Title>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Data de Nasc.</DataTable.Cell>
              <DataTable.Cell>{this.state.info["DATA_NASCIMENTO"]}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Sexo</DataTable.Cell>
              <DataTable.Cell>{this.state.info["SEXOSTR"]}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Cor</DataTable.Cell>
              <DataTable.Cell>{this.state.info["CORSTR"]}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Escola</DataTable.Cell>
              <DataTable.Cell>{this.state.info["ESCOLA"]["NOME"]}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Nível</DataTable.Cell>
              <DataTable.Cell>{this.state.info["NIVELSTR"]}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Turno</DataTable.Cell>
              <DataTable.Cell>{this.state.info["TURNOSTR"]}</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
          <Button style={styles.paperBtn} icon="compass" mode="contained" compact="true" onPress={() => this.goToMap()}>
            Ver Localização
          </Button>
          <Button style={styles.paperBtn} icon="map" mode="contained" compact="true" onPress={() => this.goToRota()}>
            Ver Rota
          </Button>
        </View>
      </PaperProvider>
    )
  }
}
