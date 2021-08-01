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
import { dbLimparAcoes, dbSalvar } from "../../redux/actions/db";

// Widgets básicos
import { Alert, Image, Platform, View } from "react-native";
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
        this.props.dbLimparAcoes();

        // Preenchimento dos dados
        const { route, db } = this.props;
        const { dadoAlvo } = route.params;

        // Reconstroi dados
        this.parseDados(dadoAlvo, db);

        // Obtem localizacao
        this.obtemLocalizacao();
    }

    // Parse dados
    parseDados(dadoAlvo, db) {
        if (dadoAlvo) {
            let aluno = {};

            if (dadoAlvo["ID"]) aluno.ID = dadoAlvo["ID"];
            if (dadoAlvo["NOME"]) aluno.nomeAluno = dadoAlvo["NOME"];

            if (dadoAlvo["LOC_LATITUDE"] && dadoAlvo["LOC_LONGITUDE"]) {
                aluno.alunoTemGPS = true;
                aluno.posAluno = {
                    latitude: Number(dadoAlvo["LOC_LATITUDE"]),
                    longitude: Number(dadoAlvo["LOC_LONGITUDE"]),
                };
                aluno.regiaoMapa = {
                    latitude: Number(dadoAlvo["LOC_LATITUDE"]),
                    longitude: Number(dadoAlvo["LOC_LONGITUDE"]),
                    latitudeDelta: 0.00922,
                    longitudeDelta: 0.00421,
                };
            }

            // Pega dados da escola
            let idEscola = db.escolatemalunos.filter((rel) => rel.ID_ALUNO == dadoAlvo.ID);
            if (idEscola.length > 0) {
                let escolaArray = db.escolas.filter((rel) => String(rel.ID) == idEscola[0].ID_ESCOLA);

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
            let localizacaoParams = await Location.getLastKnownPositionAsync({ maxAge: 30000 });

            if (localizacaoParams == null) {
                localizacaoParams = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            }

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

    renderDialogos(iniciouSalvamento, terminouOperacaoNaInternet, terminouOperacaoNoCache, terminouOperacaoComErro) {
        if (iniciouSalvamento && terminouOperacaoNaInternet && !terminouOperacaoComErro) {
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
        } else if (iniciouSalvamento && terminouOperacaoNoCache && !terminouOperacaoComErro) {
            return (
                <Portal>
                    <Dialog visible={true} onDismiss={() => this.props.navigation.navigate("DashboardScreen")}>
                        <Dialog.Title>Posição salva com sucesso (offline)</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>O dispositivo se encontra offline, mas os dados foram salvos com sucesso</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => this.props.navigation.navigate("DashboardScreen")}>Retornar ao menu</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            );
        } else if (terminouOperacaoComErro) {
            <Portal>
                <Dialog visible={true} onDismiss={() => this.props.navigation.navigate("DashboardScreen")}>
                    <Dialog.Title>Erro ao tentar salvar a posição.</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>Verifique se sua internet ou GPS está habilitado e tente novamente.</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => this.props.navigation.navigate("DashboardScreen")}>Retornar ao menu</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>;
        } else {
            return (
                <Portal>
                    <Dialog visible={iniciouSalvamento} dismissable={false}>
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
        const { terminouOperacaoNaInternet, terminouOperacaoNoCache, terminouOperacaoComErro } = this.props;
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
                        {this.renderDialogos(iniciouSalvamento, terminouOperacaoNaInternet, terminouOperacaoNoCache, terminouOperacaoComErro)}
                    </View>
                </PaperProvider>
            );
        }
    }

    cancelar() {
        Alert.alert("Cancelar edição?", "Você tem certeza que deseja cancelar as alterações? Se sim, nenhuma alteração será realizada.", [
            {
                text: "Não, voltar a editar",
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
                text: "Não, voltar a editar",
            },
            {
                text: "Sim, salvar",
                onPress: () => {
                    this.setState({
                        iniciouSalvamento: true,
                    });

                    let operacaoSalvar = [
                        {
                            collection: "alunos",
                            id: this.state.ID,
                            payload: {
                                LOC_LATITUDE: this.state.posAluno.latitude,
                                LOC_LONGITUDE: this.state.posAluno.longitude,
                            },
                        },
                    ];

                    this.props.dbSalvar(operacaoSalvar);
                },
                style: "cancel",
            },
        ]);
    }
}

// Mapeamento redux
const mapStateToProps = (store) => ({
    terminouOperacaoNaInternet: store.db.terminouOperacaoNaInternet,
    terminouOperacaoNoCache: store.db.terminouOperacaoNoCache,
    terminouOperacaoComErro: store.db.terminouOperacaoComErro,

    db: store.db.dados,
});

const mapDispatchProps = (dispatch) => bindActionCreators({ dbLimparAcoes, dbSalvar }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(withTheme(AlunosGeoreferenciarScreen));
