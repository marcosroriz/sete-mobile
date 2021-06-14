// Basic React Imports
import React, { Component } from "react"

// Redux Store
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { dbClearAction, dbSaveAction } from "../../redux/actions/dbCRUDAction"

// Basic Widgets
import { ActivityIndicator, Alert, KeyboardAvoidingView, Image, Platform, ScrollView, View } from "react-native";
import { Avatar, Appbar, Button, Colors, Dialog, FAB, Paragraph, Portal, Provider as PaperProvider, RadioButton, Text, TextInput } from 'react-native-paper';
import { withTheme } from 'react-native-paper';

// KeyboardAware
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


// Picker
// import RNPickerSelect from 'react-native-picker-select';
import { Picker } from 'react-native-woodpicker'
import { TextInputMask } from 'react-native-masked-text'
// import TextInputMask from 'react-native-text-input-mask';

// Swipe Widgets
import { Tabs, TabScreen, useTabIndex, useTabNavigation } from 'react-native-paper-tabs';

// Style
import styles from "./style";

// Location
import * as Location from "expo-location";

// Map
import MapView, { Geojson, Marker } from "react-native-maps";
const iconeAluno = require("../../../assets/aluno-marker.png");
const iconeEscola = require("../../../assets/escola-marker.png");

// Estamos no IOS?
const isIOS = Platform.OS === 'ios';

