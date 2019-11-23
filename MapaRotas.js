import React from 'react';
import { View } from 'react-native';
import MapView from "react-native-maps";
import { Appbar, Provider as PaperProvider } from 'react-native-paper';
import * as firebase from "firebase";
import styles from './style.js';

export default class MapaRotas extends React.Component {

  componentWillMount() {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        console.log("LOGADO");
        console.log(user);
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
          <MapView
            initialRegion={{
              latitude: -16.6782432,
              longitude: -49.2530005,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            style={styles.mapView}
          />
        </View>
      </PaperProvider >
    )
  }
}
