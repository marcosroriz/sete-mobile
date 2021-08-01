/**
 * AlunosEdicaoScreen.js
 *
 * Esta tela possibilita que o usuário edite dados do aluno.
 * O foco é nos dados obrigatórios e campos estratégicos (como posição no mapa).
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
import { ActivityIndicator, Alert, Image, Platform, ScrollView, View } from "react-native";
import { Appbar, Button, Colors, Dialog, FAB, Paragraph, Portal, Provider as PaperProvider, RadioButton, Text, TextInput } from "react-native-paper";
import { withTheme } from "react-native-paper";

// KeyboardAware (para evitar que tela tampe o teclado)
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Picker (para o usuário selecionar escola e rota)
import { Picker } from "react-native-woodpicker";
import { TextInputMask } from "react-native-masked-text";

// Swipe widgets (permite o usuário ir de uma aba para outra)
import { Tabs, TabScreen, useTabIndex, useTabNavigation } from "react-native-paper-tabs";

// Style
import styles from "./style";

// Localização
import * as Location from "expo-location";

// Widgets de Mapa
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

class AlunosEdicaoScreen extends Component {
    state = {
        // ID
        ID: null,

        // Dados pessoais
        nome: "",
        dataDeNascimento: "",
        sexo: "",
        nomeResponsavel: "",
        telefoneResponsavel: "",
        localizacaoAluno: "",
        turno: "",
        nivel: "",

        // Escola
        escolas: [],
        idDocumentoRelEscolaAluno: null,
        idEscolaAluno: {},
        escolaTemGPS: false,
        escolaLatitude: "",
        escolaLongitude: "",

        // Mostra data
        mostrarEscolhaDeData: false,

        // GPS ativo
        gpsAtivo: true,
        alunoTemLocalizacao: false,

        // Variáveis do georeferenciamento
        posAluno: {
            latitude: "",
            longitude: "",
        },
        region: {
            latitude: -16.6782432,
            longitude: -49.2530005,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
        },

        // Salvando
        iniciouSalvamento: false,

        // Variáveis (workaround)
        ignoraPrimeiraEntrada: true,
    };

    dateFormatter = new Intl.DateTimeFormat("pt");

    parseDadosAluno(dadoAlvo, db) {
        let dadosDoAluno = {};

        if (dadoAlvo["ID"]) dadosDoAluno.ID = dadoAlvo["ID"];
        if (dadoAlvo["NOME"]) dadosDoAluno.nome = dadoAlvo["NOME"];
        if (dadoAlvo["DATA_NASCIMENTO"]) dadosDoAluno.dataDeNascimento = dadoAlvo["DATA_NASCIMENTO"];
        if (dadoAlvo["SEXO"]) dadosDoAluno.sexo = dadoAlvo["SEXO"];
        if (dadoAlvo["NOME_RESPONSAVEL"]) dadosDoAluno.nomeResponsavel = dadoAlvo["NOME_RESPONSAVEL"];
        if (dadoAlvo["TELEFONE_RESPONSAVEL"]) dadosDoAluno.telefoneResponsavel = dadoAlvo["TELEFONE_RESPONSAVEL"];
        if (dadoAlvo["MEC_TP_LOCALIZACAO"]) dadosDoAluno.localizacaoAluno = dadoAlvo["MEC_TP_LOCALIZACAO"];

        if (dadoAlvo["TURNO"]) dadosDoAluno.turno = dadoAlvo["TURNO"];
        if (dadoAlvo["NIVEL"]) dadosDoAluno.nivel = dadoAlvo["NIVEL"];

        if (dadoAlvo["LOC_LATITUDE"] && dadoAlvo["LOC_LONGITUDE"]) {
            dadosDoAluno.region = {
                latitude: Number(dadoAlvo["LOC_LATITUDE"]),
                longitude: Number(dadoAlvo["LOC_LONGITUDE"]),
                latitudeDelta: 0.00922,
                longitudeDelta: 0.00421,
            };
            dadosDoAluno.alunoTemLocalizacao = true;
            dadosDoAluno.posAluno = {
                latitude: Number(dadoAlvo["LOC_LATITUDE"]),
                longitude: Number(dadoAlvo["LOC_LONGITUDE"]),
            };
        }

        let idEscola = db.escolatemalunos.filter((rel) => rel.ID_ALUNO == dadoAlvo.ID);
        let idRota = db.rotaatendealuno.filter((rel) => rel.ID_ALUNO == dadoAlvo.ID);

        if (idEscola.length > 0) {
            let escolaArray = db.escolas.filter((rel) => String(rel.ID) == idEscola[0].ID_ESCOLA);
            dadosDoAluno.idDocumentoRelEscolaAluno = idEscola[0].ID;
            dadosDoAluno.idEscolaAluno = { label: escolaArray[0].NOME, value: idEscola[0].ID_ESCOLA };

            if (
                escolaArray[0].LOC_LATITUDE != null &&
                escolaArray[0].LOC_LATITUDE != "" &&
                escolaArray[0].LOC_LONGITUDE != null &&
                escolaArray[0].LOC_LONGITUDE != ""
            ) {
                dadosDoAluno.escolaTemGPS = true;
                dadosDoAluno.escolaLatitude = Number(escolaArray[0].LOC_LATITUDE);
                dadosDoAluno.escolaLongitude = Number(escolaArray[0].LOC_LONGITUDE);
            } else {
                dadosDoAluno.escolaTemGPS = false;
            }
        }

        if (idRota.length > 0) {
            dadosDoAluno.idRotaAluno = idRota;
        }

        return dadosDoAluno;
    }

    async obtemLocalizacao() {
        let coordenadas = [];

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            // TODO: Redirecionar o usuário para a tela anterior
            this.setState({ gpsAtivo: false });
        } else {
            let localizacaoParams = await Location.getLastKnownPositionAsync({ maxAge: 30000 });

            if (localizacaoParams == null) {
                localizacaoParams = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            }

            this.setState({
                gpsAtivo: true,
                region: {
                    latitude: localizacaoParams.coords.latitude,
                    longitude: localizacaoParams.coords.longitude,
                    latitudeDelta: 0.00922,
                    longitudeDelta: 0.00421,
                },
            });

            coordenadas.push({
                latitude: localizacaoParams.coords.latitude,
                longitude: localizacaoParams.coords.longitude,
            });
        }

        if (this.state.alunoTemLocalizacao) {
            coordenadas.push({
                latitude: this.state.posAluno.latitude,
                longitude: this.state.posAluno.longitude,
            });
        }
        if (this.state.escolaTemGPS) {
            coordenadas.push({
                latitude: this.state.escolaLatitude,
                longitude: this.state.escolaLongitude,
            });
        }
        if (coordenadas.length > 1) {
            this.map.fitToCoordinates(coordenadas, {
                edgePadding: { top: 20, right: 20, bottom: 20, left: 20 },
            });
        }
    }

    componentDidMount() {
        // Limpa as ações
        this.props.dbLimparAcoes();

        // Preenchimento dos dados
        const { route, db } = this.props;
        const { dadoAlvo } = route.params;

        // Escolas
        let escolasArray = [{ label: "Escolher depois...", value: null }];
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
        this.setState({ escolas: escolasArray });

        // Reconstroi dado
        if (dadoAlvo) {
            this.setState(this.parseDadosAluno(dadoAlvo, db));
        }

        // Centraliza localização e coloca posição do aluno se tiver
        this.obtemLocalizacao();
    }

    subTelaDadosBasicos() {
        return (
            <KeyboardAwareScrollView style={styles.kbContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.txtInput}
                        autoCorrect={false}
                        label="Nome"
                        placeholder="Nome do discente"
                        returnKeyType="next"
                        mode="outlined"
                        value={this.state.nome}
                        selection={{ start: 0 }}
                        onChangeText={(nome) => this.setState({ nome })}
                    />
                    <View style={styles.inputInsideContainer}>
                        <Text style={styles.labelPicker}>Data de nascimento:</Text>
                        <TextInputMask
                            style={styles.rawTxtInput}
                            autoCorrect={false}
                            keyboardType="numeric"
                            label="Data de nascimento"
                            placeholder="DD/MM/YYYY"
                            returnKeyType="next"
                            mode="outlined"
                            type={"datetime"}
                            options={{
                                format: "DD/MM/YYYY",
                            }}
                            value={this.state.dataDeNascimento}
                            onChangeText={(text) => {
                                this.setState({
                                    dataDeNascimento: text,
                                });
                            }}
                        />
                    </View>
                    <View style={styles.inputInsideContainer}>
                        <Text style={styles.labelPicker}>Sexo do Aluno:</Text>
                        <RadioButton.Group onValueChange={(value) => this.setState({ sexo: value })} value={this.state.sexo} uncheckedColor="red">
                            <RadioButton.Item mode="android" label="Masculino" value={1} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item mode="android" label="Feminino" value={2} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item mode="android" label="Não Informado" value={3} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                        </RadioButton.Group>
                    </View>
                    <TextInput
                        style={styles.txtInput}
                        autoCorrect={false}
                        label="Nome do responsável"
                        placeholder="Nome do responsável"
                        returnKeyType="next"
                        mode="outlined"
                        value={this.state.nomeResponsavel}
                        selection={{ start: 0 }}
                        onChangeText={(nomeResponsavel) => this.setState({ nomeResponsavel })}
                    />
                    <View style={styles.inputInsideContainer}>
                        <Text style={styles.labelPicker}>Telefone do responsável:</Text>
                        <TextInputMask
                            style={styles.rawTxtInput}
                            autoCorrect={false}
                            keyboardType="numeric"
                            label="Telefone do responsável"
                            placeholder="(DD) NÚMERO"
                            returnKeyType="done"
                            mode="outlined"
                            type={"cel-phone"}
                            options={{
                                maskType: "BRL",
                                withDDD: true,
                                dddMask: "(99) ",
                            }}
                            value={this.state.telefoneResponsavel}
                            onChangeText={(text) => {
                                this.setState({
                                    telefoneResponsavel: text,
                                });
                            }}
                        />
                    </View>
                    <View style={styles.inputInsideContainer}>
                        <Text style={styles.labelPicker}>Localização do Aluno:</Text>
                        <RadioButton.Group
                            onValueChange={(value) => this.setState({ localizacaoAluno: value })}
                            value={this.state.localizacaoAluno}
                            uncheckedColor="red"
                        >
                            <RadioButton.Item mode="android" label="Urbana" value={1} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item mode="android" label="Rural" value={2} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                        </RadioButton.Group>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        );
    }

    subtelaDadosEscolares() {
        return (
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputInsideContainer}>
                        <Text style={styles.labelPicker}>Escola do aluno:</Text>
                        <Picker
                            containerStyle={styles.pickerContainer}
                            item={this.state.idEscolaAluno}
                            items={this.state.escolas}
                            doneButtonLabel="Escolher"
                            onItemChange={(idEscola, idx) => {
                                if (idEscola.value == null && this.state.ignoraPrimeiraEntrada) {
                                    this.setState({
                                        ignoraPrimeiraEntrada: false,
                                    });
                                } else {
                                    let coordenadas = [
                                        {
                                            latitude: this.state.region.latitude,
                                            longitude: this.state.region.longitude,
                                        },
                                    ];
                                    if (this.state.alunoTemLocalizacao) {
                                        coordenadas.push({
                                            latitude: this.state.posAluno.latitude,
                                            longitude: this.state.posAluno.longitude,
                                        });
                                    }
                                    if (idEscola.temGPS) {
                                        this.setState({
                                            idEscolaAluno: idEscola,
                                            escolaTemGPS: true,
                                            escolaLatitude: Number(idEscola.latitude),
                                            escolaLongitude: Number(idEscola.longitude),
                                        });

                                        coordenadas.push({
                                            latitude: Number(idEscola.latitude),
                                            longitude: Number(idEscola.longitude),
                                        });
                                    } else {
                                        this.setState({
                                            idEscolaAluno: idEscola,
                                            escolaTemGPS: false,
                                        });
                                    }

                                    if (coordenadas.length > 1) {
                                        this.map.fitToCoordinates(coordenadas, {
                                            edgePadding: { top: 20, right: 20, bottom: 20, left: 20 },
                                        });
                                    }
                                }
                            }}
                            title="Escola do aluno"
                            placeholder="Selecione uma escola"
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.labelPicker}>Turno:</Text>
                        <RadioButton.Group onValueChange={(value) => this.setState({ turno: value })} value={this.state.turno} uncheckedColor="red">
                            <RadioButton.Item mode="android" label="Manhã" value={1} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item
                                mode="android"
                                label="Tarde (Verspertino)"
                                value={2}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item mode="android" label="Integral" value={3} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item mode="android" label="Noite (Noturno)" value={4} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                        </RadioButton.Group>
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.labelPicker}>Turno:</Text>
                        <RadioButton.Group onValueChange={(value) => this.setState({ nivel: value })} value={this.state.nivel} uncheckedColor="red">
                            <RadioButton.Item
                                mode="android"
                                label="Infantil (Pré-escolar)"
                                value={1}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item mode="android" label="Fundamental" value={2} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item mode="android" label="Médio" value={3} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item mode="android" label="Superior" value={4} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                            <RadioButton.Item mode="android" label="Outro" value={5} color={this.props.theme.colors.primary} uncheckedColor="gray" />
                        </RadioButton.Group>
                    </View>
                </View>
            </ScrollView>
            // </KeyboardAvoidingView >
        );
    }

    subtelaGPS() {
        return (
            <View style={styles.page}>
                <View style={styles.mapContainer}>
                    <MapView
                        ref={(map) => {
                            this.map = map;
                        }}
                        style={styles.map}
                        initialRegion={this.state.region}
                        mapType="hybrid"
                        onPress={(geoEvent) => {
                            // this.map.animateToRegion({
                            //     ...geoEvent.nativeEvent.coordinate,
                            //     latitudeDelta: 0.00922,
                            //     longitudeDelta: 0.00421
                            // })
                            this.setState({
                                posAluno: geoEvent.nativeEvent.coordinate,
                                alunoTemLocalizacao: true,
                            });
                        }}
                        showsUserLocation
                        showsMyLocationButton
                        loadingEnabled
                        showsCompass
                        showsScale
                    >
                        {this.state.escolaTemGPS ? (
                            <Marker
                                coordinate={{
                                    latitude: this.state.escolaLatitude,
                                    longitude: this.state.escolaLongitude,
                                }}
                            >
                                <Image source={iconeEscola} style={{ width: 48, height: 48 }} resizeMode="contain" />
                            </Marker>
                        ) : null}
                        {this.state.alunoTemLocalizacao ? (
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
            </View>
        );
    }

    renderDialogos(iniciouSalvamento, terminouOperacaoNaInternet, terminouOperacaoNoCache, terminouOperacaoComErro) {
        if (iniciouSalvamento && terminouOperacaoNaInternet && !terminouOperacaoComErro) {
            return (
                <Portal>
                    <Dialog visible={true} onDismiss={() => this.props.navigation.navigate("DashboardScreen")}>
                        <Dialog.Title>Aluno salvo com sucesso</Dialog.Title>
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
                        <Dialog.Title>Aluno salvo com sucesso (offline)</Dialog.Title>
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
                    <Dialog.Title>Erro ao tentar salvar os dados do aluno.</Dialog.Title>
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
        const { iniciouSalvamento } = this.state;

        return (
            <PaperProvider theme={this.props.theme}>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                    <Appbar.Content title="SETE" subtitle="Editar Aluno" />
                </Appbar.Header>
                <View style={styles.screenContainer}>
                    <Tabs
                        showTextLabel={true} // true/false | default=false (KEEP PROVIDING LABEL WE USE IT AS KEY INTERNALLY + SCREEN READERS)
                        iconPosition="top" // leading, top | default=leading
                        style={{
                            backgroundColor: "#fff",
                        }} // works the same as AppBar in react-native-paper
                        // dark={false} // works the same as AppBar in react-native-paper
                        // mode="scrollable" // fixed, scrollable | default=fixed
                        // onChangeIndex={(newIndex) => { }} // react on index change
                        showLeadingSpace={true} //  (default=true) show leading space in scrollable tabs inside the header
                    >
                        <TabScreen label="Dados" icon="account">
                            {this.subTelaDadosBasicos()}
                        </TabScreen>
                        <TabScreen label="Escola" icon="school">
                            {this.subtelaDadosEscolares()}
                        </TabScreen>
                        <TabScreen label="Posição" icon="map">
                            {this.subtelaGPS()}
                        </TabScreen>
                    </Tabs>
                    <FAB
                        icon="cancel"
                        small
                        label="Cancelar"
                        color="white"
                        style={styles.fabCancel}
                        onPress={() => {
                            this.cancelarEdicao();
                        }}
                    />

                    <FAB
                        style={styles.fabSave}
                        small
                        label="Salvar"
                        icon="send"
                        onPress={() => {
                            this.salvarEdicao();
                        }}
                    />

                    {this.renderDialogos(iniciouSalvamento, terminouOperacaoNaInternet, terminouOperacaoNoCache, terminouOperacaoComErro)}
                </View>
            </PaperProvider>
        );
    }

    cancelarEdicao() {
        Alert.alert("Cancelar edição?", "Você tem certeza que deseja cancelar as alterações? Se sim, nenhuma alteração será realizada.", [
            {
                text: "Não, voltar a editar",
                onPress: () => console.log("Continue"),
            },
            {
                text: "Sim, cancelar",
                onPress: () => this.props.navigation.goBack(),
                style: "cancel",
            },
        ]);
    }

    salvarEdicao() {
        Alert.alert("Salvar edição?", "Você tem certeza que deseja enviar as alterações?", [
            {
                text: "Não, voltar a editar",
                onPress: () => console.log("Continue"),
            },
            {
                text: "Sim, salvar",
                onPress: () => {
                    this.setState({
                        iniciouSalvamento: true,
                    });

                    let operacoes = [];

                    let alunoPayload = {
                        NOME: this.state.nome,
                        DATA_NASCIMENTO: this.state.dataDeNascimento,
                        NOME_RESPONSAVEL: this.state.nomeResponsavel,
                        TELEFONE_RESPONSAVEL: this.state.telefoneResponsavel,
                        SEXO: parseInt(this.state.sexo),
                        TURNO: parseInt(this.state.turno),
                        NIVEL: parseInt(this.state.nivel),
                    };

                    if (this.state.alunoTemLocalizacao) {
                        alunoPayload.LOC_LATITUDE = this.state.posAluno.latitude;
                        alunoPayload.LOC_LONGITUDE = this.state.posAluno.longitude;
                    }

                    operacoes.push({
                        collection: "alunos",
                        id: this.state.ID,
                        payload: alunoPayload,
                    });

                    if (this.state.idEscolaAluno != null && this.state.idEscolaAluno != {}) {
                        if (this.state.idDocumentoRelEscolaAluno) {
                            operacoes.push({
                                collection: "escolatemalunos",
                                id: this.state.idDocumentoRelEscolaAluno,
                                payload: {
                                    ID_ALUNO: this.state.ID,
                                    ID_ESCOLA: this.state.idEscolaAluno.value,
                                },
                            });
                        } else {
                            operacoes.push({
                                collection: "escolatemalunos",
                                id: null,
                                payload: {
                                    ID_ALUNO: this.state.ID,
                                    ID_ESCOLA: this.state.idEscolaAluno.value,
                                },
                            });
                        }
                    }

                    this.props.dbSalvar(operacoes);
                },
                style: "cancel",
            },
        ]);
    }
}

// Mapeamento redux
const mapStateToProps = (store) => ({
    db: store.db.dados,

    terminouOperacaoNaInternet: store.db.terminouOperacaoNaInternet,
    terminouOperacaoNoCache: store.db.terminouOperacaoNoCache,
    terminouOperacaoComErro: store.db.terminouOperacaoComErro,
});

const mapDispatchProps = (dispatch) => bindActionCreators({ dbLimparAcoes, dbSalvar }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(withTheme(AlunosEdicaoScreen));
