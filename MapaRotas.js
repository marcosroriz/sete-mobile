import React from 'react';
import { View } from 'react-native';
import MapView from "react-native-maps";
import GeoJson from './node_modules/react-native-maps/lib/components/GeoJson.js'
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
    myPlace = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                -49.25975561141967,
                -16.680389694309813
              ],
              [
                -49.258317947387695,
                -16.683719534858362
              ],
              [
                -49.25436973571777,
                -16.68388396992598
              ],
              [
                -49.25147294998169,
                -16.68197240353031
              ],
              [
                -49.253103733062744,
                -16.678889191652836
              ],
              [
                -49.257309436798096,
                -16.678601422674454
              ],
              [
                -49.26072120666504,
                -16.67654591737887
              ],
              [
                -49.26091432571411,
                -16.679115295546342
              ]
            ]
          }
        }
      ]
    }
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
          >
            <GeoJson geojson={myPlace} />
          </MapView>
        </View>
      </PaperProvider >
    )
  }
}
