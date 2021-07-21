/**
 * AlunosGeoreferenciarScreen.js
 *
 * Esta tela possibilita que o usuário geoferencie a posição do aluno.
 * Para tal, é necessário que a localização (GPS) do dispositivo esteja habilitada.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React, { Component } from "react";

// Redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { dbClearAction, dbSaveAction } from "../../redux/actions/dbCRUDAction";

// Widgets básicos
import { Alert, Image, Platform, ScrollView, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Card, Colors, Dialog, Divider, FAB, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import { withTheme } from "react-native-paper";

// Style
import styles from "./style";

// Location
import * as Location from "expo-location";

// Mapa
import MapView, { Marker } from "react-native-maps";
const iconeAluno = require("../../../assets/aluno-marker.png");
const iconeEscola = require("../../../assets/escola-marker.png");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// CONFIGURAÇÕES E VARIÁVEIS //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Variável lógica que indica se estamos no IOS
const isIOS = Platform.OS === "ios";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENTES ////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class AlunosGeoreferenciarScreen extends Component {
    // Estado
    state = {
        // Dados
        ID: null,
        nomeAluno: "",
        nomeEscola: "",
        obteveGPS: false,
        alunoTemGPS: false,
        escolaTemGPS: false,

        // Variáveis do georeferenciamento
        gpsHabilitado: true,
        posAluno: {
            latitude: "",
            longitude: "",
        },
        posEscola: {
            latitude: "",
            longitude: "",
        },
        regiaoMapa: {
            latitude: -16.6782432,
            longitude: -49.2530005,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
        },

        // Salvando
        iniciouSalvamento: false,
    };

    componentDidMount() {
        // Limpa as ações prévias no redux
        this.props.dbClearAction();

        // Preenchimento dos dados
        const { route, dbData } = this.props;
        const { targetData } = route.params;

        // Reconstroi dados
        this.parseDados(targetData, dbData);

        // Obtem localizacao
        this.obtemLocalizacao();
    }

    // Parse dados
    parseDados(targetData, dbData) {
        if (targetData) {
            let aluno = {};

            if (targetData["ID"]) aluno.ID = targetData["ID"];
            if (targetData["NOME"]) aluno.nomeAluno = targetData["NOME"];

            if (targetData["LOC_LATITUDE"] && targetData["LOC_LONGITUDE"]) {
                aluno.alunoTemGPS = true;
                aluno.posAluno = {
                    latitude: Number(targetData["LOC_LATITUDE"]),
                    longitude: Number(targetData["LOC_LONGITUDE"]),
                };
                aluno.regiaoMapa = {
                    latitude: Number(targetData["LOC_LATITUDE"]),
                    longitude: Number(targetData["LOC_LONGITUDE"]),
                    latitudeDelta: 0.00922,
                    longitudeDelta: 0.00421,
                };
            }

            // Pega dados da escola
            let idEscola = dbData.escolatemalunos.filter((rel) => rel.ID_ALUNO == targetData.ID);
            if (idEscola.length > 0) {
                let escolaArray = dbData.escolas.filter((rel) => String(rel.ID) == idEscola[0].ID_ESCOLA);

                if (
                    escolaArray[0]["LOC_LATITUDE"] != null &&
                    escolaArray[0]["LOC_LATITUDE"] != "" &&
                    escolaArray[0]["LOC_LONGITUDE"] != null &&
                    escolaArray[0]["LOC_LONGITUDE"] != ""
                ) {
                    aluno.nomeEscola = escolaArray[0]["NOME"];
                    aluno.escolaTemGPS = true;
                    aluno.posEscola = {
                        latitude: Number(escolaArray[0].LOC_LATITUDE),
                        longitude: Number(escolaArray[0].LOC_LONGITUDE),
                    };
                } else {
                    aluno.escolaTemGPS = false;
                }
            }

            this.setState(aluno);
        }
    }

    // Pede a localização do usuário
    async obtemLocalizacao() {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            // TODO: Redirecionar o usuário para a tela anterior
            this.setState({ gpsHabilitado: false });
        } else {
            let localizacaoParams = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            this.setState({
                obteveGPS: true,
                region: {
                    latitude: localizacaoParams.coords.latitude,
                    longitude: localizacaoParams.coords.longitude,
                    latitudeDelta: 0.00922,
                    longitudeDelta: 0.00421,
                },
            });

            let coordenadas = [
                {
                    latitude: localizacaoParams.coords.latitude,
                    longitude: localizacaoParams.coords.longitude,
                },
            ];

            if (this.state.alunoTemGPS) {
                coordenadas.push({
                    latitude: this.state.posAluno.latitude,
                    longitude: this.state.posAluno.longitude,
                });
            }

            if (this.state.escolaTemGPS) {
                coordenadas.push({
                    latitude: this.state.posEscola.latitude,
                    longitude: this.state.posEscola.longitude,
                });
            }
            if (coordenadas.length > 1) {
                this.map.fitToCoordinates(coordenadas, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                });
            }
        }
    }

    renderMapa(nomeAluno) {
        return (
            <View style={styles.mapContainer}>
                <Card style={styles.subHeader}>
                    <Card.Title title={nomeAluno} />
                </Card>

                <MapView
                    ref={(map) => {
                        this.map = map;
                    }}
                    style={styles.mapElement}
                    initialRegion={this.state.region}
                    mapType="hybrid"
                    onPress={(geoEvent) => {
                        this.setState({
                            posAluno: geoEvent.nativeEvent.coordinate,
                            alunoTemGPS: true,
                        });
                    }}
                    showsUserLocation
                    showsMyLocationButton
                    loadingEnabled
                    showsCompass
                    showsScale
                >
                    {this.state.escolaTemGPS ? (
                        <Marker coordinate={this.state.posEscola}>
                            <Image source={iconeEscola} style={{ width: 48, height: 48 }} resizeMode="contain" />
                        </Marker>
                    ) : null}
                    {this.state.alunoTemGPS ? (
                        <Marker
                            coordinate={this.state.posAluno}
                            draggable
                            onDragEnd={(geoEvent) => this.setState({ posAluno: geoEvent.nativeEvent.coordinate })}
                        >
                            <Image source={iconeAluno} style={{ width: 48, height: 48 }} resizeMode="contain" />
                        </Marker>
                    ) : null}
                </MapView>
            </View>
        );
    }

    renderBotoes() {
        return (
            <>
                <FAB
                    icon="cancel"
                    small
                    label="Cancelar"
                    color="white"
                    style={styles.fabCancel}
                    onPress={() => {
                        this.cancelar();
                    }}
                />

                <FAB
                    icon="send"
                    small
                    label="Salvar"
                    style={styles.fabSave}
                    onPress={() => {
                        this.salvar();
                    }}
                />
            </>
        );
    }

    renderDialogos(finishedOperation, iniciouSalvamento) {
        if (finishedOperation && iniciouSalvamento) {
            return (
                <Portal>
                    <Dialog visible={true} onDismiss={() => this.props.navigation.navigate("DashboardScreen")}>
                        <Dialog.Title>Posição salva com sucesso</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>Os dados foram salvos no sistema SETE</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => this.props.navigation.navigate("DashboardScreen")}>Retornar ao menu</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            );
        } else {
            return (
                <Portal>
                    <Dialog visible={this.state.iniciouSalvamento} dismissable={false}>
                        <Dialog.Title>Salvando</Dialog.Title>
                        <Dialog.Content>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <ActivityIndicator color={Colors.orange500} size={isIOS ? "large" : 48} style={{ marginRight: 16 }} />
                                <Paragraph>Enviando dados.....</Paragraph>
                            </View>
                        </Dialog.Content>
                    </Dialog>
                </Portal>
            );
        }
    }

    render() {
        const { finishedOperation } = this.props;
        const { iniciouSalvamento, nomeAluno, obteveGPS } = this.state;

        if (!obteveGPS) {
            // Renderiza tela indicando carregamento do GPS
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator animating={true} color={Colors.orange500} size={100} style={styles.loadingIndicator} />
                    <Text>Aguarde</Text>
                    <Text style={styles.loadingTitle}>Obtendo o sinal de GPS...</Text>
                    <Divider />
                </View>
            );
        } else {
            // Renderiza Mapa
            return (
                <PaperProvider theme={this.props.theme}>
                    <Appbar.Header style={styles.headerBar}>
                        <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                        <Appbar.Content title="SETE" subtitle="Georeferenciar Aluno" />
                    </Appbar.Header>
                    <View style={styles.container}>
                        {this.renderMapa(nomeAluno)}
                        {this.renderBotoes()}
                        {this.renderDialogos(finishedOperation, iniciouSalvamento)}
                    </View>
                </PaperProvider>
            );
        }
    }

    cancelar() {
        Alert.alert("Cancelar edição?", "Você tem certeza que deseja cancelar as alterações? Se sim, nenhuma alteração será realizada.", [
            {
                text: "Não, voltar a editar"
            },
            {
                text: "Sim, cancelar",
                onPress: () => this.props.navigation.goBack(),
                style: "cancel",
            },
        ]);
    }

    salvar() {
        Alert.alert("Salvar posição?", "Você tem certeza que deseja enviar as alterações?", [
            {
                text: "Não, voltar a editar"
            },
            {
                text: "Sim, salvar",
                onPress: () => {
                    this.setState({
                        iniciouSalvamento: true,
                    });

                    let saveActions = [
                        {
                            collection: "alunos",
                            id: this.state.ID,
                            payload: {
                                LOC_LATITUDE: this.state.posAluno.latitude,
                                LOC_LONGITUDE: this.state.posAluno.longitude,
                            },
                        },
                    ];

                    this.props.dbSaveAction(saveActions);
                },
                style: "cancel",
            },
        ]);
    }
}

// Mapeamento redux
const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    dbData: store.dbState.data,
    finishedOperation: store.dbState.finishedOperation,
    errorOcurred: store.dbState.errorOcurred,
});

const mapDispatchProps = (dispatch) => bindActionCreators({ dbClearAction: dbClearAction, dbSaveAction: dbSaveAction }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(withTheme(AlunosGeoreferenciarScreen));
