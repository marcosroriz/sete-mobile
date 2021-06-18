/**
 * AlunosMapScreen
 * Tela que mostra a posição dos alunos no app.
 */

// Basic React Imports
import React, { Component } from "react"

// Redux Store
import { connect } from "react-redux"

// Widgets
import { Animated, Easing, Image, View } from 'react-native';
import {
    Avatar, ActivityIndicator, Appbar, Button, Card, Chip, Colors, DataTable, Divider, FAB, IconButton,
    List, Text, TextInput, Title, Paragraph, Provider as PaperProvider
} from 'react-native-paper';
import { withTheme } from 'react-native-paper';

// Style
import styles from "./style"

// Map
import MapView from "react-native-map-clustering";
import { Callout, CalloutSubview, Geojson, Marker } from "react-native-maps";
const iconeAluno = require("../../../assets/aluno-marker.png");
const iconeEscola = require("../../../assets/escola-marker.png");

// Turf
import * as turf from '@turf/turf'

// Estamos no IOS?
const isIOS = Platform.OS === 'ios';

// Função para pegar mediana
const median = arr => {
    const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};


export class AlunosMapScreen extends Component {
    state = {
        // Variáveis relacionados aos dados dos alunos
        finalizouCarregamentoDados: false,
        alunos: [],
        region: {},

        // Variávies relacionados ao PAINEL dos alunos
        mostraInfoAluno: false,
        infoAluno: {},

        // Variável que controla a animação
        animY: new Animated.Value(0)
    }

    async componentDidMount() {
        const { dbData } = this.props;

        let alunosData = [];

        // Posiciona o mapa na localização mediana dos estudantes
        let alunosLatData = []
        let alunosLonData = [];

        // Carregamento inicial dos dados dos alunos
        dbData.alunos.forEach(a => {
            if (a.LOC_LATITUDE != null && a.LOC_LATITUDE != "" && a.LOC_LONGITUDE != null && a.LOC_LONGITUDE != "") {
                let data = Object.assign({}, a)
                data.latitude = a.LOC_LATITUDE;
                data.longitude = a.LOC_LONGITUDE;

                // Qual o turno do aluno?
                switch (Number(a.TURNO)) {
                    case 1:
                        data.turno = "Turno da Manhã (Matutino)"
                        break;
                    case 2:
                        data.turno = "Turno da Tarde (Vespertino)";
                        break;
                    case 3:
                        data.turno = "Turno da Integral"
                        break;
                    case 4:
                        date.turno = "Turno da Noite (Noturno)"
                        break;
                    default:
                        data.turno = "Turno da Manhã (Matutino)"
                        break;
                }

                // Enriquece os dados com as infos das escolas e rotas
                // Assume inicialmente que não tem nenhuma rota e nenhuma escola alocada
                let idEscola = dbData.escolatemalunos.filter((rel) => rel.ID_ALUNO == a.ID)
                data.escolaNome = "Escola: não informada";
                data.escolaAlocada = false;
                data.escolaTemGPS = false;

                if (idEscola.length > 0) {
                    let escola = dbData.escolas.filter((rel) => String(rel.ID) == idEscola[0].ID_ESCOLA)[0];
                    data.escolaAlocada = true;
                    data.escolaNome = escola.NOME;
                    if (escola.LOC_LATITUDE != null && escola.LOC_LATITUDE != "" &&
                        escola.LOC_LONGITUDE != null && escola.LOC_LONGITUDE != "") {
                        data.escolaTemGPS = true;
                        data.escolaLatitude = Number(escola.LOC_LATITUDE);
                        data.escolaLongitude = Number(escola.LOC_LONGITUDE);
                    }
                }

                // Mesmo racioncínio para rotas
                let idRota = dbData.rotaatendealuno.filter((rel) => rel.ID_ALUNO == a.ID)
                data.rotaNome = "Rota: não informada";
                data.rotaKM = "Não informado";
                data.rotaTipo = "Rodoviário";
                data.rotaAlocada = false;
                data.rotaTemGPS = false;

                if (idRota.length > 0) {
                    let rota = dbData.rotas.filter((rel) => String(rel.ID) == idRota[0].ID_ROTA)[0];
                    data.rotaAlocada = true;
                    data.rotaNome = rota.NOME;

                    if (rota.SHAPE != undefined && rota.SHAPE != "") {
                        try {
                            let rotaGeoJSON = turf.toWgs84(JSON.parse(rota.SHAPE));
                            data.rotaTemGPS = true;
                            data.rotaGeoJSON = rotaGeoJSON;
                            data.subRotaGeoJSON = rotaGeoJSON;
                        } catch (error) {
                            console.log("ALUNOSMAPSCREEN :: ERROR :: PARSING SHAPE", rota.SHAPE)
                        }
                    }

                    // TODO: Fazer distancia da loc atual até a escola
                    if (rota.KM) {
                        data.rotaKM = "Rota tem " + rota.KM + " km";
                    }

                    // Por padrão, assume que é rodoviário, ou seja, sse for == 2 que será aquaviário
                    if (rota.TIPO == 2 || rota.TIPO == "2") {
                        data.rotaTipo = "Aquaviário";
                    }
                }

                // Coloca nos arrays de estado                
                alunosLatData.push(Number(data.LOC_LATITUDE));
                alunosLonData.push(Number(data.LOC_LONGITUDE));

                alunosData.push(data);


            }
        })

        let avgLatitude, avgLongitude;

        if (alunosData.length != 0) {
            avgLatitude = median(alunosLatData);
            avgLongitude = median(alunosLonData);
        } else {
            Alert.alert("Erro!", "Nenhum aluno georeferenciado", [
                {
                    text: "OK",
                    onPress: () => { this.props.navigation.goBack(); }
                }
            ]);
        }

        this.setState({
            region: {
                latitude: avgLatitude,
                longitude: avgLongitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
            },
            alunos: alunosData,
        }, () => this.setState({ finalizouCarregamentoDados: true }));
    }

