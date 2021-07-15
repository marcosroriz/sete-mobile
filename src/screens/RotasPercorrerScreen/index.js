import React from "react";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

// Redux Store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { dbClearAction, dbSaveAction } from "../../redux/actions/dbCRUDAction";
import {
    locationStartTracking,
    locationUpdatePosition,
    locationStopTracking,
} from "../../redux/actions/locationActions";
import { store } from "../../store/Store";

// Widgets
import { Image, View, Modal, StatusBar, Text, Alert } from "react-native";
import {
    Appbar,
    FAB,
    RadioButton,
    TextInput,
    Provider as PaperProvider,
} from "react-native-paper";
import { withTheme } from "react-native-paper";

import MapView, { Geojson, Marker, Polyline } from "react-native-maps";

// Style
import styles from "./style";

// Components
import FormView from "../../components/FormView";

// Helpers
import * as turf from "@turf/turf";
import { LineHelper } from "../../helpers/LineHelper";

import iconeOnibus from "../../../assets/onibus.png";
import iconeBarco from "../../../assets/barco.png";

const LOCATION_TASK_NAME = "background-location-task";

export class RotasPercorrerScreen extends React.Component {
    accuracy = 0.001;
    routeLastPosition = [];
    geojsonRoute = {};
    routeIcon = iconeOnibus;
    hasBackgroundPermission = true;
    clearWatchPosition;
    state = {
        beginningDate: 0,
        routeCoords: [],
        problemsModalIsOpened: false,
        hasStartedRoute: false,
        buttonGroupIsOppened: false,
        radioOptions: "",
        optionDescription: "",
    };

    animateCamera({
        latitude,
        longitude,
        heading = null,
        altitude = 300,
        pitch = 90,
        zoom = 15,
    }) {
        if (this.mapRef !== null && this.mapRef !== undefined)
            this.mapRef.animateCamera({
                center: { latitude: latitude, longitude: longitude },
                pitch: pitch,
                heading: heading,
                zoom: zoom,
                altitude: altitude,
            });
    }

