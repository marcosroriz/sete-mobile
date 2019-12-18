import React from 'react';
import { Image, View } from 'react-native';
import { Appbar, Provider as PaperProvider } from 'react-native-paper';

import MapView from "react-native-maps";

import styles from './style.js';

export default class MapaRotas extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      info: this.props.navigation.state.params.info,
      desc: this.props.navigation.state.params.desc,
      lat: this.props.navigation.state.params.lat,
      lng: this.props.navigation.state.params.lng,
    }
  }

  goBack = () => {
    this.props.navigation.navigate("InfoAluno", {
      infoAluno: this.state.info
    });
  }

  render() {
    return (
      <PaperProvider>
        <Appbar.Header style={styles.headerBar}>
          <Appbar.BackAction
            onPress={() => this.goBack()}
          />
          <Appbar.Content
            title="SETE"
          />
        </Appbar.Header>

        <View style={styles.mapContainer}>
          <MapView
            initialRegion={{
              latitude: this.state.lat,
              longitude: this.state.lng,
              latitudeDelta: 0.0461,
              longitudeDelta: 0.0210,
            }}
            mapType="satellite"
            style={styles.mapView}
          >
            <MapView.Marker
              coordinate={{
                latitude: this.state.lat,
                longitude: this.state.lng,
              }}
              description={this.state.desc}
            >

              <Image source={require("./img/aluno-marcador.png")} style={{ height: 60, width: 60 }} />

            </MapView.Marker>

          </MapView>
        </View>
      </PaperProvider >
    )
  }
}