    toggleInfo(mostraInfoAluno = false, infoAluno = {}) {
        let toValue = mostraInfoAluno ? -320 : 320;
        Animated.spring(
            this.state.animY,
            {
                toValue,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true

            }
        ).start();

        if (mostraInfoAluno) {
            this.setState({ mostraInfoAluno, infoAluno })
        } else {
            this.setState({ mostraInfoAluno })
        }

    }

    render() {
        const { finalizouCarregamentoDados, alunos, mostraInfoAluno, infoAluno } = this.state;
        if (!finalizouCarregamentoDados) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator animating={true} color={Colors.orange500} size={100}
                        style={styles.loadingIndicator} />
                    <Text>
                        Mapeando os alunos...
                    </Text>
                    <Divider />
                </View>
            )
        } else {
            return (
                <PaperProvider theme={this.props.theme}>
                    <Appbar.Header style={styles.headerBar}>
                        <Appbar.BackAction
                            onPress={() => this.props.navigation.goBack()}
                        />
                        <Appbar.Content
                            title="SETE"
                            subtitle={"Mapa de Alunos"}
                        />
                    </Appbar.Header>
                    <View style={styles.container}>
                        <View style={styles.mapContainer} >
                            <MapView
                                ref={map => { this.map = map }}
                                style={styles.mapElement}
                                initialRegion={this.state.region}
                                mapType="hybrid"
                                clusterColor="orange"
                                clusteringEnabled={true}
                                showsUserLocation
                                showsMyLocationButton
                                loadingEnabled
                                showsCompass
                                showsScale
                            >
                                {alunos.map((aluno, idx) =>
                                    <Marker
                                        key={aluno.ID}
                                        coordinate={{
                                            "latitude": Number(aluno.LOC_LATITUDE),
                                            "longitude": Number(aluno.LOC_LONGITUDE)
                                        }}
                                        onPress={() => this.toggleInfo(true, aluno)}
                                    >
                                        <Image
                                            source={iconeAluno}
                                            style={{ width: 48, height: 48 }}
                                            resizeMode="contain"
                                        />
                                    </Marker>
                                )}
                                {infoAluno.rotaTemGPS ? (
                                    <Geojson
                                        geojson={infoAluno.rotaGeoJSON}
                                        strokeColor="white"
                                        fillColor="white"
                                        strokeWidth={10}
                                    />
                                ) : null}
                                {infoAluno.rotaTemGPS ? (
                                    <Geojson
                                        geojson={infoAluno.rotaGeoJSON}
                                        strokeColor="gray"
                                        fillColor="white"
                                        strokeWidth={5}
                                    />
                                ) : null}

                                {infoAluno.rotaTemGPS && infoAluno.rotaGeoJSON != infoAluno.subRotaGeoJSON &&
                                    infoAluno.subRotaGeoJSON != undefined && infoAluno.subRotaGeoJSON != null ? (
                                    <Geojson
                                        geojson={infoAluno.subRotaGeoJSON}
                                        strokeColor="orange"
                                        fillColor="white"
                                        strokeWidth={5}
                                    />
                                ) : null}

                                {infoAluno.escolaTemGPS ? (
                                    <Marker
                                        coordinate={{
                                            "latitude": infoAluno.escolaLatitude,
                                            "longitude": infoAluno.escolaLongitude
                                        }}
                                    >
                                        <Image
                                            source={iconeEscola}
                                            style={{ width: 48, height: 48 }}
                                            resizeMode="contain"
                                        />
                                    </Marker>

                                ) : null}
                            </MapView>
                            <Animated.View style={[
                                {
                                    position: "absolute",
                                    bottom: -320,
                                    // height: 300,
                                    width: "100%",
                                    backgroundColor: "#FFFFFF",
                                },
                                {
                                    transform: [{ translateY: this.state.animY }]
                                }
                            ]}
                            >
                                {mostraInfoAluno ?
                                    (
                                        <Card style={styles.moreMapInfoContainer}>
                                            <Card.Title
                                                title={infoAluno.NOME}
                                                right={(props) => (
                                                    <IconButton {...props} icon="close-circle" color="red" size={36} onPress={() => { this.toggleInfo(false) }} />
                                                )}
                                            />
                                            <Card.Content>
                                                <List.Item
                                                    style={styles.moreMapInfoList}
                                                    left={(props) => <List.Icon {...props}
                                                        icon={infoAluno.rotaTipo == "Rodoviário" ? "bus" : "boat"} />}
                                                    title={infoAluno.rotaNome}
                                                />
                                                {/* <List.Item
                                                    style={styles.moreMapInfoList}
                                                    left={(props) => <List.Icon {...props} icon="map-marker-path" />}
                                                    title={infoAluno.rotaKM}
                                                /> */}
                                                <List.Item
                                                    style={styles.moreMapInfoList}
                                                    left={(props) => <List.Icon {...props} icon="school" />}
                                                    title={infoAluno.escolaNome}
                                                />
                                                {/* <List.Item
                                                    style={styles.moreMapInfoList}
                                                    left={(props) => <List.Icon {...props} icon="lead-pencil" />}
                                                    title={infoAluno.escolaNome}
                                                /> */}
                                                <List.Item
                                                    style={styles.moreMapInfoList}
                                                    left={(props) => <List.Icon {...props} icon="account-clock" />}
                                                    title={infoAluno.turno}
                                                />
                                                <View style={styles.moreMapInfoButtonsContainer}>
                                                    <Button style={styles.moreMapInfoButtons}
                                                        mode="contained"
                                                        onPress={() => {
                                                            let ponto = turf.point([infoAluno.longitude, infoAluno.latitude]);
                                                            // let primeiroPonto = turf.point(infoAluno.rotaGeoJSON.features[0].geometry.coordinates[0]);
                                                            let ultPontoIndex = infoAluno.rotaGeoJSON.features[0].geometry.coordinates.length;
                                                            let ultimoPonto = turf.point(infoAluno.rotaGeoJSON.features[0].geometry.coordinates[ultPontoIndex - 1]);

                                                            let line = turf.lineString(infoAluno.rotaGeoJSON.features[0].geometry.coordinates);
                                                            let nearest = turf.nearestPointOnLine(line, ponto);
                                                            let subline = turf.lineSlice(ponto, ultimoPonto, line);
                                                            // console.log("DISTANCE SUBLINE", turf.length(subline))
                                                            // console.log("DISTANCE LINE", turf.length(line))
                                                            let k = []
                                                            for (let i = 0; i < subline.geometry.coordinates.length; i++) {
                                                                k.push([subline.geometry.coordinates[i][0], subline.geometry.coordinates[i][1]])
                                                            }

                                                            let subRota = {
                                                                type: 'FeatureCollection',
                                                                features: [
                                                                    {
                                                                        type: 'Feature',
                                                                        properties: {},
                                                                        geometry: {
                                                                            type: 'LineString',
                                                                            coordinates: k
                                                                        }
                                                                    }
                                                                ]
                                                            };

                                                            this.setState({ infoAluno: { ...infoAluno, ...{ subRotaGeoJSON: subRota } } })
                                                        }}>
                                                        Ver Rota
                                                    </Button>
                                                    <Button style={styles.moreMapInfoButtons}
                                                        mode="contained"
                                                        onPress={() => {
                                                            this.props.navigation.navigate("EditAlunoScreen", {
                                                                targetData: infoAluno,
                                                                isEditing: true,
                                                                screenSubTitle: "Alunos",
                                                            })
                                                        }}>
                                                        Editar Aluno
                                                    </Button>
                                                </View>
                                            </Card.Content>
                                        </Card>
                                    ) : null}
                            </Animated.View>
                            {/* <FAB
                                icon="filter-outline"
                                label="Escolas"
                                style={styles.mapFilterFAB}
                                onPress={() => { }}
                                visible={true}
                            /> */}
                        </View>
                    </View>
                </PaperProvider >
            )
        }
    }
}

const mapStateToProps = (store) => ({
    dbData: store.dbState.data
})

export default connect(mapStateToProps, null)(withTheme(AlunosMapScreen))

