/**
 * AlunosMapScreen
 * Tela que mostra a posição dos alunos no app.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React, { Component } from "react";

// Redux
import { connect } from "react-redux";

// Widgets
import { Alert, Animated, Easing, Image, ScrollView, View } from "react-native";
// prettier-ignore
import {
    ActivityIndicator, Appbar, Button, Card,  Colors, Dialog, Divider, FAB, IconButton,
    List, Text, Title, Portal, Provider as PaperProvider, RadioButton
} from 'react-native-paper';
import { withTheme } from "react-native-paper";

// Style
import styles from "./style";

// Map
import MapView from "react-native-map-clustering";
import { Geojson, Marker } from "react-native-maps";
const iconeAluno = require("../../../assets/aluno-marker.png");
const iconeEscola = require("../../../assets/escola-marker.png");

// Location
import * as Location from "expo-location";

// Turf
import * as turf from "@turf/turf";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// CONFIGURAÇÕES E VARIÁVEIS //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Função para pegar mediana
const median = (arr) => {
    const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENTES ////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class AlunosMapScreen extends Component {
    state = {
        // Variáveis relacionados aos dados dos alunos
        finalizouCarregamentoDados: false,
        finalizouCarregamentoComErro: false,
        alunos: [],
        region: {},

        // Variávies relacionados ao PAINEL dos alunos
        mostraInfoAluno: false,
        infoAlunoSelecionado: {},

        // Variável que controla a animação
        animY: new Animated.Value(0),

        // Variável que controla a ref ao mapa
        mapRef: React.createRef(),

        // Variáveis relacioandas aos filtros
        escolas: [],
        turnos: [],
        idEscolaSelecionada: "",
        idTurnoSelecionado: "",
        mostraFiltroEscola: false,
        mostraFiltroTurno: false,
    };

    async loadData() {
        const { db } = this.props;

        let alunosData = [];

        // Posiciona o mapa na localização mediana dos estudantes
        let alunosLatData = [];
        let alunosLonData = [];

        // Carregamento inicial dos dados dos alunos
        db.alunos.forEach((a) => {
            if (a.LOC_LATITUDE != null && a.LOC_LATITUDE != "" && a.LOC_LONGITUDE != null && a.LOC_LONGITUDE != "") {
                let data = Object.assign({}, a);
                data.latitude = a.LOC_LATITUDE;
                data.longitude = a.LOC_LONGITUDE;

                // Qual o turno do aluno?
                switch (Number(a.TURNO)) {
                    case 1:
                        data.turno = "Turno da Manhã (Matutino)";
                        break;
                    case 2:
                        data.turno = "Turno da Tarde (Vespertino)";
                        break;
                    case 3:
                        data.turno = "Turno Integral";
                        break;
                    case 4:
                        data.turno = "Turno da Noite (Noturno)";
                        break;
                    default:
                        data.turno = "Turno da Manhã (Matutino)";
                        break;
                }

                // Enriquece os dados com as infos das escolas e rotas
                // Assume inicialmente que não tem nenhuma rota e nenhuma escola alocada
                let idEscola = db.escolatemalunos.filter((rel) => rel.ID_ALUNO == a.ID);
                data.escolaNome = "Escola: não informada";
                data.escolaAlocada = false;
                data.escolaTemGPS = false;

                if (idEscola.length > 0) {
                    let escola = db.escolas.filter((rel) => String(rel.ID) == idEscola[0].ID_ESCOLA)[0];
                    data.escolaAlocada = true;
                    data.escolaNome = escola.NOME;
                    data.escolaID = escola.ID;

                    if (escola.LOC_LATITUDE != null && escola.LOC_LATITUDE != "" && escola.LOC_LONGITUDE != null && escola.LOC_LONGITUDE != "") {
                        data.escolaTemGPS = true;
                        data.escolaLatitude = Number(escola.LOC_LATITUDE);
                        data.escolaLongitude = Number(escola.LOC_LONGITUDE);
                    }
                }

                // Mesmo raciocínio para rotas
                let idRota = db.rotaatendealuno.filter((rel) => rel.ID_ALUNO == a.ID);
                data.rotaNome = "Rota: não informada";
                data.rotaKM = "KM não informada";
                data.rotaTipo = "Rodoviário";
                data.rotaAlocada = false;
                data.rotaTemGPS = false;

                if (idRota.length > 0) {
                    let rota = db.rotas.filter((rel) => String(rel.ID) == idRota[0].ID_ROTA)[0];
                    data.rota = rota;
                    data.rotaAlocada = true;
                    data.rotaNome = rota.NOME;

                    // Por padrão, assume que é rodoviário, ou seja, sse for == 2 que será aquaviário
                    if (rota.TIPO == 2 || rota.TIPO == "2") {
                        data.rotaTipo = "Aquaviário";
                    }

                    // KM da Rota
                    if (rota.KM) {
                        data.rotaKM = "Rota tem " + rota.KM + " km";
                    }

                    // GPS da Rota
                    if (rota.SHAPE != undefined && rota.SHAPE != "") {
                        data.rotaTemGPS = true;
                    }
                }
                // Coloca nos arrays de estado
                alunosLatData.push(Number(data.LOC_LATITUDE));
                alunosLonData.push(Number(data.LOC_LONGITUDE));
                alunosData.push(data);
            }
        });

        if (alunosData.length == 0) {
            Alert.alert("Erro!", "Nenhum aluno georeferenciado.", [
                {
                    text: "OK!",
                    onPress: () => this.props.navigation.goBack(),
                    style: "cancel",
                },
            ]);
        } else {
            // Centraliza o mapa na latitude e longitude média
            let avgLatitude, avgLongitude;

            if (alunosData.length != 0) {
                avgLatitude = median(alunosLatData);
                avgLongitude = median(alunosLonData);
            } else {
                Alert.alert("Erro!", "Nenhum aluno georeferenciado", [
                    {
                        text: "OK",
                        onPress: () => {
                            this.props.navigation.goBack();
                        },
                    },
                ]);
            }

            // Carregament dos filtros de escolas
            let escolasArray = [{ label: "Todas as escolas", value: "" }];
            db.escolas.forEach((e) => {
                if (e.LOC_LATITUDE != null && e.LOC_LATITUDE != "" && e.LOC_LONGITUDE != null && e.LOC_LONGITUDE != "") {
                    escolasArray.push({
                        label: e.NOME,
                        value: e.ID,
                        temGPS: true,
                        latitude: e.LOC_LATITUDE,
                        longitude: e.LOC_LONGITUDE,
                    });
                } else {
                    escolasArray.push({
                        label: e.NOME,
                        value: e.ID,
                        temGPS: false,
                    });
                }
            });

            // Carregament dos filtros por turno
            let turnosArray = [
                { label: "Todos os turnos", value: "" },
                { label: "Turno da Manhã (Matutino)", value: 1 },
                { label: "Turno da Tarde (Vespertino)", value: 2 },
                { label: "Turno da Noite (Noturno)", value: 4 },
                { label: "Turno Integral", value: 3 },
            ];

            // Posicionamento do mapa
            this.setState(
                {
                    alunos: alunosData,
                    escolas: escolasArray,
                    turnos: turnosArray,
                    region: {
                        latitude: avgLatitude,
                        longitude: avgLongitude,
                        latitudeDelta: 0.5,
                        longitudeDelta: 0.5,
                    },
                },
                () => {
                    this.setState({ finalizouCarregamentoDados: true });
                }
            );
        }
    }

    async componentDidMount() {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Erro!", "O uso do GPS não está liberado", [
                {
                    text: "OK",
                    onPress: () => {
                        this.props.navigation.goBack();
                    },
                },
            ]);
        } else {
            Location.getLastKnownPositionAsync().then((params) => {
                if (params) {
                    this.setState({
                        region: {
                            latitude: params.coords.latitude,
                            longitude: params.coords.longitude,
                            latitudeDelta: 0.00922,
                            longitudeDelta: 0.00421,
                        },
                    });
                }

                this.loadData();
            });
        }
    }

    enriqueceDado(aluno) {
        let alunoInfo = { ...aluno };

        // GPS da Rota
        if (alunoInfo.rotaTemGPS) {
            let rota = alunoInfo.rota;
            try {
                let rotaGeoJSON = turf.toWgs84(JSON.parse(rota.SHAPE));
                alunoInfo.rotaGeoJSON = rotaGeoJSON;
                alunoInfo.subRotaGeoJSON = rotaGeoJSON;

                // Percurso Aluno
                let pontoAluno = turf.point([alunoInfo.longitude, alunoInfo.latitude]);
                let ultPontoIndex = rotaGeoJSON.features[0].geometry.coordinates.length;
                let ultimoPonto = turf.point(rotaGeoJSON.features[0].geometry.coordinates[ultPontoIndex - 1]);
                let line = turf.lineString(rotaGeoJSON.features[0].geometry.coordinates);
                let percursoAluno = turf.lineSlice(pontoAluno, ultimoPonto, line);
                alunoInfo.rotaKM = "Dist. percorrida: " + Number(turf.length(percursoAluno)).toFixed(1) + " km / " + rota.KM + " km";
                alunoInfo.percursoKM = Number(turf.length(percursoAluno)).toFixed(1);

                let pontosPercursoAluno = [];
                for (let i = 0; i < percursoAluno.geometry.coordinates.length; i++) {
                    pontosPercursoAluno.push([percursoAluno.geometry.coordinates[i][0], percursoAluno.geometry.coordinates[i][1]]);
                }

                let subRota = {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "LineString",
                                coordinates: pontosPercursoAluno,
                            },
                        },
                    ],
                };

                alunoInfo.subRotaGeoJSON = subRota;
            } catch (error) {
                console.error("ALUNOSMAPSCREEN :: ERROR :: PARSING SHAPE", error);
            }
        }
        return alunoInfo;
    }

    toggleInfo(mostraInfoAluno = false, dadoAluno = {}) {
        let toValue = mostraInfoAluno ? -320 : 320;
        Animated.spring(this.state.animY, {
            toValue,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();

        if (mostraInfoAluno) {
            let infoAlunoSelecionado = this.enriqueceDado(dadoAluno);
            this.setState({ mostraInfoAluno, infoAlunoSelecionado });
        } else {
            this.setState({ mostraInfoAluno });
        }
    }

    renderAlunos(alunos, filtroEscola, filtroTurno) {
        let alunosFiltrados = filtroEscola == "" ? alunos : alunos.filter((a) => a.escolaID == filtroEscola);
        alunosFiltrados = filtroTurno == "" ? alunosFiltrados : alunosFiltrados.filter((a) => a.TURNO == filtroTurno);

        if (alunosFiltrados.length == 0) {
            let msg = "Os alunos desta escola ainda não foram georeferenciados";
            if (filtroEscola != "") {
                msg = "Os alunos deste turno ainda não foram georeferenciados";
            }

            Alert.alert("Ops!", msg, [
                {
                    text: "Remover filtro",
                    onPress: () => {
                        this.setState({
                            idEscolaSelecionada: "",
                            idTurnoSelecionado: "",
                        });
                    },
                },
            ]);
        }

        return alunosFiltrados.map((aluno, idx) => {
            let alunoPos = {
                latitude: Number(aluno.LOC_LATITUDE),
                longitude: Number(aluno.LOC_LONGITUDE),
            };

            let fitPos = [alunoPos];
            fitPos.push({
                latitude: Number(aluno.LOC_LATITUDE) - 0.0001,
                longitude: Number(aluno.LOC_LONGITUDE),
            });

            return (
                <Marker
                    key={aluno.ID}
                    coordinate={alunoPos}
                    onPress={() => {
                        this.state.mapRef.current.fitToCoordinates(fitPos, {
                            edgePadding: {
                                top: 100,
                                left: 100,
                                right: 100,
                                bottom: 500,
                            },
                        });
                        this.toggleInfo(true, aluno);
                    }}
                >
                    <Image source={iconeAluno} style={{ width: 48, height: 48 }} resizeMode="contain" />
                </Marker>
            );
        });
    }

    renderRota(infoAluno) {
        if (infoAluno != {} && infoAluno.rotaTemGPS) {
            return (
                <>
                    <Geojson geojson={infoAluno.rotaGeoJSON} strokeColor="white" fillColor="white" strokeWidth={10} />
                    <Geojson geojson={infoAluno.rotaGeoJSON} strokeColor="gray" fillColor="white" strokeWidth={5} />
                </>
            );
        } else {
            return null;
        }
    }

    renderSubRota(infoAluno) {
        if (
            infoAluno != {} &&
            infoAluno.rotaTemGPS &&
            infoAluno.rotaGeoJSON != infoAluno.subRotaGeoJSON &&
            infoAluno.subRotaGeoJSON != undefined &&
            infoAluno.subRotaGeoJSON != null
        ) {
            return <Geojson geojson={infoAluno.subRotaGeoJSON} strokeColor="orange" fillColor="white" strokeWidth={5} />;
        } else {
            return null;
        }
    }

    renderEscola(infoAluno) {
        if (infoAluno.escolaTemGPS) {
            return (
                <Marker
                    coordinate={{
                        latitude: infoAluno.escolaLatitude,
                        longitude: infoAluno.escolaLongitude,
                    }}
                >
                    <Image source={iconeEscola} style={{ width: 48, height: 48 }} resizeMode="contain" />
                </Marker>
            );
        } else {
            return null;
        }
    }

    render() {
        const {
            finalizouCarregamentoDados,
            alunos,
            escolas,
            turnos,
            infoAlunoSelecionado,
            mostraInfoAluno,
            animY,
            idEscolaSelecionada,
            idTurnoSelecionado,
            mostraFiltroEscola,
            mostraFiltroTurno,
        } = this.state;

        if (!finalizouCarregamentoDados) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator animating={true} color={Colors.orange500} size={100} style={styles.loadingIndicator} />
                    <Text style={{ fontWeight: "bold", fontSize: 20 }}>Mapeando os alunos...</Text>
                    <Divider />
                </View>
            );
        } else {
            return (
                <PaperProvider theme={this.props.theme}>
                    <Appbar.Header style={styles.headerBar}>
                        <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                        <Appbar.Content title="SETE" subtitle={"Mapa de Alunos"} />
                    </Appbar.Header>
                    <View style={styles.container}>
                        <View style={styles.mapContainer}>
                            <MapView
                                ref={this.state.mapRef}
                                style={styles.mapElement}
                                initialRegion={this.state.region}
                                mapType="hybrid"
                                // minPoints={5}
                                // radius={100}
                                maxZoom={18}
                                clusterColor="orange"
                                clusteringEnabled={true}
                                // spiralEnabled={false}
                                showsUserLocation
                                showsMyLocationButton
                                loadingEnabled
                                showsCompass
                                showsScale
                            >
                                {this.renderAlunos(alunos, idEscolaSelecionada, idTurnoSelecionado)}
                                {this.renderRota(infoAlunoSelecionado)}
                                {this.renderSubRota(infoAlunoSelecionado)}
                                {this.renderEscola(infoAlunoSelecionado)}
                            </MapView>
                            <Animated.View style={[styles.moreInfoWrapper, { transform: [{ translateY: animY }] }]}>
                                {mostraInfoAluno ? (
                                    <Card style={styles.moreMapInfoContainer}>
                                        <Card.Title
                                            title={infoAlunoSelecionado.NOME}
                                            right={(props) => (
                                                <IconButton
                                                    {...props}
                                                    icon="close-circle"
                                                    color="red"
                                                    size={36}
                                                    onPress={() => {
                                                        this.toggleInfo(false);
                                                    }}
                                                />
                                            )}
                                        />
                                        <Card.Content>
                                            <List.Item
                                                style={styles.moreMapInfoList}
                                                left={(props) => <List.Icon {...props} icon={infoAlunoSelecionado.rotaTipo == "Rodoviário" ? "bus" : "boat"} />}
                                                title={infoAlunoSelecionado.rotaNome}
                                            />
                                            <List.Item
                                                style={styles.moreMapInfoList}
                                                left={(props) => <List.Icon {...props} icon="map-marker-path" />}
                                                title={infoAlunoSelecionado.rotaKM}
                                            />
                                            <List.Item
                                                style={styles.moreMapInfoList}
                                                left={(props) => <List.Icon {...props} icon="school" />}
                                                title={infoAlunoSelecionado.escolaNome}
                                            />
                                            <List.Item
                                                style={styles.moreMapInfoList}
                                                left={(props) => <List.Icon {...props} icon="account-clock" />}
                                                title={infoAlunoSelecionado.turno}
                                            />
                                            <View style={styles.moreMapInfoButtonsContainer}>
                                                {/* <Button
                                                    style={styles.moreMapInfoButtons}
                                                    mode="contained"
                                                    onPress={() => {
                                                        this.props.navigation.navigate("AlunosEdicaoScreen", {
                                                            dadoAlvo: infoAlunoSelecionado,
                                                            estaEditando: false,
                                                            subtitulo: "Alunos",
                                                        });
                                                    }}
                                                >
                                                    Ver Aluno
                                                </Button> */}
                                                <Button
                                                    style={styles.moreMapInfoButtons}
                                                    mode="contained"
                                                    onPress={() => {
                                                        this.props.navigation.navigate("AlunosEdicaoScreen", {
                                                            dadoAlvo: infoAlunoSelecionado,
                                                            estaEditando: true,
                                                            subtitulo: "Alunos",
                                                        });
                                                    }}
                                                >
                                                    Editar Aluno
                                                </Button>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                ) : null}
                            </Animated.View>
                            <FAB
                                icon="filter-outline"
                                label="Escolas"
                                style={styles.mapFilterFAB}
                                onPress={() => {
                                    this.setState({ mostraFiltroEscola: true });
                                }}
                                visible={escolas.length > 0}
                            />
                            <FAB
                                icon="filter-outline"
                                label="Turnos"
                                style={styles.mapSecondFilterFAB}
                                onPress={() => {
                                    this.setState({ mostraFiltroTurno: true });
                                }}
                                visible={true}
                            />
                            <Portal>
                                <Dialog visible={mostraFiltroEscola} onDismiss={() => this.setState({ mostraFiltroEscola: false })}>
                                    <Dialog.ScrollArea>
                                        <ScrollView contentContainerStyle={styles.dialogContainer}>
                                            <Title>Mostrar alunos de quais escola?</Title>
                                            <RadioButton.Group
                                                onValueChange={(value) =>
                                                    this.setState({
                                                        infoAlunoSelecionado: {},
                                                        idEscolaSelecionada: value,
                                                        idTurnoSelecionado: "",
                                                        mostraFiltroEscola: false,
                                                        mostraInfoAluno: false,
                                                    })
                                                }
                                                value={idEscolaSelecionada}
                                                uncheckedColor="red"
                                            >
                                                {escolas.map((escola, idescola) => (
                                                    <RadioButton.Item
                                                        mode="android"
                                                        key={escola.value}
                                                        label={escola.label}
                                                        value={escola.value}
                                                        color={this.props.theme.colors.primary}
                                                        uncheckedColor="gray"
                                                    />
                                                ))}
                                            </RadioButton.Group>
                                        </ScrollView>
                                    </Dialog.ScrollArea>
                                </Dialog>

                                <Dialog visible={mostraFiltroTurno} onDismiss={() => this.setState({ mostraFiltroTurno: false })}>
                                    <Dialog.ScrollArea>
                                        <ScrollView contentContainerStyle={styles.dialogContainer}>
                                            <Title>Mostrar alunos de quais turnos?</Title>
                                            <RadioButton.Group
                                                onValueChange={(value) =>
                                                    this.setState({
                                                        infoAlunoSelecionado: {},
                                                        idEscolaSelecionada: "",
                                                        idTurnoSelecionado: value,
                                                        mostraFiltroTurno: false,
                                                        mostraFiltroEscola: false,
                                                        mostraInfoAluno: false,
                                                    })
                                                }
                                                value={idTurnoSelecionado}
                                                uncheckedColor="red"
                                            >
                                                {turnos.map((turno, idturno) => (
                                                    <RadioButton.Item
                                                        mode="android"
                                                        key={turno.value}
                                                        label={turno.label}
                                                        value={turno.value}
                                                        color={this.props.theme.colors.primary}
                                                        uncheckedColor="gray"
                                                    />
                                                ))}
                                            </RadioButton.Group>
                                        </ScrollView>
                                    </Dialog.ScrollArea>
                                </Dialog>
                            </Portal>
                        </View>
                    </View>
                </PaperProvider>
            );
        }
    }
}

// Mapeamento redux
const mapStateToProps = (store) => ({
    db: store.db.dados,
});

export default connect(mapStateToProps, null)(withTheme(AlunosMapScreen));
