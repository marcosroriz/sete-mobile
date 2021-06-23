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

import FormView from "../../components/FormView";

const LOCATION_TASK_NAME = "background-location-task";

export class RotasPercorrerScreen extends React.Component {
    state = {
        region: {
            latitude: -16.6782432,
            longitude: -49.2530005,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
        },

        camera: {
            center: { latitude: -16.6782432, longitude: -49.2530005 },
            pitch: 90,
            heading: 20,
            zoom: 20,
            altitude: 300,
        },
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
            this.props.dbClearAction();
            this.props.locationStartTracking();
            console.log(
                "FORE",
                await Location.requestForegroundPermissionsAsync()
            );
            console.log(
                "BACK",
                await Location.requestBackgroundPermissionsAsync()
            );
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
            Alert.alert("Atenção!", err.toString());
        }
    }

    async componentWillUnmount() {
        await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
    }

    componentDidUpdate(prevProps, prevState) {
        const { locationTrackData } = this.props;

        if (prevProps.locationTrackData !== locationTrackData) {
            let locationLength = locationTrackData?.length;
            if (locationLength > 0) {
                let i = locationLength - 1;
                this.animateCamera(locationTrackData[i]);
            }
            console.log("aqui");
        }
    }

    openModal() {
        this.setState({ problemsModalIsOpened: true });
    }

    async startRouteFollow() {
        try {
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
        const {
            region,
            camera,
            buttonGroupIsOppened,
            hasStartedRoute,
            problemsModalIsOpened,
        } = this.state;
        const { targetData } = route.params;

        console.log("LOCATION TRACK SIZE", locationTrackData?.length);
        let locationLength = locationTrackData?.length;
        let reg = region;
        let lastLat = reg.latitude;
        let lastLon = reg.longitude;
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
                            geojson={JSON.parse(targetData["SHAPE"])}
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
                            />
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
