// Basic React Imports
import React, { Component } from "react"

// Redux Store
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { dbClearAction, dbSaveAction } from "../../redux/actions/db"

// Basic Widgets
import { Alert, Image, ScrollView, View } from "react-native";
import {
    ActivityIndicator, Appbar, Banner, Button, Checkbox, Colors, IconButton,
    Text, TextInput, Provider as PaperProvider, RadioButton, Paragraph
} from 'react-native-paper';
import { withTheme } from 'react-native-paper';

// Swipe Widgets
import { MaterialIcons } from '@expo/vector-icons';
import StepIndicator from 'react-native-step-indicator';
import Swiper from 'react-native-swiper';

// Step config
import * as StepConfig from './stepconfig';

// Style
import styles from "./style";

// Icones Mapa
const iconeOnibus = require("../../../assets/onibus.png");
const iconeBarco = require("../../../assets/barco.png");

// Map
import MapView, { Geojson, Marker } from "react-native-maps";

// GPS
import * as Location from 'expo-location';
import { length, projection } from '@turf/turf';
import createGpx from "gps-to-gpx";
import simplify from "simplify-geojson";

// FS
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

class GenerateRouteScreen extends Component {
    state = {
        // Tela atual
        currentScreen: 0,

        // Variáveis de cadastro
        tipoRota: "",
        nomeRota: "",
        funcionaManha: false,
        funcionaTarde: false,
        funcionaNoite: false,
        kmRota: 0,
        tempoRota: 0,

        // Tipo de icone da rota (default = ônibus)
        markerIcon: iconeOnibus,

        // Variáveis do georeferenciamento
        region: {
            latitude: -16.6782432,
            longitude: -49.2530005,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
        },

        // Monitor do georeferenciamento
        watch_id: null,
        walkedCoordsGps: [],

        // Saída do georeferenciamento
        geoJSON: {},
        gpxString: "",
        gpxFile: FileSystem.documentDirectory,

        // Botões e ações para salvar 
        buttonStart: false,
        buttonStop: false,

        // Dialogos
        showInfoBanner: true
    };


