import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Appbar, Provider as PaperProvider } from 'react-native-paper';

import MapView from "react-native-maps";
import GeoJson from './node_modules/react-native-maps/lib/components/Geojson.js'
import styles from './style.js';
import Geojson from './node_modules/react-native-maps/lib/components/Geojson.js';

export default class MapaRotas extends React.Component {

  constructor(props) {
    super(props);
    console.log("SHAPE ANTES")
    console.log(this.props.navigation.state.params.shp)

    this.state = {
      info: this.props.navigation.state.params.info,
      desc: this.props.navigation.state.params.desc,
      lat: this.props.navigation.state.params.lat,
      lng: this.props.navigation.state.params.lng,
      shp: JSON.parse(this.props.navigation.state.params.shp),
    }
    console.log(this.state.shp)
    console.log(typeof this.state.shp)
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
            <GeoJson geojson={this.state.shp}
              strokeColor="gold"
              strokeWidth={5}
            />
          </MapView>
        </View>
      </PaperProvider >
    )

  }
}
