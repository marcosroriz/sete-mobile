import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

// Redux Store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { dbClearAction, dbSaveAction } from "../../redux/actions/dbCRUDAction";
import { locationStartTracking, locationUpdatePosition, locationStopTracking } from "../../redux/actions/locationActions";
import { store } from "../../store/Store";

// Widgets
import { Animated, Easing, Image, View } from 'react-native';
import {
    Avatar, ActivityIndicator, Appbar, Button, Card, Chip, Colors, DataTable, Divider, FAB, IconButton,
    List, TextInput, Title, Paragraph, Provider as PaperProvider
} from 'react-native-paper';
import { withTheme } from 'react-native-paper';

import MapView, { Callout, CalloutSubview, Geojson, Marker } from "react-native-maps";

// Style
import styles from "./style"

const LOCATION_TASK_NAME = 'background-location-task';

export class RotasPercorrerScreen extends React.Component {
    state = {
        region: {
            latitude: -16.6782432,
            longitude: -49.2530005,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421
        },

        camera: {
            center: {
                latitude: -16.6782432,
                longitude: -49.2530005,
            },
            pitch: 90,
            heading: 0,
            altitude: 100,
            zoom: 15
        }
    };

    componentDidMount() {
        this.props.dbClearAction();
        this.props.locationStartTracking();
    }

    async componentWillUnmount() {
        await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
    }

    onPress = async () => {
        console.log("FORE", await Location.requestForegroundPermissionsAsync());
        console.log("FORE", await Location.requestBackgroundPermissionsAsync());
        let k = await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 1000,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: 'SETE Rota',
                notificationBody: 'Georeferenciando...',
                notificationColor: '#FF7B00',
            }
        })

        console.log("aqui")
    };

    render() {
        const { locationTrackData } = this.props;
        const { region, camera } = this.state;

        console.log("------------------------------------------------")
        console.log("RENDER")
        console.log(locationTrackData)
        let reg = region;
        let lastLat = reg.latitude;
        let lastLon = reg.longitude;
        if (locationTrackData.length > 0) {
            let i = locationTrackData.length - 1;
            lastLat = locationTrackData[i].latitude;
            lastLon = locationTrackData[i].longitude;
        }

        let novaCamera = { ...camera, ...{ center: { latitude: lastLat, longitude: lastLon } } }
        console.log("NOVA", novaCamera)
        return (
            <PaperProvider>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <Appbar.Content
                        title="SETE"
                        subtitle={"Mapa de Alunos"}
                    />
                </Appbar.Header>
                <View style={styles.container}>
                    <TouchableOpacity onPress={this.onPress}>
                        <Text>Enable background location</Text>
                    </TouchableOpacity>
                    <MapView
                        ref={map => { this.map = map }}
                        style={{ width: "100%", height: "50%" }}
                        camera={novaCamera}
                        onRegionChangeComplete={async () => {
                            let cam = await this.map.getCamera();

                            if (cam.altitude == null || cam.altitude == undefined) {
                                cam.altitude = 100;
                            }

                            if (cam.zoom == null || cam.zoom == undefined) {
                                cam.zoom = 15;
                            }

                            console.log("SETANDO CAM", cam)

                            if (cam.center.latitude != camera.center.latitude ||
                                cam.center.longitude != camera.center.longitude ||
                                cam.heading != camera.heading) {
                                this.setState({ "camera": cam })
                            }
                        }}
                        mapType="hybrid"
                        showsUserLocation
                        showsMyLocationButton
                        loadingEnabled
                        showsCompass
                        showsScale
                    >
                        <Geojson
                            geojson={{
                                type: "FeatureCollection",
                                features: [
                                    {
                                        type: "Feature",
                                        properties: {},
                                        geometry: {
                                            type: "LineString",
                                            coordinates: locationTrackData.map(
                                                ({ latitude, longitude }) => [
                                                    longitude,
                                                    latitude,
                                                ]
                                            ),
                                        },
                                    },
                                ],
                            }}
                            strokeColor="orange"
                            fillColor="white"
                            strokeWidth={5}
                        />

                        {locationTrackData.length > 0 ? (
                            <Marker
                                    coordinate={{
                                    "latitude": lastLat,
                                    "longitude": lastLon
                                }}
                            />
                        ) : null}
                    </MapView>
                </View>
            </PaperProvider>

        );
    }
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    console.log("DAta", data)
    console.log("Error", error)
    if (error) {
        // Error occurred - check `error.message` for more details.
        return;
    }
    if (data) {
        const { locations } = data;
        if (data.locations.length > 0) {
            console.log("ENVIANDO DISPATCH:")
            store.dispatch(locationUpdatePosition([data.locations[0].coords]));
        }

    }
});


const mapDispatchProps = (dispatch) => bindActionCreators(
    { dbClearAction, dbSaveAction, locationStartTracking, locationUpdatePosition, locationStopTracking },
    dispatch
)

const mapStateToProps = (store) => ({
    locationTrackData: store.locState.locationTrackData,
    finishedOperation: store.dbState.finishedOperation,
    errorOcurred: store.dbState.errorOcurred,
})

export default connect(mapStateToProps, mapDispatchProps)(withTheme(RotasPercorrerScreen))
