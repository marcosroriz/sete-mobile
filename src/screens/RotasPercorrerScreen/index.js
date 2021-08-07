/**
 * RotasPercorrerScreen.js
 *
 * Esta tela permite que o usuário inicie a ação de percorrer uma rota.
 * Tal informação será encaminhada a base de dados para ser analisada pelos gestores.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React from "react";
import * as TaskManager from "expo-task-manager";

// Redux Store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { dbLimparAcoes, dbSalvar } from "../../redux/actions/db";
import { locComecarRastreamento, locAtualizarPosicao, locPararRastreamento } from "../../redux/actions/localizacao";
import { store } from "../../store/Store";

// Widgets
import { Image, View, Modal, StatusBar, Text, Alert } from "react-native";
import { Appbar, FAB, RadioButton, TextInput, Provider as PaperProvider } from "react-native-paper";
import { withTheme } from "react-native-paper";

// Mapas
import MapView, { Geojson, Marker, Polyline } from "react-native-maps";

// Location
import * as Location from "expo-location";

// Style
import styles from "./style";

// Components
import FormView from "../../components/FormView";

// Helpers
import * as turf from "@turf/turf";
import { LineHelper } from "../../helpers/LineHelper";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// CONFIGURAÇÕES E VARIÁVEIS //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import iconeOnibus from "../../../assets/onibus.png";
import iconeBarco from "../../../assets/barco.png";
import iconeComeco from "../../../assets/inicio.png";

const LOCATION_BG_TASK = "background-location-task";

TaskManager.defineTask(LOCATION_BG_TASK, async ({ data, error }) => {
    console.log("DATA", data);
    console.log("Error", error);
    if (error) {
        console.log("error", error);
    }
    if (data) {
        if (data.locations.length > 0) {
            console.log("ENVIANDO DISPATCH:");
            console.log("[data.locations[0].coords]", [data.locations[0].coords]);
            store.dispatch(locAtualizarPosicao([data.locations[0].coords]));
        }
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENTES ////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class RotasPercorrerScreen extends React.Component {
    accuracy = 0.001;
    routeLastPosition = [];

    geojsonRota = {};
    primeiraPosicaoDaRota = [];
    ultimaPosicaoDaRota = [];

    iconeVeiculo = iconeOnibus;
    temPermissaoLocBackground = true;
    monitorPosicao;

    state = {
        dataInicio: 0,
        coordenadasDaRota: [],
        problemsModalIsOpened: false,
        comecouRota: false,
        buttonGroupIsOppened: false,
        radioOptions: "",
        optionDescription: "",
    };

    animateCamera({ latitude, longitude, heading = 0, altitude = 300, pitch = 45, zoom = 16 }) {
        console.log(latitude, longitude, heading, altitude, pitch, zoom);
        if (this.mapRef !== null && this.mapRef !== undefined)
            this.mapRef.animateCamera({
                center: { latitude, longitude },
                pitch: 0,
                heading,
                zoom,
                altitude,
            });
    }

    parseDados(dadoAlvo, db) {
        this.iconeVeiculo = dadoAlvo["TIPO"] === "1" ? iconeOnibus : iconeBarco;

        // GeoJSON
        this.geojsonRota = turf.toWgs84(JSON.parse(dadoAlvo["SHAPE"]));
        this.primeiraPosicaoDaRota = this.getPrimeiraPosicaoRota();
        this.ultimaPosicaoDaRota = this.getUltimaPosicaoRota();
        this.setState({ coordenadasDaRota: [...this.getGeojsonCoords()] });

        
    }

    async componentDidMount() {
        try {
            // Rota a ser percorrida colocada em um estado
            if (dadoAlvo) this.props.dbLimparAcoes();
            this.props.locComecarRastreamento();

            const { db } = this.props;
            const { dadoAlvo } = this.props.route.params;

            this.parseDados(dadoAlvo, db);

            // Permissão
            const foregroundPermission = await Location.requestForegroundPermissionsAsync();
            const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
            if (!backgroundPermission.granted) {
                this.temPermissaoLocBackground = false;
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
                pitch: 45,
                zoom: 16,
                heading: 0,
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
        if (this.temPermissaoLocBackground) {
            await TaskManager.unregisterAllTasksAsync(LOCATION_BG_TASK);
        } else {
            await this.monitorPosicao.remove();
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        try {
            const { vetorPosicoes } = this.props;

            if (prevProps.vetorPosicoes !== vetorPosicoes) {
                const [lastItemGeojsonLatitude, lastItemGeojsonLongitude] = this.ultimaPosicaoDaRota;
                let userRouteLength = vetorPosicoes?.length;
                if (userRouteLength > 0) {
                    let i = userRouteLength - 1;
                    const lastItemLatitude = vetorPosicoes[i].latitude;
                    const lastItemLongitude = vetorPosicoes[i].longitude;
                    this.animateCamera(vetorPosicoes[i]);

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
        let rawGeojsonCoords = [...this.state.coordenadasDaRota];
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
                    if (LineHelper.subtractToValuesAbs(lineFunction(latitude), longitude) < this.accuracy) {
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
            coordenadasDaRota: treatedGeojsonCoords,
        });
    }

    getPrimeiraPosicaoRota() {
        return [this.geojsonRota.features[0].geometry.coordinates[0][1], this.geojsonRota.features[0].geometry.coordinates[0][0]];
    }

    getUltimaPosicaoRota() {
        const featuresLength = this.geojsonRota.features.length - 1;
        const geojsonLength = this.geojsonRota.features[featuresLength].geometry.coordinates.length - 1;

        return [
            this.geojsonRota.features[featuresLength].geometry.coordinates[geojsonLength][1],
            this.geojsonRota.features[featuresLength].geometry.coordinates[geojsonLength][0],
        ];
    }

    getGeojsonCoords() {
        const tratedCoords = turf.coordAll(this.geojsonRota);
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
                dataInicio: Date.now(),
            });
            if (this.temPermissaoLocBackground) {
                let taskRegistrada = await TaskManager.isTaskRegisteredAsync(LOCATION_BG_TASK);
                if (taskRegistrada) {
                    await TaskManager.unregisterAllTasksAsync(LOCATION_BG_TASK);
                }

                await Location.startLocationUpdatesAsync(LOCATION_BG_TASK, {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 1000,
                    showsBackgroundLocationIndicator: true,
                    /*foregroundService: {
                        notificationTitle: "SETE Rota",
                        notificationBody: "Georeferenciando...",
                        notificationColor: "#FF7B00",
                    },*/
                });
            } else {
                this.monitorPosicao = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Highest,
                        timeInterval: 1000,
                        distanceInterval: 1,
                    },
                    ({ coords }) => {
                        console.log("VOU MANDAR A LOC NO FRONT");
                        store.dispatch(locAtualizarPosicao([coords]));
                    }
                );
            }
            this.setState({ comecouRota: true });
        } catch (err) {
            Alert.alert("Atenção!", err.toString());
        }
    }

    async stopRouteFollow() {
        try {
            if (this.temPermissaoLocBackground) {
                console.log("Chegou aqui ó");
                await TaskManager.unregisterAllTasksAsync(LOCATION_BG_TASK);
            } else {
                await this.monitorPosicao.remove();
            }
            const totalTime = (Date.now() - this.state.dataInicio) / 1000;
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
            store.dispatch(locPararRastreamento());
            this.setState({ comecouRota: false });
        } catch (err) {
            Alert.alert("Atenção!", err.toString());
        }
    }

    alertStopFollow() {
        Alert.alert("Parar Rota?", "Você tem certeza que deseja parar de percorrer rota?", [
            {
                text: "Não, voltar a percorrer",
                onPress: () => console.log("Continue"),
            },
            {
                text: "Sim, parar rota",
                onPress: async () => await this.stopRouteFollow(),
                style: "cancel",
            },
        ]);
    }

    render() {
        const { vetorPosicoes, route } = this.props;
        const { buttonGroupIsOppened, comecouRota, problemsModalIsOpened } = this.state;
        const { dadoAlvo } = route.params;

        let lastLat;
        let lastLon;
        let locationLength = vetorPosicoes?.length;
        if (locationLength > 0) {
            let i = locationLength - 1;
            lastLat = vetorPosicoes[i].latitude;
            lastLon = vetorPosicoes[i].longitude;
        }

        return (
            <PaperProvider>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                    <Appbar.Content title="SETE" subtitle={`Rota: ${dadoAlvo["NOME"]}, ${dadoAlvo["KM"]}km`} />
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
                        <Polyline coordinates={vetorPosicoes} strokeColor="white" strokeWidth={8} zIndex={10} />
                        <Geojson geojson={this.geojsonRota} strokeColor="orange" fillColor="white" strokeWidth={10} zIndex={1} />
                        {vetorPosicoes.length > 0 ? (
                            <Marker
                                coordinate={{
                                    latitude: lastLat,
                                    longitude: lastLon,
                                }}
                            >
                                <Image source={this.iconeVeiculo} style={{ width: 64, height: 64 }} resizeMode="contain" />
                            </Marker>
                        ) : null}
                    </MapView>
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={problemsModalIsOpened}
                        onRequestClose={() => this.setState({ problemsModalIsOpened: false })}
                    >
                        <FormView style={styles.modalContainer} scrollViewStyle={{ backgroundColor: "#EFF2F7" }}>
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
                            <Text style={styles.modalTitle}>Relatar Problema</Text>
                            <RadioButton.Group
                                onValueChange={(value) => this.setState({ radioOptions: value })}
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
                                <RadioButton.Item mode="android" label="Outro" value={3} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            </RadioButton.Group>
                            <TextInput
                                autoCorrect={false}
                                label="Descrição do Problema"
                                placeholder="Descrição"
                                returnKeyType="next"
                                mode="outlined"
                                value={this.state.optionDescription}
                                onChangeText={(val) => this.setState({ optionDescription: val })}
                            />
                        </FormView>
                    </Modal>
                    {!comecouRota ? (
                        <View style={styles.startButtonContainer}>
                            <FAB
                                icon="navigation"
                                color="white"
                                label="Percorrer Rota"
                                style={styles.startButton}
                                onPress={async () => await this.startRouteFollow()}
                            />
                        </View>
                    ) : (
                        <FAB.Group
                            open={buttonGroupIsOppened}
                            fabStyle={{
                                backgroundColor: "#EA3535",
                            }}
                            icon={buttonGroupIsOppened ? "close" : "chat-alert-outline"}
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

// Mapeamento redux
const mapDispatchProps = (dispatch) =>
    bindActionCreators(
        {
            dbLimparAcoes,
            dbSalvar,
            locComecarRastreamento,
            locAtualizarPosicao,
            locPararRastreamento,
        },
        dispatch
    );

const mapStateToProps = (store) => ({
    vetorPosicoes: store.localizacao.vetorPosicoes,
    terminouOperacao: store.db.terminouOperacao,
    terminouOperacaoNaInternet: store.db.terminouOperacaoNaInternet,
    terminouOperacaoNoCache: store.db.terminouOperacaoNoCache,
    terminouOperacaoComErro: store.db.terminouOperacaoComErro,
    db: store.db.dados,
});

export default connect(mapStateToProps, mapDispatchProps)(withTheme(RotasPercorrerScreen));