    async componentDidMount() {
        try {
            // Rota a ser percorrida colocada em um estado
            if (targetData) this.props.dbClearAction();
            this.props.locationStartTracking();

            const { targetData } = this.props.route.params;
            this.routeIcon =
                targetData["TIPO"] === "1" ? iconeOnibus : iconeBarco;
            this.geojsonRoute = turf.toWgs84(JSON.parse(targetData["SHAPE"]));
            this.lastRoutePosition = this.getGeojsonLastLatLng();
            this.setState({ routeCoords: [...this.getGeojsonCoords()] });

            //PERMISSION
            const foregroundPermission =
                await Location.requestForegroundPermissionsAsync();
            const backgroundPermission =
                await Location.requestBackgroundPermissionsAsync();
            if (!backgroundPermission.granted) {
                this.hasBackgroundPermission = false;
                if (!foregroundPermission.granted) {
                    throw "Para usar essa funcionalidade, é necessário liberar o acesso ao GPS!";
                }
            }

            const {
                coords: { latitude, longitude, altitude, heading },
            } = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });
            this.animateCamera({
                latitude: latitude,
                longitude: longitude,
                pitch: 90,
                zoom: 17,
                heading: heading,
                altitude: altitude,
            });
        } catch (err) {
            Alert.alert("Atenção!", err.toString(), [
                {
                    text: "OK!",
                    onPress: () => this.props.navigation.goBack(),
                    style: "cancel",
                },
            ]);
        }
    }

    async componentWillUnmount() {
        if (this.hasBackgroundPermission) {
            await TaskManager.unregisterAllTasksAsync(LOCATION_TASK_NAME);
        } else {
            await this.clearWatchPosition.remove();
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        try {
            const { locationTrackData } = this.props;

            if (prevProps.locationTrackData !== locationTrackData) {
                const [lastItemGeojsonLatitude, lastItemGeojsonLongitude] =
                    this.lastRoutePosition;
                let userRouteLength = locationTrackData?.length;
                if (userRouteLength > 0) {
                    let i = userRouteLength - 1;
                    const lastItemLatitude = locationTrackData[i].latitude;
                    const lastItemLongitude = locationTrackData[i].longitude;
                    this.animateCamera(locationTrackData[i]);

                    this.filterRoute({
                        latitude: lastItemLatitude,
                        longitude: lastItemLongitude,
                    });
                    if (
                        LineHelper.checkIfInAccuracyRange({
                            comparedValue: lastItemLatitude,
                            baseValue: lastItemGeojsonLatitude,
                            accuracy: this.accuracy,
                        }) &&
                        LineHelper.checkIfInAccuracyRange({
                            comparedValue: lastItemLongitude,
                            baseValue: lastItemGeojsonLongitude,
                            accuracy: this.accuracy,
                        })
                    ) {
                        await this.stopRouteFollow();
                    }
                }
            }
        } catch (err) {
            Alert.alert("Atenção!", err.toString());
        }
    }

    filterRoute({ latitude, longitude }) {
        let isInRoute = false;
        let rawGeojsonCoords = [...this.state.routeCoords];
        let treatedGeojsonCoords = [];

        let beforeCoordsLatitude = null;
        let beforeCoordsLongitude = null;
        let coordsLatitude = null;
        let coordsLongitude = null;
        let lineFunction = null;

        for (let i = rawGeojsonCoords.length - 1; i >= 0; i--) {
            coordsLatitude = rawGeojsonCoords[i].latitude;
            coordsLongitude = rawGeojsonCoords[i].longitude;
            treatedGeojsonCoords.unshift({
                latitude: coordsLatitude,
                longitude: coordsLongitude,
            });

            if (i !== 0) {
                beforeCoordsLatitude = rawGeojsonCoords[i - 1].latitude;
                beforeCoordsLongitude = rawGeojsonCoords[i - 1].longitude;
                if (
                    LineHelper.checkIfBetweenTwoPoints({
                        value: longitude,
                        firstLimit: beforeCoordsLongitude,
                        secondLimit: coordsLongitude,
                        accuracy: 0.001,
                    }) &&
                    LineHelper.checkIfBetweenTwoPoints({
                        value: latitude,
                        firstLimit: beforeCoordsLatitude,
                        secondLimit: coordsLatitude,
                        accuracy: 0.001,
                    })
                ) {
                    lineFunction = LineHelper.createLineFunction({
                        x0: beforeCoordsLatitude,
                        y0: beforeCoordsLongitude,
                        x1: coordsLatitude,
                        y1: coordsLongitude,
                    });
                    if (
                        LineHelper.subtractToValuesAbs(
                            lineFunction(latitude),
                            longitude
                        ) < this.accuracy
                    ) {
                        isInRoute = true;
                        treatedGeojsonCoords.unshift({
                            latitude,
                            longitude,
                        });
                        break;
                    }
                }
            }
        }
        console.log("isInRoute", isInRoute);
        console.log("treatedGeojsonCoords", treatedGeojsonCoords.length);
        this.setState({
            routeCoords: treatedGeojsonCoords,
        });
    }

    getGeojsonLastLatLng() {
        const featuresLength = this.geojsonRoute.features.length - 1;
        const geojsonLength =
            this.geojsonRoute.features[featuresLength].geometry.coordinates
                .length - 1;

        return [
            this.geojsonRoute.features[featuresLength].geometry.coordinates[
                geojsonLength
            ][1],
            this.geojsonRoute.features[featuresLength].geometry.coordinates[
                geojsonLength
            ][0],
        ];
    }

    getGeojsonCoords() {
        const tratedCoords = turf.coordAll(this.geojsonRoute);
        return tratedCoords.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
        }));
    }

    openModal() {
        this.setState({ problemsModalIsOpened: true });
    }

    async startRouteFollow() {
        try {
            this.setState({
                beginningDate: Date.now(),
            });
            if (this.hasBackgroundPermission) {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 1000,
                    showsBackgroundLocationIndicator: true,
                    foregroundService: {
                        notificationTitle: "SETE Rota",
                        notificationBody: "Georeferenciando...",
                        notificationColor: "#FF7B00",
                    },
                });
            } else {
                this.clearWatchPosition = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Highest,
                        timeInterval: 1000,
                        distanceInterval: 1,
                    },
                    ({ coords }) => {
                        store.dispatch(locationUpdatePosition([coords]));
                    }
                );
            }
            this.setState({ hasStartedRoute: true });
        } catch (err) {
            Alert.alert("Atenção!", err.toString());
        }
    }

    async stopRouteFollow() {
        try {
            if (this.hasBackgroundPermission) {
                console.log("Chegou aqui ó");
                await TaskManager.unregisterAllTasksAsync(LOCATION_TASK_NAME);
            } else {
                await this.clearWatchPosition.remove();
            }
            const totalTime = (Date.now() - this.state.beginningDate) / 1000;
            console.log("totalTime", totalTime);

            Alert.alert(
                "Parabéns!!!",
                `Você percorreu a rota em ${
                    totalTime >= 3600
                        ? `${(totalTime / (60 * 60)).toFixed(2)} horas`
                        : totalTime >= 60
                        ? `${(totalTime / 60).toFixed(2)} minutos`
                        : `${totalTime.toFixed(2)} segundos`
                }`
            );
            store.dispatch(locationStopTracking());
            this.setState({ hasStartedRoute: false });
        } catch (err) {
            Alert.alert("Atenção!", err.toString());
        }
    }

    alertStopFollow() {
        Alert.alert(
            "Parar Rota?",
            "Você tem certeza que deseja parar de percorrer rota?",
            [
                {
                    text: "Não, voltar a percorrer",
                    onPress: () => console.log("Continue"),
                },
                {
                    text: "Sim, parar rota",
                    onPress: async () => await this.stopRouteFollow(),
                    style: "cancel",
                },
            ]
        );
    }

    render() {
        const { locationTrackData, route } = this.props;
        const { buttonGroupIsOppened, hasStartedRoute, problemsModalIsOpened } =
            this.state;
        const { targetData } = route.params;

        let lastLat;
        let lastLon;
        let locationLength = locationTrackData?.length;
        if (locationLength > 0) {
            let i = locationLength - 1;
            lastLat = locationTrackData[i].latitude;
            lastLon = locationTrackData[i].longitude;
        }

        return (
            <PaperProvider>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="transparent"
                    translucent
                />
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <Appbar.Content
                        title="SETE"
                        subtitle={`Rota: ${targetData["NOME"]}, ${targetData["KM"]}km`}
                    />
                </Appbar.Header>
                <View style={styles.container}>
                    <MapView
                        ref={(ref) => {
                            this.mapRef = ref;
                        }}
                        style={{ width: "100%", height: "100%" }}
                        mapType="hybrid"
                        followsUserLocation={true}
                        showsUserLocation
                        showsMyLocationButton
                        loadingEnabled
                        showsCompass
                        showsScale
                    >
                        <Polyline
                            coordinates={locationTrackData}
                            strokeColor="#a83291"
                            strokeWidth={10}
                            zIndex={10}
                        />
                        <Geojson
                            geojson={this.geojsonRoute}
                            strokeColor="orange"
                            fillColor="white"
                            strokeWidth={5}
                            zIndex={1}
                        />
                        {locationTrackData.length > 0 ? (
                            <Marker
                                coordinate={{
                                    latitude: lastLat,
                                    longitude: lastLon,
                                }}
                            >
                                <Image
                                    source={this.routeIcon}
                                    style={{ width: 36, height: 36 }}
                                    resizeMode="contain"
                                />
                            </Marker>
                        ) : null}
                    </MapView>
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={problemsModalIsOpened}
                        onRequestClose={() =>
                            this.setState({ problemsModalIsOpened: false })
                        }
                    >
                        <FormView
                            style={styles.modalContainer}
                            scrollViewStyle={{ backgroundColor: "#EFF2F7" }}
                        >
                            <View style={styles.modalCloseButtonContainer}>
                                <FAB
                                    icon="arrow-down"
                                    color="white"
                                    small
                                    style={styles.startButton}
                                    onPress={() =>
                                        this.setState({
                                            problemsModalIsOpened: false,
                                        })
                                    }
                                />
                            </View>
                            <Text style={styles.modalTitle}>
                                Relatar Problema
                            </Text>
                            <RadioButton.Group
                                onValueChange={(value) =>
                                    this.setState({ radioOptions: value })
                                }
                                value={this.state.radioOptions}
                                uncheckedColor="red"
                            >
                                <RadioButton.Item
                                    mode="android"
                                    label="Via interditada"
                                    value={1}
                                    color={this.props.theme.colors.primary}
                                    uncheckedColor="gray"
                                />
                                <RadioButton.Item
                                    mode="android"
                                    label="Erro Mecânico"
                                    value={2}
                                    color={this.props.theme.colors.primary}
                                    uncheckedColor="gray"
                                />
                                <RadioButton.Item
                                    mode="android"
                                    label="Outro"
                                    value={3}
                                    color={this.props.theme.colors.primary}
                                    uncheckedColor="gray"
                                />
                            </RadioButton.Group>
                            <TextInput
                                autoCorrect={false}
                                label="Descrição do Problema"
                                placeholder="Descrição"
                                returnKeyType="next"
                                mode="outlined"
                                value={this.state.optionDescription}
                                onChangeText={(val) =>
                                    this.setState({ optionDescription: val })
                                }
                            />
                        </FormView>
                    </Modal>
                    {!hasStartedRoute ? (
                        <View style={styles.startButtonContainer}>
                            <FAB
                                icon="navigation"
                                color="white"
                                label="Percorrer Rota"
                                style={styles.startButton}
                                onPress={async () =>
                                    await this.startRouteFollow()
                                }
                            />
                        </View>
                    ) : (
                        <FAB.Group
                            open={buttonGroupIsOppened}
                            fabStyle={{
                                backgroundColor: "#EA3535",
                            }}
                            icon={
                                buttonGroupIsOppened
                                    ? "close"
                                    : "chat-alert-outline"
                            }
                            actions={[
                                {
                                    icon: "map-marker-off",
                                    label: "Parar Rota",
                                    onPress: () => this.alertStopFollow(),
                                },
                                {
                                    icon: "engine-off",
                                    label: "Relatar Problema",
                                    onPress: () => this.openModal(),
                                    small: false,
                                },
                            ]}
                            onStateChange={() =>
                                this.setState({
                                    buttonGroupIsOppened: !buttonGroupIsOppened,
                                })
                            }
                        />
                    )}
                </View>
            </PaperProvider>
        );
    }
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    console.log("DATA", data);
    console.log("Error", error);
    if (error) {
        // Error occurred - check `error.message` for more details.
        return;
    }
    if (data) {
        if (data.locations.length > 0) {
            console.log("ENVIANDO DISPATCH:");
            console.log("[data.locations[0].coords]", [
                data.locations[0].coords,
            ]);
            store.dispatch(locationUpdatePosition([data.locations[0].coords]));
        }
    }
});

const mapDispatchProps = (dispatch) =>
    bindActionCreators(
        {
            dbClearAction,
            dbSaveAction,
            locationStartTracking,
            locationUpdatePosition,
            locationStopTracking,
        },
        dispatch
    );

const mapStateToProps = (store) => ({
    locationTrackData: store.locState.locationTrackData,
    finishedOperation: store.dbState.finishedOperation,
    errorOcurred: store.dbState.errorOcurred,
    dbData: store.dbState.data,
});

export default connect(
    mapStateToProps,
    mapDispatchProps
)(withTheme(RotasPercorrerScreen));
