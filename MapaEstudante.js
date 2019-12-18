import React from 'react';
import { View } from 'react-native';
import MapView from "react-native-maps";
import GeoJson from 'react-native-maps/lib/components/Geojson'
import { Appbar, Provider as PaperProvider } from 'react-native-paper';
import * as firebase from "firebase";
import styles from './style.js';

export default class MapaRotas extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      info: this.props.state.params.info,
      desc: this.props.state.params.desc,
      lat: this.props.state.params.lat,
      lng: this.props.state.params.lng,
      icon: this.props.state.params.icon
    }
  }

  goBack = () => {
    this.props.navigation.goBack();
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

        <View style={styles.container}>
          <MapView
            initialRegion={{
              latitude: this.state.lat,
              longitude: this.state.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            style={styles.mapView}
          >
            <Marker
              coordinate={{
                latitude: this.state.lat,
                longitude: this.state.lng,
              }}
              description={this.state.desc}
            >

              <Image source={require(this.state.icon)} style={{ height: 35, width: 35 }} />

            </Marker>

          </MapView>
        </View>
      </PaperProvider >
    )
  }
}