    componentDidMount() {
        this.props.dbClearAction();

        Location.installWebGeolocationPolyfill()

        navigator.geolocation.getCurrentPosition(
            (params) => {
                this.setState({
                    region: {
                        latitude: params.coords.latitude,
                        longitude: params.coords.longitude,
                        latitudeDelta: 0.00922,
                        longitudeDelta: 0.00421,
                    },
                });
            },
            (err) => {
                // TODO: mostrar erro pro usuário
                console.error(err);
            },
            {
                timeout: 1000,
                enableHighAccuracy: true,
                maximumAge: 1000,
            }
        );
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.state.watch_id);
    }

    handleRecordRoutePress() {
        this.setState({
            walkedCoordsGps: [],
        });
        let watchPositionID = navigator.geolocation.watchPosition(
            (params) => {
                this.setState({
                    walkedCoordsGps: [
                        ...this.state.walkedCoordsGps,
                        {
                            latitude: params.coords.latitude,
                            longitude: params.coords.longitude,
                        },
                    ],
                    region: {
                        latitude: params.coords.latitude,
                        longitude: params.coords.longitude,
                        latitudeDelta: 0.00922,
                        longitudeDelta: 0.00421,
                    },
                });
            },
            (err) => console.error(err),
            {
                timeout: 1000,
                enableHighAccuracy: true,
                maximumAge: 100,
                distanceFilter: 0.5,
            }
        );
        this.setState({
            buttonChange: false,
            buttonStart: true,
            watch_id: watchPositionID,
        });
    }

    async handleStopRecordingPress() {
        Alert.alert(
            "Terminar o rastreamento?",
            "Você tem certeza que deseja terminar de rastrear a rota?",
            [
                { text: "Não, voltar a rastrear", onPress: () => this.finishSaveDialog(false), style: "cancel" },
                { text: "Sim, terminar", onPress: () => this.finishSaveDialog(true) }
            ]
        );
    }

    async finishSaveDialog(shouldFinish) {
        if (shouldFinish) {
            if (this.state.watch_id)
                navigator.geolocation.clearWatch(this.state.watch_id);

            let gpxString = await createGpx(this.state.walkedCoordsGps);
            console.log("GPX", gpxString)

            let geoJSON = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: { name: this.state.nomeRota },
                        geometry: {
                            type: "LineString",
                            coordinates: this.state.walkedCoordsGps.map(
                                ({ latitude, longitude }) => [
                                    longitude,
                                    latitude,
                                ]
                            ),
                        },
                    },
                ],
            }

            let geoJSONSimplificado = simplify(geoJSON, 0.00001)
            let geoJSONConvertido = projection.toMercator(geoJSONSimplificado);
            let geoJSONKM = length(geoJSON.features[0]).toFixed(2).toString()
            console.log("GEOJSON CONVERTIDO", geoJSONConvertido)

            let payloadRota = {
                "TIPO": this.state.tipoRota,
                "NOME": this.state.nomeRota,
                "SHAPE": JSON.stringify(geoJSONConvertido),
                "TURNO_MATUTINO": this.state.funcionaManha,
                "TURNO_VESPERTINO": this.state.funcionaTarde,
                "TURNO_NOTURNO": this.state.funcionaNoite,
                "KM": geoJSONKM,
                "TEMPO": "0",

                // Dados opcionais
                "HORA_IDA_INICIO": "",
                "HORA_IDA_TERMINO": "",
                "HORA_VOLTA_INICIO": "",
                "HORA_VOLTA_TERMINO": "",
                "DA_PORTEIRA": false,
                "DA_MATABURRO": false,
                "DA_COLCHETE": false,
                "DA_ATOLEIRO": false,
                "DA_PONTERUSTICA": false,
                "GPX": gpxString
            }
            this.setState({
                watch_id: null,
                gpxString,
                geoJSON
            });

            this.props.dbSaveAction([
                {
                    operation: "rotas",
                    id: this.state.nomeRota,
                    payload: payloadRota
                }
            ]);
            await this.handleExportRoutePress();
            this.onStepPress(2);
        }
    }

    async handleExportRoutePress() {
        if (this.state.gpxString.length > 0) {
            let fileUri = FileSystem.documentDirectory + this.state.nomeRota + ".gpx";
            await FileSystem.writeAsStringAsync(fileUri, this.state.gpxString, {
                encoding: FileSystem.EncodingType.UTF8,
            });
            this.setState({
                gpxFile: fileUri,
                gpxString: [],
            });
        }
    }


    renderStepIndicator = (params) => {
        return (
            <MaterialIcons {...StepConfig.getStepIcon(params)} />
        )
    };

    onStepPress = (position) => {
        const currentIndex = this.swipe.state.index;
        const offset = position - currentIndex;

        console.log("CURRENT INDEX", currentIndex)
        console.log("POSITION", position)
        console.log("OFFSET", offset)

        if (currentIndex == 0) {
            let [canGo, errorMessage] = this.isBasicInformationSupplied()
            if (canGo) {
                const { tipoRota } = this.state;
                let icone = tipoRota == "2" ? iconeBarco : iconeOnibus;

                this.setState({
                    // showInfoBanner: false,
                    markerIcon: icone,
                    // currentScreen: position
                })
                this.swipe.scrollBy(offset);
            } else {
                Alert.alert("Erro", errorMessage, [{ text: "OK" }]);
            }
        } else {
            // this.setState({
            //     showInfoBanner: false,
            //     // currentScreen: position
            // })
            this.swipe.scrollBy(offset);
        }
    };


    isBasicInformationSupplied() {
        const { tipoRota, nomeRota, funcionaManha, funcionaTarde, funcionaNoite } = this.state;
        console.log("CURRENT SCREEN DEPOIS", this.state.currentScreen)

        let canGo = true;
        let errorMessage = "";

        if (tipoRota == "") {
            canGo = false;
            errorMessage = "Por favor, escolha o tipo da rota antes de começar o rastreamento";
        } else if (nomeRota == "") {
            canGo = false;
            errorMessage = "Por favor, informe o nome da rota antes de começar o rastreamento";
        } else if (!(funcionaManha || funcionaTarde || funcionaNoite)) {
            canGo = false;
            errorMessage = "Por favor, escolha pelo menos um turno de funcionamento para a rota";
        }

        return [canGo, errorMessage]
    }

    goToTrackingPage = () => {
        let [canGo, errorMessage] = this.isBasicInformationSupplied()

        if (canGo) {
            const { tipoRota } = this.state;
            let icone = tipoRota == "2" ? iconeBarco : iconeOnibus;

            this.setState({
                showInfoBanner: false,
                markerIcon: icone
            })
            // this.onStepPress(1)
            this.swipe.scrollBy(1);
        } else {
            Alert.alert("Erro", errorMessage, [{ text: "OK" }]);
        }
    }

    render() {
        const { currentScreen, showInfoBanner } = this.state;
        return (
            <PaperProvider theme={this.props.theme}>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction
                        onPress={() => this.props.navigation.push("DashboardScreen")}
                    />
                    <Appbar.Content
                        title="SETE"
                        subtitle="Gerar Rota usando o GPS"
                    />
                </Appbar.Header>
                <View style={styles.container}>
                    <View style={styles.stepIndicator}>
                        <StepIndicator
                            stepCount={3}
                            customStyles={StepConfig.stepStyleOptions}
                            currentPosition={currentScreen}
                            onPress={this.onStepPress}
                            renderStepIndicator={this.renderStepIndicator}
                            labels={['Descrição', 'Rastreamento', 'Salvar']}
                        />
                    </View>
                    <Banner
                        style={styles.bannerStyle}
                        visible={showInfoBanner}
                        actions={[{
                            label: 'Esconder dica',
                            onPress: () => this.setState({ showInfoBanner: false })
                        }]}
                    >
                        Informe os dados básicos da rota. Não se preocupe, você poderá alterá-los posteriormente.
                    </Banner>
                    <Swiper
                        style={{ flexGrow: 1 }}
                        loop={false}
                        ref={(swipe) => { this.swipe = swipe; }}
                        index={currentScreen}
                        autoplay={false}
                        showsPagination={false}
                        scrollEnabled={false}
                        onIndexChanged={(page) => { this.setState({ currentScreen: page }) }}
                        removeClippedSubviews={false}
                    >
                        {this.basicInputScreen()}
                        {this.routeScreen()}
                        {this.saveScreen()}
                    </Swiper>
                </View>
            </PaperProvider>
        );
    }


    basicInputScreen() {
        return (
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.txtInput}
                        autoCorrect={false}
                        label="Nome da Rota"
                        placeholder="Exemplo: Rota Gávea-Bueno"
                        returnKeyType="next"
                        mode="outlined"
                        value={this.state.nomeRota}
                        onChangeText={nomeRota => this.setState({ nomeRota })}
                    />

                    <View style={styles.inputWrapper}>
                        <Text style={styles.labelPicker}>
                            Selecione o tipo da rota:
                        </Text>
                        <RadioButton.Group
                            onValueChange={value => this.setState({ tipoRota: value })}
                            value={this.state.tipoRota}
                            uncheckedColor="red"
                        >
                            <RadioButton.Item
                                mode="android"
                                label="Rodoviário"
                                value="1"
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item
                                mode="android"
                                label="Aquaviário"
                                value="2"
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray" />
                            <RadioButton.Item
                                mode="android"
                                label="Mista"
                                value="3"
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray" />
                        </RadioButton.Group>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.labelPicker}>
                            Marque o horário de funcionamento:
                        </Text>
                        <Checkbox.Item
                            mode="android"
                            label="Manhã"
                            status={this.state.funcionaManha ? 'checked' : 'unchecked'}
                            color={this.props.theme.colors.primary}
                            onPress={() => { this.setState({ funcionaManha: !this.state.funcionaManha }) }}
                        />
                        <Checkbox.Item
                            mode="android"
                            label="Tarde"
                            color={this.props.theme.colors.primary}
                            status={this.state.funcionaTarde ? 'checked' : 'unchecked'}
                            onPress={() => { this.setState({ funcionaTarde: !this.state.funcionaTarde }) }}
                        />
                        <Checkbox.Item
                            mode="android"
                            label="Noite"
                            color={this.props.theme.colors.primary}
                            status={this.state.funcionaNoite ? 'checked' : 'unchecked'}
                            onPress={() => { this.setState({ funcionaNoite: !this.state.funcionaNoite }) }}
                        />
                    </View>
                    <Button style={styles.buttonProx}
                        mode="contained"
                        onPress={() => this.goToTrackingPage()}>
                        Ir para o rastreamento
                    </Button>
                </View>
            </ScrollView >
        )
    }

    routeScreen() {
        return (
            <View style={styles.page}>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        region={this.state.region}
                        mapType="hybrid"
                        showsUserLocation
                        showsMyLocationButton
                        loadingEnabled
                        showsCompass
                        showsScale
                    >
                        <Marker coordinate={this.state.region}>
                            <Image
                                source={this.state.markerIcon}
                                style={{ width: 36, height: 36 }}
                                resizeMode="contain"
                            />
                        </Marker>

                        <Geojson
                            geojson={{
                                type: "FeatureCollection",
                                features: [
                                    {
                                        type: "Feature",
                                        properties: {},
                                        geometry: {
                                            type: "LineString",
                                            coordinates: this.state.walkedCoordsGps.map(
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
                    </MapView>
                </View>
                <View style={styles.buttonContainer}>
                    {!this.state.buttonStart ?
                        (
                            <Button
                                onPress={() => this.handleRecordRoutePress()}
                                mode="contained"
                                compact
                            >
                                Começar a rastrear
                            </Button>
                        ) :
                        (
                            <Button
                                onPress={async () => await this.handleStopRecordingPress()}
                                mode="contained"
                                compact
                            >
                                Parar de rastrear
                            </Button>
                        )
                    }
                </View>
            </View>
        )
    }

    saveScreen() {
        const { finishedOperation, errorOcurred } = this.props;

        if (!finishedOperation) {
            return (
                <View style={styles.infoContainer}>
                    <ActivityIndicator animating={true} color={Colors.orange500} size={100}
                        style={styles.loadingIndicator} />
                    <Text style={styles.loadingHeadlineBold}>
                        Aguarde um minutinho...
                    </Text>
                    <Text style={styles.infoText}>
                        Enviando os dados da rota para o sistema SETE
                    </Text>
                </View>
            )
        } else {
            if (errorOcurred) {
                return (
                    <View style={styles.infoContainer}>
                        <IconButton
                            icon="close"
                            color={Colors.red500}
                            size={100}
                        />
                        <Text style={styles.infoHeadlineBold}>
                            Ocorreu um erro ao salvar a rota
                        </Text>
                        <Paragraph style={styles.infoText}>
                            Apesar de ter ocorrido um erro, o aplicativo também salva a rota traçada como um arquivo GPX no seu celular.
                            Para salvar o arquivo, basta clicar no botão abaixo e encaminhar para o seu e-mail. Posteriormente, importe o arquivo no sistema SETE desktop.
                        </Paragraph>
                        <Button style={styles.buttonProx}
                            mode="contained"
                            onPress={() => Sharing.shareAsync(this.state.gpxFile)}>
                            Salvar o arquivo da rota
                        </Button>
                    </View>
                )
            } else {
                return (
                    <View style={styles.infoContainer}>
                        <IconButton
                            icon="check-bold"
                            color={Colors.green500}
                            size={100}
                        />
                        <Text style={styles.infoHeadlineBold}>
                            Dados enviados com sucesso!
                        </Text>
                        <Button style={styles.buttonProx}
                            mode="contained"
                            onPress={() => this.props.navigation.goBack()}>
                            Retornar ao painel
                        </Button>
                    </View>
                )
            }
        }
    }
}

const mapDispatchProps = (dispatch) => bindActionCreators(
    { dbClearAction: dbClearAction, dbSaveAction: dbSaveAction },
    dispatch
)

const mapStateToProps = (store) => ({
    finishedOperation: store.dbState.finishedOperation,
    errorOcurred: store.dbState.errorOcurred,
})

export default connect(mapStateToProps, mapDispatchProps)(withTheme(GenerateRouteScreen))
