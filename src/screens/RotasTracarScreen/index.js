/**
 * RotasTracarScreen.js
 *
 * Esta tela permite que o usuário inicie a ação de traçar uma nova rota.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React, { Component } from "react";
import * as TaskManager from "expo-task-manager";

// Redux Store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { dbLimparAcoes, dbSalvar } from "../../redux/actions/db";
import { locLimparRastreamento, locComecarRastreamento, locAtualizarPosicao, locPararRastreamento } from "../../redux/actions/localizacao";
import { store } from "../../store/Store";

// Widgets
import { Alert, Image, Platform, ScrollView, View } from "react-native";
import {
    ActivityIndicator,
    Appbar,
    Banner,
    Button,
    Checkbox,
    Colors,
    IconButton,
    Text,
    TextInput,
    Provider as PaperProvider,
    RadioButton,
    Paragraph,
} from "react-native-paper";
import { withTheme } from "react-native-paper";

// Swipe Widgets
import { MaterialIcons } from "@expo/vector-icons";
import StepIndicator from "react-native-step-indicator";
import Swiper from "react-native-swiper";

// Passos
import * as StepConfig from "./stepconfig";

// Style
import styles from "./style";

// Map
import MapView, { Geojson, Marker, Polyline } from "react-native-maps";

// GPS
import * as Location from "expo-location";
import { length, projection } from "@turf/turf";
import createGpx from "gps-to-gpx";
import simplify from "simplify-geojson";

// FS
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// CONFIGURAÇÕES E VARIÁVEIS //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Variável lógica que indica se estamos no IOS
const isIOS = Platform.OS === "ios";

// Icones Mapa
const iconeOnibus = require("../../../assets/onibus.png");
const iconeBarco = require("../../../assets/barco.png");

// Ultima posicao
let ultLatitude = null;
let ultLongitude = null;

// Nome e código da task responsável por obter a posição do usuário em background
const LOCATION_BG_TASK = "background-location-task";

TaskManager.defineTask(LOCATION_BG_TASK, async ({ data, error }) => {
    if (error) {
        console.error(error);
    }
    if (data && data.locations.length > 0) {
        let vetorNovasPosicoes = [];
        let posDif = 0;
        for (let pos of data.locations) {
            console.log(pos.coords);
            console.log(pos.coords.latitude, ultLatitude, pos.coords.longitude, ultLongitude)
            console.log("BOOL", pos.latitude != ultLatitude && pos.longitude != ultLongitude)
            if (pos.coords.latitude != ultLatitude && pos.coords.longitude != ultLongitude) {
                vetorNovasPosicoes.push(pos.coords);
                posDif++;
            } else { 
                break;
            }
        }
        console.log("DIF DE POSICOES", posDif);
        if (vetorNovasPosicoes.length > 0) {
            processaDadosLocalizacao(vetorNovasPosicoes);
        }
    }
});

// Método que processa os dados enviados pelo usuário
function processaDadosLocalizacao(coordenadas) {
    if (coordenadas) {
        ultLatitude = coordenadas[0].latitude;
        ultLongitude = coordenadas[0].longitude;
        store.dispatch(locAtualizarPosicao(coordenadas));
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENTES ////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class RotasTracarScreen extends Component {
    // GPS
    temPermissaoLocBackground = false;

    // Monitor do georeferenciamento (somente quando usando GPS foreground)
    monitorPosicao;

    state = {
        // Tela atual
        idTelaAtual: 0,

        // Variáveis de cadastro
        tipoRota: "",
        nomeRota: "",
        funcionaManha: false,
        funcionaTarde: false,
        funcionaNoite: false,
        kmRota: 0,
        tempoRota: 0,

        // Tipo de icone da rota (default = ônibus)
        iconeVeiculo: iconeOnibus,

        // Variáveis do georeferenciamento
        region: {
            latitude: -16.6782432,
            longitude: -49.2530005,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
        },

        // Inicio da rota
        dataInicio: null,

        // Saída do georeferenciamento
        geoJSON: {},
        gpxString: "",
        gpxFile: FileSystem.documentDirectory,

        // Botões e ações para salvar
        comecouRota: false,

        // Dialogos
        mostrarDica: true,
    };

    async componentDidMount() {
        try {
            // Primeiro limpamos todas as rotas pendentes, caso possua
            this.props.dbLimparAcoes();
            this.props.locLimparRastreamento();

            // Permissão
            const foregroundPermission = await Location.requestForegroundPermissionsAsync();

            if (!isIOS) {
                const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
                if (!backgroundPermission.granted) {
                    if (!foregroundPermission.granted) {
                        throw "Para usar essa funcionalidade, é necessário liberar o acesso ao GPS!";
                    }
                } else {
                    this.temPermissaoLocBackground = true;
                }
            } else {
                if (!foregroundPermission.granted) {
                    throw "Para usar essa funcionalidade, é necessário liberar o acesso ao GPS!";
                }
            }

            const {
                coords: { latitude, longitude },
            } = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });
            this.setState({
                region: {
                    latitude,
                    longitude,
                    latitudeDelta: 0.00922,
                    longitudeDelta: 0.00421,
                },
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
            if (this.monitorPosicao != null) {
                await this.monitorPosicao.remove();
            }
        }
    }

    async iniciarRastreamento() {
        try {
            this.props.locComecarRastreamento();

            if (this.temPermissaoLocBackground) {
                let taskRegistrada = await TaskManager.isTaskRegisteredAsync(LOCATION_BG_TASK);
                if (taskRegistrada) {
                    await TaskManager.unregisterAllTasksAsync(LOCATION_BG_TASK);
                }

                await Location.startLocationUpdatesAsync(LOCATION_BG_TASK, {
                    accuracy: Location.Accuracy.Highest,
                    distanceInterval: 5,
                    showsBackgroundLocationIndicator: true,
                    foregroundService: {
                        notificationTitle: "SETE Rota",
                        notificationBody: "Monitorando GPS...",
                        notificationColor: "#FF7B00",
                    },
                });
            } else {
                this.monitorPosicao = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Highest,
                        distanceInterval: 5,
                    },
                    ({ coords }) => {
                        processaDadosLocalizacao([coords]);
                    }
                );
            }
            this.setState({ dataInicio: new Date(), comecouRota: true });
        } catch (err) {
            Alert.alert("Atenção!", err.toString());
        }
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
            dataInicio: new Date(),
            buttonChange: false,
            buttonStart: true,
            watch_id: watchPositionID,
        });
    }

    async handleStopRecordingPress() {
        Alert.alert("Terminar o rastreamento?", "Você tem certeza que deseja terminar de rastrear a rota?", [
            { text: "Não, voltar a rastrear", style: "cancel" },
            { text: "Sim, terminar", onPress: () => this.finalizarTracado() },
        ]);
    }

    async finalizarTracado() {
        if (this.props.vetorPosicoes.length > 0) {
            let posicoes = [];
            let posicoesGPX = [];
            this.props.vetorPosicoes.forEach((pos) => {
                posicoes.push([Number(pos.longitude), Number(pos.latitude)]);
                posicoesGPX.push({
                    longitude: Number(pos.longitude),
                    latitude: Number(pos.latitude)
                });
            });

            let geoJSON = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: { name: this.state.nomeRota },
                        geometry: {
                            type: "LineString",
                            coordinates: posicoes,
                        },
                    },
                ],
            };

            let geoJSONSimplificado = simplify(geoJSON, 0.00001);
            let geoJSONConvertido = projection.toMercator(geoJSONSimplificado);
            let geoJSONKM = length(geoJSON.features[0]).toFixed(2).toString();
            let totalTime = Math.round(((Date.now() - this.state.dataInicio) / 1000) / 60);
            console.log("TOTAL TIME", totalTime);
            console.log("GEOJSON KM", geoJSONKM);

            let gpxString = await createGpx(posicoesGPX);

            let payloadRota = {
                TIPO: this.state.tipoRota,
                NOME: this.state.nomeRota,
                SHAPE: JSON.stringify(geoJSONConvertido),
                TURNO_MATUTINO: this.state.funcionaManha,
                TURNO_VESPERTINO: this.state.funcionaTarde,
                TURNO_NOTURNO: this.state.funcionaNoite,
                KM: geoJSONKM,
                TEMPO: totalTime,

                // Dados opcionais
                HORA_IDA_INICIO: "",
                HORA_IDA_TERMINO: "",
                HORA_VOLTA_INICIO: "",
                HORA_VOLTA_TERMINO: "",
                DA_PORTEIRA: false,
                DA_MATABURRO: false,
                DA_COLCHETE: false,
                DA_ATOLEIRO: false,
                DA_PONTERUSTICA: false,
                GPX: gpxString,
            };
            console.log(payloadRota);
            this.setState({
                gpxString,
                geoJSON,
            });
    
            this.props.dbSalvar([
                {
                    collection: "rotas",
                    id: this.state.nomeRota,
                    payload: payloadRota,
                },
            ]);

            await this.exportarArquivoGPX();
            this.onStepPress(2);
        } else {
            Alert.alert("Erro", "Não há nenhum trajeto para registro");
        }
    }

    async finishSaveDialog(shouldFinish) {
        if (shouldFinish) {
            console.log(this.props.vetorPosicoes);

            console.log("terminei");

            // let gpxString = await createGpx(this.state.walkedCoordsGps);
            // console.log("GPX", gpxString);

            // let geoJSON = {
            //     type: "FeatureCollection",
            //     features: [
            //         {
            //             type: "Feature",
            //             properties: { name: this.state.nomeRota },
            //             geometry: {
            //                 type: "LineString",
            //                 coordinates: this.state.walkedCoordsGps.map(({ latitude, longitude }) => [longitude, latitude]),
            //             },
            //         },
            //     ],
            // };

            // let geoJSONSimplificado = simplify(geoJSON, 0.00001);
            // let geoJSONConvertido = projection.toMercator(geoJSONSimplificado);
            // let geoJSONKM = length(geoJSON.features[0]).toFixed(2).toString();
            // console.log("GEOJSON CONVERTIDO", geoJSONConvertido);

            // let payloadRota = {
            //     TIPO: this.state.tipoRota,
            //     NOME: this.state.nomeRota,
            //     SHAPE: JSON.stringify(geoJSONConvertido),
            //     TURNO_MATUTINO: this.state.funcionaManha,
            //     TURNO_VESPERTINO: this.state.funcionaTarde,
            //     TURNO_NOTURNO: this.state.funcionaNoite,
            //     KM: geoJSONKM,
            //     TEMPO: "0",

            //     // Dados opcionais
            //     HORA_IDA_INICIO: "",
            //     HORA_IDA_TERMINO: "",
            //     HORA_VOLTA_INICIO: "",
            //     HORA_VOLTA_TERMINO: "",
            //     DA_PORTEIRA: false,
            //     DA_MATABURRO: false,
            //     DA_COLCHETE: false,
            //     DA_ATOLEIRO: false,
            //     DA_PONTERUSTICA: false,
            //     GPX: gpxString,
            // };
            // this.setState({
            //     gpxString,
            //     geoJSON,
            // });

            // this.props.dbSalvar([
            //     {
            //         collection: "rotas",
            //         id: this.state.nomeRota,
            //         payload: payloadRota,
            //     },
            // ]);
            // await this.handleExportRoutePress();
            this.onStepPress(2);
        }
    }

    async exportarArquivoGPX() {
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
        return <MaterialIcons {...StepConfig.getStepIcon(params)} />;
    };

    onStepPress = (position) => {
        const currentIndex = this.swipe.state.index;
        const offset = position - currentIndex;

        console.log("CURRENT INDEX", currentIndex);
        console.log("POSITION", position);
        console.log("OFFSET", offset);

        if (currentIndex == 0) {
            let [dadosValidoss, msgErro] = this.validaDadosBasicos();
            if (dadosValidoss) {
                const { tipoRota } = this.state;
                let icone = tipoRota == "2" ? iconeBarco : iconeOnibus;

                this.setState({
                    // mostrarDica: false,
                    iconeVeiculo: icone,
                    // idTelaAtual: position
                });
                this.swipe.scrollBy(offset);
            } else {
                Alert.alert("Erro", msgErro, [{ text: "OK" }]);
            }
        } else {
            // this.setState({
            //     mostrarDica: false,
            //     // idTelaAtual: position
            // })
            this.swipe.scrollBy(offset);
        }
    };

    validaDadosBasicos() {
        const { tipoRota, nomeRota, funcionaManha, funcionaTarde, funcionaNoite } = this.state;
        console.log("CURRENT SCREEN DEPOIS", this.state.idTelaAtual);

        let dadosValidos = true;
        let msgErro = "";

        if (tipoRota == "") {
            dadosValidos = false;
            msgErro = "Por favor, escolha o tipo da rota antes de começar o rastreamento";
        } else if (nomeRota == "") {
            dadosValidos = false;
            msgErro = "Por favor, informe o nome da rota antes de começar o rastreamento";
        } else if (!(funcionaManha || funcionaTarde || funcionaNoite)) {
            dadosValidos = false;
            msgErro = "Por favor, escolha pelo menos um turno de funcionamento para a rota";
        }

        return [dadosValidos, msgErro];
    }

    goToTrackingPage = () => {
        let [dadosValidos, msgErro] = this.validaDadosBasicos();

        if (dadosValidos) {
            const { tipoRota } = this.state;
            let icone = tipoRota == "2" ? iconeBarco : iconeOnibus;

            this.setState({
                mostrarDica: false,
                iconeVeiculo: icone,
            });
            // this.onStepPress(1)
            this.swipe.scrollBy(1);
        } else {
            Alert.alert("Erro", msgErro, [{ text: "OK" }]);
        }
    };

    render() {
        const { idTelaAtual, mostrarDica } = this.state;
        const { vetorPosicoes } = this.props;

        return (
            <PaperProvider theme={this.props.theme}>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                    <Appbar.Content title="SETE" subtitle="Gerar Rota usando o GPS" />
                </Appbar.Header>
                <View style={styles.screenContainer}>
                    <View style={styles.stepIndicator}>
                        <StepIndicator
                            stepCount={3}
                            customStyles={StepConfig.stepStyleOptions}
                            currentPosition={idTelaAtual}
                            onPress={this.onStepPress}
                            renderStepIndicator={this.renderStepIndicator}
                            labels={["Descrição", "Rastreamento", "Salvar"]}
                        />
                    </View>
                    <Banner
                        style={styles.bannerStyle}
                        visible={mostrarDica}
                        actions={[
                            {
                                label: "Esconder dica",
                                onPress: () => this.setState({ mostrarDica: false }),
                            },
                        ]}
                    >
                        Informe os dados básicos da rota. Não se preocupe, você poderá alterá-los posteriormente.
                    </Banner>
                    <Swiper
                        style={{ flexGrow: 1 }}
                        loop={false}
                        ref={(swipe) => {
                            this.swipe = swipe;
                        }}
                        index={idTelaAtual}
                        autoplay={false}
                        showsPagination={false}
                        scrollEnabled={false}
                        onIndexChanged={(page) => {
                            this.setState({ idTelaAtual: page });
                        }}
                        removeClippedSubviews={false}
                    >
                        {this.basicInputScreen()}
                        {this.routeScreen(vetorPosicoes)}
                        {this.saveScreen()}
                    </Swiper>
                </View>
            </PaperProvider>
        );
    }

    basicInputScreen() {
        return (
            <ScrollView style={styles.tabScrollContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.txtInput}
                        autoCorrect={false}
                        label="Nome da Rota"
                        placeholder="Exemplo: Rota Gávea-Bueno"
                        returnKeyType="next"
                        mode="outlined"
                        value={this.state.nomeRota}
                        onChangeText={(nomeRota) => this.setState({ nomeRota })}
                    />

                    <View style={styles.inputInsideContainer}>
                        <Text style={styles.labelPicker}>Selecione o tipo da rota:</Text>
                        <RadioButton.Group onValueChange={(value) => this.setState({ tipoRota: value })} value={this.state.tipoRota} uncheckedColor="red">
                            <RadioButton.Item mode="android" label="Rodoviário" value="1" color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item mode="android" label="Aquaviário" value="2" color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item mode="android" label="Mista" value="3" color={this.props.theme.colors.primary} uncheckedColor="gray" />
                        </RadioButton.Group>
                    </View>

                    <View style={styles.inputInsideContainer}>
                        <Text style={styles.labelPicker}>Marque o horário de funcionamento:</Text>
                        <Checkbox.Item
                            mode="android"
                            label="Manhã"
                            status={this.state.funcionaManha ? "checked" : "unchecked"}
                            color={this.props.theme.colors.primary}
                            onPress={() => {
                                this.setState({ funcionaManha: !this.state.funcionaManha });
                            }}
                        />
                        <Checkbox.Item
                            mode="android"
                            label="Tarde"
                            color={this.props.theme.colors.primary}
                            status={this.state.funcionaTarde ? "checked" : "unchecked"}
                            onPress={() => {
                                this.setState({ funcionaTarde: !this.state.funcionaTarde });
                            }}
                        />
                        <Checkbox.Item
                            mode="android"
                            label="Noite"
                            color={this.props.theme.colors.primary}
                            status={this.state.funcionaNoite ? "checked" : "unchecked"}
                            onPress={() => {
                                this.setState({ funcionaNoite: !this.state.funcionaNoite });
                            }}
                        />
                    </View>
                    <Button style={styles.buttonProx} mode="contained" onPress={() => this.goToTrackingPage()}>
                        Ir para o rastreamento
                    </Button>
                </View>
            </ScrollView>
        );
    }

    async componentDidUpdate(prevProps, prevState) {
        try {
            const { vetorPosicoes } = this.props;
            let { region } = this.state;
            let novaRegion = { ...region };
            if (prevProps.vetorPosicoes !== vetorPosicoes) {
                let locationLength = vetorPosicoes?.length;
                if (locationLength > 0) {
                    novaRegion.latitude = Number(vetorPosicoes[locationLength - 1].latitude);
                    novaRegion.longitude = Number(vetorPosicoes[locationLength - 1].longitude);
                    this.setState({
                        region: novaRegion,
                    });
                }
            }
        } catch (err) {
            console.log(err);
            Alert.alert("Atenção!", err.toString());
        }
    }

    routeScreen(vetorPosicoes) {
        return (
            <View style={styles.page}>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.mapElement}
                        region={this.state.region}
                        mapType="hybrid"
                        showsUserLocation
                        showsMyLocationButton
                        loadingEnabled
                        showsCompass
                        showsScale
                    >
                        <Marker coordinate={this.state.region}>
                            <Image source={this.state.iconeVeiculo} style={{ width: 48, height: 48 }} resizeMode="contain" />
                        </Marker>

                        <Polyline coordinates={vetorPosicoes} strokeColor="white" strokeWidth={8} zIndex={10} />
                    </MapView>
                </View>
                <View style={styles.buttonContainer}>
                    {!this.state.comecouRota ? (
                        <Button onPress={() => this.iniciarRastreamento()} mode="contained" compact>
                            Começar a rastrear
                        </Button>
                    ) : (
                        <Button onPress={async () => await this.handleStopRecordingPress()} mode="contained" compact>
                            Parar de rastrear
                        </Button>
                    )}
                </View>
            </View>
        );
    }

    saveScreen() {
        const { terminouOperacao, terminouOperacaoComErro } = this.props;

        if (!terminouOperacao) {
            return (
                <View style={styles.infoContainer}>
                    <ActivityIndicator animating={true} color={Colors.orange500} size={100} style={styles.loadingIndicator} />
                    <Text style={styles.loadingHeadlineBold}>Aguarde um minutinho...</Text>
                    <Text style={styles.infoText}>Enviando os dados da rota para o sistema SETE</Text>
                </View>
            );
        } else {
            if (terminouOperacaoComErro) {
                return (
                    <View style={styles.infoContainer}>
                        <IconButton icon="close" color={Colors.red500} size={100} />
                        <Text style={styles.infoHeadlineBold}>Ocorreu um erro ao salvar a rota</Text>
                        <Paragraph style={styles.infoText}>
                            Apesar de ter ocorrido um erro, o aplicativo também salva a rota traçada como um arquivo GPX no seu celular. Para salvar o arquivo,
                            basta clicar no botão abaixo e encaminhar para o seu e-mail. Posteriormente, importe o arquivo no sistema SETE desktop.
                        </Paragraph>
                        <Button style={styles.buttonProx} mode="contained" onPress={() => Sharing.shareAsync(this.state.gpxFile)}>
                            Salvar o arquivo da rota
                        </Button>
                    </View>
                );
            } else {
                return (
                    <View style={styles.infoContainer}>
                        <IconButton icon="check-bold" color={Colors.green500} size={100} />
                        <Text style={styles.infoHeadlineBold}>Dados enviados com sucesso!</Text>
                        <Button style={styles.buttonProx} mode="contained" onPress={() => this.props.navigation.goBack()}>
                            Retornar ao painel
                        </Button>
                    </View>
                );
            }
        }
    }
}

// Mapeamento redux
const mapDispatchProps = (dispatch) => {
    return bindActionCreators(
        {
            dbLimparAcoes,
            dbSalvar,
            locLimparRastreamento,
            locComecarRastreamento,
            locAtualizarPosicao,
            locPararRastreamento,
        },
        dispatch
    );
};

const mapStateToProps = (store) => ({
    vetorPosicoes: store.localizacao.vetorPosicoes,
    terminouOperacao: store.db.terminouOperacao,
    terminouOperacaoNaInternet: store.db.terminouOperacaoNaInternet,
    terminouOperacaoNoCache: store.db.terminouOperacaoNoCache,
    terminouOperacaoComErro: store.db.terminouOperacaoComErro,
    db: store.db.dados,
});

export default connect(mapStateToProps, mapDispatchProps)(withTheme(RotasTracarScreen));
