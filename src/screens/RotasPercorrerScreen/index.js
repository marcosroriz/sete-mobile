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
import { Alert, Image, Modal, Platform, StatusBar, Text, View } from "react-native";
import { Appbar, Button, FAB, RadioButton, TextInput, Provider as PaperProvider } from "react-native-paper";
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

// Ícones
const iconeOnibus = require("../../../assets/onibus.png");
const iconeBarco = require("../../../assets/barco.png");
const iconeComeco = require("../../../assets/inicio.png");
const iconeAluno = require("../../../assets/aluno-marker.png");
const iconeEscola = require("../../../assets/escola-marker.png");
const iconeAlertaGenerico = require("../../../assets/alertagenerico-marker.png");
const iconeViaInterditada = require("../../../assets/barrera-marker.png");
const iconeProbMecanico = require("../../../assets/probmecanico-marker.png");

// Variável lógica que indica se estamos no IOS
const isIOS = Platform.OS === "ios";

// Variável que identifica a rota a ser rastreada
let rotaDados = {};

// Nome e código da task responsável por obter a posição do usuário em background
const LOCATION_BG_TASK = "background-location-task";

TaskManager.defineTask(LOCATION_BG_TASK, async ({ data, error }) => {
    if (error) {
        console.error(error);
    }
    if (data && data.locations.length > 0) {
        processaDadosLocalizacao([data.locations[0].coords]);
    }
});

// Método que processa os dados enviados pelo usuário
function processaDadosLocalizacao(coordenadas) {
    if (coordenadas && rotaDados) {
        store.dispatch(locAtualizarPosicao(coordenadas));

        let operacaoSalvar = [
            {
                collection: "viagenspercurso",
                id: rotaDados.ID,
                payload: rotaDados,
            },
        ];
        store.dispatch(dbSalvar(operacaoSalvar, false));
    }
}