class EditAlunoScreen extends Component {
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
            longitudeDelta: 0.00421
        },

        // Salvando
        iniciouSalvamento: false,

        // Variáveis (workaround)
        firstPickIgnore: true
    };

    dateFormatter = new Intl.DateTimeFormat("pt");

    componentDidMount() {
        // Limpa as ações
        this.props.dbClearAction();

        // Preenchimento dos dados
        const { route, dbData } = this.props;
        const { targetData } = route.params;

        // Escolas
        let escolasArray = [{ "label": "Escolher depois...", "value": null }];
        dbData.escolas.forEach(e => {
            if (e.LOC_LATITUDE != null && e.LOC_LATITUDE != "" &&
                e.LOC_LONGITUDE != null && e.LOC_LONGITUDE != "") {
                escolasArray.push({
                    "label": e.NOME,
                    "value": e.ID,
                    "temGPS": true,
                    "latitude": e.LOC_LATITUDE,
                    "longitude": e.LOC_LONGITUDE
                })
            } else {
                escolasArray.push({
                    "label": e.NOME,
                    "value": e.ID,
                    "temGPS": false
                })
            }
        })
        this.setState({ "escolas": escolasArray })

        // Dados pessoais
        console.log(targetData)

        if (targetData) {
            let rebuildState = {}

            if (targetData["ID"]) rebuildState.ID = targetData["ID"];
            if (targetData["NOME"]) rebuildState.nome = targetData["NOME"];
            if (targetData["DATA_NASCIMENTO"]) rebuildState.dataDeNascimento = targetData["DATA_NASCIMENTO"];
            if (targetData["SEXO"]) rebuildState.sexo = targetData["SEXO"];
            if (targetData["NOME_RESPONSAVEL"]) rebuildState.nomeResponsavel = targetData["NOME_RESPONSAVEL"];
            if (targetData["TELEFONE_RESPONSAVEL"]) rebuildState.telefoneResponsavel = targetData["TELEFONE_RESPONSAVEL"];
            if (targetData["MEC_TP_LOCALIZACAO"]) rebuildState.localizacaoAluno = targetData["MEC_TP_LOCALIZACAO"];

            if (targetData["TURNO"]) rebuildState.turno = targetData["TURNO"];
            if (targetData["NIVEL"]) rebuildState.nivel = targetData["NIVEL"];

            if (targetData["LOC_LATITUDE"] && targetData["LOC_LONGITUDE"]) {
                rebuildState.region = {
                    latitude: Number(targetData["LOC_LATITUDE"]),
                    longitude: Number(targetData["LOC_LONGITUDE"]),
                    latitudeDelta: 0.00922,
                    longitudeDelta: 0.00421,
                }
                rebuildState.alunoTemLocalizacao = true;
                rebuildState.posAluno = {
                    latitude: Number(targetData["LOC_LATITUDE"]),
                    longitude: Number(targetData["LOC_LONGITUDE"]),
                }
            }

            let idEscola = dbData.escolatemalunos.filter((rel) => rel.ID_ALUNO == targetData.ID)
            let idRota = dbData.rotaatendealuno.filter((rel) => rel.ID_ALUNO == targetData.ID)

            if (idEscola.length > 0) {
                let escolaArray = dbData.escolas.filter((rel) => String(rel.ID) == idEscola[0].ID_ESCOLA);
                rebuildState.idDocumentoRelEscolaAluno = idEscola[0].ID;
                rebuildState.idEscolaAluno = { "label": escolaArray[0].NOME, "value": idEscola[0].ID_ESCOLA };

                if (escolaArray[0].LOC_LATITUDE != null && escolaArray[0].LOC_LATITUDE != "" &&
                    escolaArray[0].LOC_LONGITUDE != null && escolaArray[0].LOC_LONGITUDE != "") {
                    rebuildState.escolaTemGPS = true;
                    rebuildState.escolaLatitude = Number(escolaArray[0].LOC_LATITUDE);
                    rebuildState.escolaLongitude = Number(escolaArray[0].LOC_LONGITUDE);
                } else {
                    rebuildState.escolaTemGPS = false;
                }
            }

            if (idRota.length > 0) {
                rebuildState.idRotaAluno = idRota;
            }
            this.setState(rebuildState)
        }


        // Localização
        Location.requestForegroundPermissionsAsync().then(({ status }) => {
            console.log("RESPOSTA STATUS LOCALIZAÇÃO", status)
            if (status !== 'granted') {
                this.setState({ gpsAtivo: false });
            } else {
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
                        let coordinates = [
                            {
                                latitude: params.coords.latitude,
                                longitude: params.coords.longitude
                            }
                        ]
                        if (this.state.alunoTemLocalizacao) {
                            coordinates.push({
                                latitude: this.state.posAluno.latitude,
                                longitude: this.state.posAluno.longitude,
                            })
                        }
                        if (this.state.escolaTemGPS) {
                            coordinates.push({
                                latitude: this.state.escolaLatitude,
                                longitude: this.state.escolaLongitude,
                            })
                        }
                        if (coordinates.length > 1) {
                            this.map.fitToCoordinates(coordinates, {
                                edgePadding: { top: 20, right: 20, bottom: 20, left: 20 }
                            })
                        }
                    },
                    (err) => {
                        this.setState({ gpsAtivo: false });
                    },
                    {
                        timeout: 1000,
                        enableHighAccuracy: true,
                        maximumAge: 1000,
                    }
                );
            }
        });
    }

    basicInputScreen() {
        return (
            // <KeyboardAvoidingView
            //     behavior="position"
            //     style={styles.kbContainer}
            //     keyboardVerticalOffset={
            //         Platform.select({
            //             ios: () => 0,
            //             android: () => 200
            //         })()}
            // >
            //     <ScrollView style={styles.scrollContainer}>
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
                            onChangeText={nome => this.setState({ nome })}
                        />
                        <View style={styles.inputWrapper}>
                            <Text style={styles.labelPicker}>
                                Data de nascimento:
                            </Text>
                            <TextInputMask
                                style={styles.rawInput}
                                autoCorrect={false}
                                keyboardType="numeric"
                                label="Data de nascimento"
                                placeholder="DD/MM/YYYY"
                                returnKeyType="next"
                                mode="outlined"
                                type={'datetime'}
                                options={{
                                    format: 'DD/MM/YYYY'
                                }}
                                value={this.state.dataDeNascimento}
                                onChangeText={text => {
                                    this.setState({
                                        dataDeNascimento: text
                                    })
                                }}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.labelPicker}>
                                Sexo do Aluno:
                            </Text>
                            <RadioButton.Group
                                onValueChange={value => this.setState({ sexo: value })}
                                value={this.state.sexo}
                                uncheckedColor="red"
                            >
                                <RadioButton.Item
                                    mode="android"
                                    label="Masculino"
                                    value={1}
                                    color={this.props.theme.colors.primary}
                                    uncheckedColor="gray"
                                />
                                <RadioButton.Item
                                    mode="android"
                                    label="Feminino"
                                    value={2}
                                    color={this.props.theme.colors.primary}
                                    uncheckedColor="gray"
                                />
                                <RadioButton.Item
                                    mode="android"
                                    label="Não Informado"
                                    value={3}
                                    color={this.props.theme.colors.primary}
                                    uncheckedColor="gray"
                                />
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
                            onChangeText={nomeResponsavel => this.setState({ nomeResponsavel })}
                        />
                        <View style={styles.inputWrapper}>
                            <Text style={styles.labelPicker}>
                                Telefone do responsável:
                            </Text>
                            <TextInputMask
                                style={styles.rawInput}
                                autoCorrect={false}
                                keyboardType="numeric"
                                label="Telefone do responsável"
                                placeholder="(DD) NÚMERO"
                                returnKeyType="done"
                                mode="outlined"
                                type={'cel-phone'}
                                options={{
                                    maskType: 'BRL',
                                    withDDD: true,
                                    dddMask: '(99) '
                                }}
                                value={this.state.telefoneResponsavel}
                                onChangeText={text => {
                                    this.setState({
                                        telefoneResponsavel: text
                                    })
                                }}

                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.labelPicker}>
                                Localização do Aluno:
                            </Text>
                            <RadioButton.Group
                                onValueChange={value => this.setState({ localizacaoAluno: value })}
                                value={this.state.localizacaoAluno}
                                uncheckedColor="red"
                            >
                                <RadioButton.Item
                                    mode="android"
                                    label="Urbana"
                                    value={1}
                                    color={this.props.theme.colors.primary}
                                    uncheckedColor="gray"
                                />
                                <RadioButton.Item
                                    mode="android"
                                    label="Rural"
                                    value={2}
                                    color={this.props.theme.colors.primary}
                                    uncheckedColor="gray"
                                />
                            </RadioButton.Group>
                        </View>
                    </View>
                {/* </ScrollView>
            </KeyboardAvoidingView > */}
            </KeyboardAwareScrollView>
        )
    }

    schoolScreen() {
        return (
            // <KeyboardAvoidingView behavior="padding" style={styles.inputContainer}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.labelPicker}>
                            Escola do aluno:
                        </Text>
                        <Picker
                            containerStyle={styles.pickerWrap2}
                            // textInputStyle={styles.pickerWrap2}
                            item={this.state.idEscolaAluno}
                            items={this.state.escolas}
                            doneButtonLabel="Escolher"
                            onItemChange={(idEscola, idx) => {
                                if (idEscola.value == null && this.state.firstPickIgnore) {
                                    this.setState({
                                        firstPickIgnore: false
                                    })
                                } else {
                                    let coordinates = [
                                        {
                                            latitude: this.state.region.latitude,
                                            longitude: this.state.region.longitude
                                        }
                                    ]
                                    if (this.state.alunoTemLocalizacao) {
                                        coordinates.push({
                                            latitude: this.state.posAluno.latitude,
                                            longitude: this.state.posAluno.longitude,
                                        })
                                    }

                                    if (idEscola.temGPS) {
                                        this.setState({
                                            idEscolaAluno: idEscola,
                                            escolaTemGPS: true,
                                            escolaLatitude: Number(idEscola.latitude),
                                            escolaLongitude: Number(idEscola.longitude)
                                        })

                                        coordinates.push({
                                            latitude: Number(idEscola.latitude),
                                            longitude: Number(idEscola.longitude)
                                        })
                                    } else {
                                        this.setState({
                                            idEscolaAluno: idEscola,
                                            escolaTemGPS: false
                                        })
                                    }

                                    if (coordinates.length > 1) {
                                        this.map.fitToCoordinates(coordinates, {
                                            edgePadding: { top: 20, right: 20, bottom: 20, left: 20 }
                                        })
                                    }
                                }

                            }}
                            title="Escola do aluno"
                            placeholder="Selecione uma escola"
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.labelPicker}>
                            Turno:
                        </Text>
                        <RadioButton.Group
                            onValueChange={value => this.setState({ turno: value })}
                            value={this.state.turno}
                            uncheckedColor="red"
                        >
                            <RadioButton.Item
                                mode="android"
                                label="Manhã"
                                value={1}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item
                                mode="android"
                                label="Tarde (Verspertino)"
                                value={2}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item
                                mode="android"
                                label="Integral"
                                value={3}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item
                                mode="android"
                                label="Noite (Noturno)"
                                value={4}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                        </RadioButton.Group>
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.labelPicker}>
                            Turno:
                        </Text>
                        <RadioButton.Group
                            onValueChange={value => this.setState({ nivel: value })}
                            value={this.state.nivel}
                            uncheckedColor="red"
                        >
                            <RadioButton.Item
                                mode="android"
                                label="Infantil (Pré-escolar)"
                                value={1}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item
                                mode="android"
                                label="Fundamental"
                                value={2}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item
                                mode="android"
                                label="Médio"
                                value={3}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item
                                mode="android"
                                label="Superior"
                                value={4}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                            <RadioButton.Item
                                mode="android"
                                label="Outro"
                                value={5}
                                color={this.props.theme.colors.primary}
                                uncheckedColor="gray"
                            />
                        </RadioButton.Group>
                    </View>
                </View>
            </ScrollView>
            // </KeyboardAvoidingView >
        )
    }
    geoScreen() {
        return (
            <View style={styles.page}>
                <View style={styles.mapContainer}>
                    <MapView
                        ref={map => { this.map = map }}
                        style={styles.map}
                        initialRegion={this.state.region}
                        mapType="hybrid"
                        onPress={geoEvent => {
                            // this.map.animateToRegion({
                            //     ...geoEvent.nativeEvent.coordinate,
                            //     latitudeDelta: 0.00922,
                            //     longitudeDelta: 0.00421
                            // })
                            this.setState({
                                posAluno: geoEvent.nativeEvent.coordinate,
                                alunoTemLocalizacao: true,
                            })
                        }}
                        showsUserLocation
                        showsMyLocationButton
                        loadingEnabled
                        showsCompass
                        showsScale
                    >
                        {this.state.escolaTemGPS ?
                            <Marker
                                coordinate={{
                                    "latitude": this.state.escolaLatitude,
                                    "longitude": this.state.escolaLongitude
                                }}
                            >
                                <Image
                                    source={iconeEscola}
                                    style={{ width: 48, height: 48 }}
                                    resizeMode="contain"
                                />
                            </Marker> : null}
                        {this.state.alunoTemLocalizacao ?
                            <Marker
                                coordinate={this.state.posAluno}
                                draggable
                                onDragEnd={(geoEvent) => this.setState({ posAluno: geoEvent.nativeEvent.coordinate })}
                            >
                                <Image
                                    source={iconeAluno}
                                    style={{ width: 48, height: 48 }}
                                    resizeMode="contain"
                                />
                            </Marker> : null}
                    </MapView>
                </View>
            </View >
        )
    }

    render() {
        // const {currentScreen, showInfoBanner, showSaveDialog, showErrorDialog, errorMessage} = this.state;
        const { finishedOperation, errorOcurred } = this.props;
        const { iniciouSalvamento } = this.state;

        return (
            <PaperProvider theme={this.props.theme}>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <Appbar.Content
                        title="SETE"
                        subtitle="Editar Aluno"
                    />
                </Appbar.Header>
                <View style={styles.container}>
                    <Tabs
                        showTextLabel={true} // true/false | default=false (KEEP PROVIDING LABEL WE USE IT AS KEY INTERNALLY + SCREEN READERS)
                        iconPosition="top" // leading, top | default=leading
                        style={{
                            backgroundColor: '#fff',
                        }} // works the same as AppBar in react-native-paper
                        // dark={false} // works the same as AppBar in react-native-paper
                        // mode="scrollable" // fixed, scrollable | default=fixed
                        // onChangeIndex={(newIndex) => { }} // react on index change
                        showLeadingSpace={true} //  (default=true) show leading space in scrollable tabs inside the header
                    >
                        <TabScreen label="Dados" icon="account">
                            {this.basicInputScreen()}
                        </TabScreen>
                        <TabScreen label="Escola" icon="school">
                            {this.schoolScreen()}
                        </TabScreen>
                        <TabScreen label="Posição" icon="map">
                            {this.geoScreen()}
                        </TabScreen>
                    </Tabs>
                    <FAB
                        icon="cancel"
                        small
                        label="Cancelar"
                        color="white"
                        style={styles.fabCancel}
                        onPress={() => { this.cancelEditing() }}
                    />

                    <FAB
                        style={styles.fabSave}
                        small
                        label="Salvar"
                        icon="send"
                        onPress={() => { this.saveEditing() }}
                    />

                    {finishedOperation && iniciouSalvamento ?
                        <Portal>
                            <Dialog
                                visible={true}
                                onDismiss={() => this.props.navigation.navigate("DashboardScreen")}
                            >
                                <Dialog.Title>
                                    Aluno salvo com sucesso
                                </Dialog.Title>
                                <Dialog.Content>
                                    <Paragraph>Os dados foram enviados corretamente para o sistema SETE</Paragraph>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button
                                        onPress={() => this.props.navigation.navigate("DashboardScreen")}>
                                        Retornar ao menu
                                    </Button>
                                </Dialog.Actions>

                            </Dialog>
                        </Portal>
                        :
                        <Portal>
                            <Dialog visible={this.state.iniciouSalvamento} dismissable={false}>
                                <Dialog.Title>Salvando</Dialog.Title>
                                <Dialog.Content>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <ActivityIndicator
                                            color={Colors.orange500}
                                            size={isIOS ? 'large' : 48}
                                            style={{ marginRight: 16 }}
                                        />
                                        <Paragraph>Enviando dados.....</Paragraph>
                                    </View>
                                </Dialog.Content>
                            </Dialog>
                        </Portal>
                    }
                </View>
            </PaperProvider >
        );
    }

    cancelEditing() {
        Alert.alert(
            "Cancelar edição?",
            "Você tem certeza que deseja cancelar as alterações? Se sim, nenhuma alteração será realizada.",
            [
                {
                    text: "Não, voltar a editar",
                    onPress: () => console.log("Continue"),
                },
                {
                    text: "Sim, cancelar",
                    onPress: () => this.props.navigation.goBack(),
                    style: "cancel"
                }
            ]
        );
    }

    saveEditing() {
        Alert.alert(
            "Salvar edição?",
            "Você tem certeza que deseja enviar as alterações?",
            [
                {
                    text: "Não, voltar a editar",
                    onPress: () => console.log("Continue"),
                },
                {
                    text: "Sim, salvar",
                    onPress: () => {
                        this.setState({
                            iniciouSalvamento: true
                        })

                        let saveActions = []

                        let alunoPayload = {
                            NOME: this.state.nome,
                            DATA_NASCIMENTO: this.state.dataDeNascimento,
                            NOME_RESPONSAVEL: this.state.nomeResponsavel,
                            TELEFONE_RESPONSAVEL: this.state.telefoneResponsavel,
                            SEXO: parseInt(this.state.sexo),
                            TURNO: parseInt(this.state.turno),
                            NIVEL: parseInt(this.state.nivel)
                        }

                        if (this.state.alunoTemLocalizacao) {
                            alunoPayload.LOC_LATITUDE = this.state.posAluno.latitude;
                            alunoPayload.LOC_LONGITUDE = this.state.posAluno.longitude;
                        }

                        saveActions.push({
                            collection: "alunos",
                            id: this.state.ID,
                            payload: alunoPayload
                        })

                        if (this.state.idEscolaAluno != null && this.state.idEscolaAluno != {}) {
                            if (this.state.idDocumentoRelEscolaAluno) {
                                saveActions.push({
                                    collection: "escolatemalunos",
                                    id: this.state.idDocumentoRelEscolaAluno,
                                    payload: {
                                        ID_ALUNO: this.state.ID,
                                        ID_ESCOLA: this.state.idEscolaAluno.value
                                    }
                                })
                            } else {
                                saveActions.push({
                                    collection: "escolatemalunos",
                                    id: null,
                                    payload: {
                                        ID_ALUNO: this.state.ID,
                                        ID_ESCOLA: this.state.idEscolaAluno.value
                                    }
                                })
                            }
                        }

                        console.log("SALVANDO OS SEGUINTE DADOS")
                        console.log("---------------------------")
                        console.log(saveActions)
                        console.log("---------------------------")
                        // if (this.state.ID) {
                        this.props.dbSaveAction(saveActions);
                        // }
                    },
                    style: "cancel"
                }
            ]
        );
    }

}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    dbData: store.dbState.data,
    finishedOperation: store.dbState.finishedOperation,
    errorOcurred: store.dbState.errorOcurred
})

const mapDispatchProps = (dispatch) => bindActionCreators(
    { dbClearAction: dbClearAction, dbSaveAction: dbSaveAction },
    dispatch
)

export default connect(mapStateToProps, mapDispatchProps)(withTheme(EditAlunoScreen))
