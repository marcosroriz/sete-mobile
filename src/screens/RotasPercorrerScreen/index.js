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
import {
    Animated,
    Easing,
    Image,
    View,
    Modal,
    StatusBar,
    Text,
    Alert,
} from "react-native";
import {
    Avatar,
    ActivityIndicator,
    Appbar,
    Button,
    Card,
    Chip,
    Colors,
    DataTable,
    Divider,
    FAB,
    IconButton,
    List,
    RadioButton,
    TextInput,
    Title,
    Paragraph,
    Provider as PaperProvider,
} from "react-native-paper";
import { withTheme } from "react-native-paper";

import MapView, {
    Callout,
    CalloutSubview,
    Geojson,
    Marker,
    Polyline,
} from "react-native-maps";

// Style
import styles from "./style";

// Components
import FormView from "../../components/FormView";

// Helpers
import * as turf from "@turf/turf";
import { LineHelper } from "../../helpers/LineHelper";

// const iconeOnibus = require("../../../assets/onibus.png");
// const iconeBarco = require("../../../assets/barco.png");
import iconeOnibus from "../../../assets/onibus.png";
import iconeBarco from "../../../assets/barco.png";

const LOCATION_TASK_NAME = "background-location-task";

export class RotasPercorrerScreen extends React.Component {
    acuracy = 0.001;
    geojsonRouteObj = {};
    routeIcon = iconeOnibus;
    hasBackgroundPermission = true;
    state = {
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
            const { targetData } = this.props.route.params;
            this.routeIcon =
                targetData["TIPO"] === "1" ? iconeOnibus : iconeBarco;
            this.geojsonRouteObj = turf.toWgs84(
                JSON.parse(targetData["SHAPE"])
            );
            if (targetData) this.props.dbClearAction();
            this.props.locationStartTracking();

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
        await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
    }

    componentDidUpdate(prevProps, prevState) {
        const { locationTrackData } = this.props;

        if (prevProps.locationTrackData !== locationTrackData) {
            const [lastItemGeojsonLatitude, lastItemGeojsonLongitude] =
                this.getGeojsonLastLatLng();
            let userRouteLength = locationTrackData?.length;
            if (userRouteLength > 0) {
                let i = userRouteLength - 1;
                const lastItemLatitude = locationTrackData[i].latitude;
                const lastItemLongitude = locationTrackData[i].longitude;

                this.animateCamera(locationTrackData[i]);
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
                    this.stopRouteFollow();
                }
            }
        }
    }

    getGeojsonLastLatLng() {
        const featuresLength = this.geojsonRouteObj.features.length - 1;
        const geojsonLength =
            this.geojsonRouteObj.features[featuresLength].geometry.coordinates
                .length - 1;

        return [
            this.geojsonRouteObj.features[featuresLength].geometry.coordinates[
                geojsonLength
            ][0],
            this.geojsonRouteObj.features[featuresLength].geometry.coordinates[
                geojsonLength
            ][1],
        ];
    }

    openModal() {
        this.setState({ problemsModalIsOpened: true });
    }

    async startRouteFollow() {
        try {
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
                await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Highest,
                        timeInterval: 1000,
                        distanceInterval: 1,
                    },
                    ({ coords }) => {
                        store.dispatch(locationUpdatePosition(coords));
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
            await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
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
                        <Geojson
                            geojson={this.geojsonRouteObj}
                            strokeColor="orange"
                            fillColor="white"
                            strokeWidth={5}
                        />
                        <Polyline
                            coordinates={locationTrackData}
                            strokeColor="#a83291"
                            strokeWidth={10}
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