// Método que processa os dados de alerta enviados pelo usuário
function processaDadosAlerta(alerta) {
    let operacaoSalvar = [
        {
            collection: "viagensalertas",
            payload: {
                VIAGEM_ID: rotaDados.ID,
                DATA_OCORRENCIA: alerta.data,
                TIPO_ALERTA: alerta.tipo,
                MENSAGEM: alerta.msgProblema,
                LOC_LATITUDE: alerta.posicao.latitude,
                LOC_LONGITUDE: alerta.posicao.longitude,
            },
        },
    ];
    store.dispatch(dbSalvar(operacaoSalvar, false));
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENTES ////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class RotasPercorrerScreen extends React.Component {
    // Rota
    nomeRota = "";
    nomeMotorista = "";

    // GeoJSON
    geojsonRota = {};
    primeiraPosicaoDaRota = [];
    ultimaPosicaoDaRota = [];

    // Alunos
    alunosArray = [];

    // Escolas
    escolasArray = [];

    // Ícones
    iconeVeiculo = iconeOnibus;

    // GPS
    accuracy = 0.001;
    ultLatitudeUsuario = 0;
    ultLongitudeUsuario = 0;
    temPermissaoLocBackground = false;
    monitorPosicao;

    state = {
        idViagem: null,
        dataInicio: null,
        dataFinal: null,

        temRotaGeojson: false,
        coordenadasDaRota: [],
        comecouRota: false,

        // Problemas
        problemasRelatados: [],

        // Tela
        telaProblemaEstaAberta: false,
        botaoGrupoEstaAberto: false,
        radioOptions: "",
        strDescricaoProblema: "",
    };

    constructor(props) {
        super(props);
        this.parseDados = this.parseDados.bind(this);
    }

    animateCamera({ latitude, longitude, heading = 0, altitude = 300, pitch = 45, zoom = 16 }) {
        if (this.mapRef !== null && this.mapRef !== undefined)
            this.mapRef.animateCamera({
                center: { latitude, longitude },
                pitch,
                heading: 0,
                zoom,
                altitude,
            });
    }

    parseDados(dadoAlvo, usuario, db) {
        // Dados básicos da Rota
        this.nomeRota = dadoAlvo["NOME"];
        this.nomeMotorista = usuario["NOME"];

        // Ícone do veículo
        this.iconeVeiculo = Number(dadoAlvo["TIPO"]) == 1 ? iconeOnibus : iconeBarco;

        // GeoJSON
        this.geojsonRota = turf.toWgs84(JSON.parse(dadoAlvo["SHAPE"]));
        this.primeiraPosicaoDaRota = this.getPrimeiraPosicaoRota();
        this.ultimaPosicaoDaRota = this.getUltimaPosicaoRota();
        this.setState({
            coordenadasDaRota: [...this.getGeojsonCoords()],
            temRotaGeojson: true,
        });

        // Alunos
        let idAlunos = db.rotaatendealuno.filter((rel) => rel.ID_ROTA == dadoAlvo.ID);
        if (idAlunos.length > 0) {
            idAlunos.forEach((relAlunoRota) =>
                db.alunos.filter((aluno) => {
                    let idAlunoIgual = relAlunoRota["ID_ALUNO"] == aluno["ID"];
                    let possuiLatitude = aluno["LOC_LATITUDE"] != null && aluno["LOC_LATITUDE"] != "";
                    let possuiLongitude = aluno["LOC_LONGITUDE"] != null && aluno["LOC_LONGITUDE"] != "";

                    if (idAlunoIgual && possuiLatitude && possuiLongitude) {
                        this.alunosArray.push(aluno);
                    }
                })
            );
        }

        // Escolas
        let idEscolas = db.rotapassaporescolas.filter((rel) => rel.ID_ROTA == dadoAlvo.ID);
        if (idEscolas.length > 0) {
            idEscolas.forEach((relEscolaRota) =>
                db.escolas.filter((escola) => {
                    let idEscolaIgual = relEscolaRota["ID_ESCOLA"] == escola["ID"];
                    let possuiLatitude = escola["LOC_LATITUDE"] != null && escola["LOC_LATITUDE"] != "";
                    let possuiLongitude = escola["LOC_LONGITUDE"] != null && escola["LOC_LONGITUDE"] != "";

                    if (idEscolaIgual && possuiLatitude && possuiLongitude) {
                        this.escolasArray.push(escola);
                    }
                })
            );
        }
    }

    async componentDidMount() {
        try {
            const { db, usuario } = this.props;
            const { dadoAlvo } = this.props.route.params;

            // Primeiro limpamos todas as rotas pendentes, caso possua
            this.props.dbLimparAcoes();

            // Depois fazemos o parse de dados
            this.parseDados(dadoAlvo, usuario, db);

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
            if (this.monitorPosicao != null) {
                await this.monitorPosicao.remove();
            }
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        try {
            const { vetorPosicoes } = this.props;

            if (prevProps.vetorPosicoes !== vetorPosicoes) {
                const [ultLatituteRota, ultLongitudeRota] = this.ultimaPosicaoDaRota;
                let tamanhoRotaPercorrida = vetorPosicoes?.length;
                if (tamanhoRotaPercorrida > 0) {
                    rotaDados.COORDENADAS = [...vetorPosicoes];
                    rotaDados.DATA_ATUAL = new Date().toISOString();

                    let i = tamanhoRotaPercorrida - 1;
                    this.ultLatitudeUsuario = vetorPosicoes[i].latitude;
                    this.ultLongitudeUsuario = vetorPosicoes[i].longitude;
                    this.animateCamera(vetorPosicoes[i]);

                    this.filterRoute({
                        latitude: this.ultLatitudeUsuario,
                        longitude: this.ultLongitudeUsuario,
                    });
                    if (
                        LineHelper.checkIfInAccuracyRange({
                            comparedValue: this.ultLatitudeUsuario,
                            baseValue: ultLatituteRota,
                            accuracy: this.accuracy,
                        }) &&
                        LineHelper.checkIfInAccuracyRange({
                            comparedValue: this.ultLongitudeUsuario,
                            baseValue: ultLongitudeRota,
                            accuracy: this.accuracy,
                        })
                    ) {
                        // await this.stopRouteFollow();
                        this.abrirTelaPararRastreamento();
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
        rotaDados.IS_IN_ROUTE = isInRoute;
        console.log("IS_IN_ROUTE", isInRoute);
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

    abrirTelaRelatarProblema() {
        this.setState({ telaProblemaEstaAberta: true });
    }

    async iniciarRastreamento() {
        try {
            this.props.locComecarRastreamento();

            let data = new Date();
            let idV = this.nomeRota + "__" + data.toISOString();

            if (rotaDados) {
                rotaDados.ID = idV;
                rotaDados.DATA_INICIO = data.toISOString();
                rotaDados.DATA_ATUAL = data.toISOString();
                rotaDados.DATA_FINAL = data.toISOString();
                rotaDados.FINALIZOU = false;
                rotaDados.NOME_ROTA = this.nomeRota;
                rotaDados.NOME_MOTORISTA = this.nomeMotorista;
                rotaDados.COORDENADAS = [];
            }

            this.setState({
                dataInicio: data.getTime(),
                idViagem: idV,
            });

            if (this.temPermissaoLocBackground) {
                let taskRegistrada = await TaskManager.isTaskRegisteredAsync(LOCATION_BG_TASK);
                if (taskRegistrada) {
                    await TaskManager.unregisterAllTasksAsync(LOCATION_BG_TASK);
                }

                await Location.startLocationUpdatesAsync(LOCATION_BG_TASK, {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 1000,
                    distanceInterval: 1,
                    showsBackgroundLocationIndicator: true,
                    foregroundService: {
                        notificationTitle: "SETE Rota",
                        notificationBody: "Georeferenciando...",
                        notificationColor: "#FF7B00",
                    },
                });
            } else {
                this.monitorPosicao = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Highest,
                        timeInterval: 1000,
                        distanceInterval: 1,
                    },
                    ({ coords }) => {
                        processaDadosLocalizacao([coords]);
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
                await TaskManager.unregisterAllTasksAsync(LOCATION_BG_TASK);
            } else {
                await this.monitorPosicao.remove();
            }
            const totalTime = (Date.now() - this.state.dataInicio) / 1000;

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

            // Dispacha uma ação para parar de rastrear
            store.dispatch(locPararRastreamento());

            // Envia os dados par ao servidor
            rotaDados.FINALIZOU = true;
            rotaDados.DATA_FINAL = new Date().toISOString();
            let operacaoSalvar = [
                {
                    collection: "viagenspercurso",
                    id: rotaDados.ID,
                    payload: rotaDados,
                },
            ];
            store.dispatch(dbSalvar(operacaoSalvar));

            this.setState({ comecouRota: false });
        } catch (err) {
            Alert.alert("Atenção!", err.toString());
        }
    }

    abrirTelaPararRastreamento() {
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
        const { botaoGrupoEstaAberto, comecouRota, problemasRelatados, telaProblemaEstaAberta, temRotaGeojson } = this.state;
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
                        {temRotaGeojson ? <Geojson geojson={this.geojsonRota} strokeColor="orange" fillColor="white" strokeWidth={10} zIndex={1} /> : null}
                        {temRotaGeojson ? (
                            <Marker
                                key={"COMECODAROTA"}
                                coordinate={{
                                    latitude: Number(this.primeiraPosicaoDaRota[0]),
                                    longitude: Number(this.primeiraPosicaoDaRota[1]),
                                }}
                            >
                                <Image source={iconeComeco} style={{ width: 48, height: 48 }} resizeMode="contain" />
                            </Marker>
                        ) : null}

                        {this.alunosArray?.length > 0
                            ? this.alunosArray.map((aluno) => (
                                  <Marker
                                      key={aluno.ID}
                                      title={aluno.NOME}
                                      coordinate={{
                                          latitude: Number(aluno.LOC_LATITUDE),
                                          longitude: Number(aluno.LOC_LONGITUDE),
                                      }}
                                  >
                                      <Image source={iconeAluno} style={{ width: 48, height: 48 }} resizeMode="contain" />
                                  </Marker>
                              ))
                            : null}

                        {this.escolasArray?.length > 0
                            ? this.escolasArray.map((escola, idescola) => (
                                  <Marker
                                      key={escola.ID}
                                      title={escola.NOME}
                                      coordinate={{
                                          latitude: Number(escola.LOC_LATITUDE),
                                          longitude: Number(escola.LOC_LONGITUDE),
                                      }}
                                  >
                                      <Image source={iconeEscola} style={{ width: 48, height: 48 }} resizeMode="contain" />
                                  </Marker>
                              ))
                            : null}

                        {problemasRelatados.length > 0
                            ? problemasRelatados.map((problema, idx) => (
                                  <Marker key={"PROBLEMA_" + idx} coordinate={problema.posicao}>
                                      <Image source={problema.iconeAlerta} style={{ width: 48, height: 48 }} resizeMode="contain" />
                                  </Marker>
                              ))
                            : null}

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
                        visible={telaProblemaEstaAberta}
                        onRequestClose={() => this.setState({ telaProblemaEstaAberta: false })}
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
                                            telaProblemaEstaAberta: false,
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
                                    label="Via Interditada"
                                    value={1}
                                    color={this.props.theme.colors.primary}
                                    uncheckedColor="gray"
                                />
                                <RadioButton.Item
                                    mode="android"
                                    label="Problema Mecânico"
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
                                value={this.state.strDescricaoProblema}
                                onChangeText={(val) => this.setState({ strDescricaoProblema: val })}
                            />
                            <View style={{ flexDirection: "row" }}>
                                <Button
                                    style={styles.midButton}
                                    color="red"
                                    mode="contained"
                                    onPress={() =>
                                        this.setState({
                                            telaProblemaEstaAberta: false,
                                        })
                                    }
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    style={styles.midButton}
                                    color={this.props.theme.colors.primary}
                                    mode="contained"
                                    onPress={() => {
                                        if (this.state.radioOptions == "") {
                                            Alert.alert("Atenção!", "Escolha um dos motivos para o alerta.");
                                        } else {
                                            let tipo = this.state.radioOptions;
                                            let msgProblema = this.state.strDescricaoProblema;

                                            let iconeAlerta = iconeAlertaGenerico;
                                            if (tipo == 1) {
                                                iconeAlerta = iconeViaInterditada;
                                            } else if (tipo == 2) {
                                                iconeAlerta = iconeProbMecanico;
                                            }

                                            let novoProblema = {
                                                tipo,
                                                msgProblema,
                                                iconeAlerta,
                                                data: new Date().toISOString(),
                                                posicao: {
                                                    latitude: this.ultLatitudeUsuario,
                                                    longitude: this.ultLongitudeUsuario,
                                                },
                                            };

                                            processaDadosAlerta(novoProblema);

                                            this.setState({
                                                problemasRelatados: [...problemasRelatados, novoProblema],
                                                radioOptions: "",
                                                strDescricaoProblema: "",
                                                telaProblemaEstaAberta: false,
                                            });
                                            Alert.alert("Sucesso", "Alerta enviado com sucesso.");
                                        }
                                    }}
                                >
                                    Enviar
                                </Button>
                            </View>
                        </FormView>
                    </Modal>
                    {!comecouRota ? (
                        <View style={styles.startButtonContainer}>
                            <FAB
                                icon="navigation"
                                color="white"
                                label="Percorrer Rota"
                                style={styles.startButton}
                                onPress={async () => await this.iniciarRastreamento()}
                            />
                        </View>
                    ) : (
                        <FAB.Group
                            open={botaoGrupoEstaAberto}
                            fabStyle={{
                                backgroundColor: "#EA3535",
                            }}
                            icon={botaoGrupoEstaAberto ? "close" : "chat-alert-outline"}
                            actions={[
                                {
                                    icon: "map-marker-off",
                                    label: "Parar Rota",
                                    onPress: () => this.abrirTelaPararRastreamento(),
                                },
                                {
                                    icon: "engine-off",
                                    label: "Relatar Problema",
                                    onPress: () => this.abrirTelaRelatarProblema(),
                                    small: false,
                                },
                            ]}
                            onStateChange={() =>
                                this.setState({
                                    botaoGrupoEstaAberto: !botaoGrupoEstaAberto,
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
    usuario: store.usuario.usuarioAtual,
    vetorPosicoes: store.localizacao.vetorPosicoes,
    terminouOperacao: store.db.terminouOperacao,
    terminouOperacaoNaInternet: store.db.terminouOperacaoNaInternet,
    terminouOperacaoNoCache: store.db.terminouOperacaoNoCache,
    terminouOperacaoComErro: store.db.terminouOperacaoComErro,
    db: store.db.dados,
});

export default connect(mapStateToProps, mapDispatchProps)(withTheme(RotasPercorrerScreen));
