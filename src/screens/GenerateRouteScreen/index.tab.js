// Basic React Imports
import React, { Component } from "react"

// Basic Widgets
import { KeyboardAvoidingView, Image, ScrollView, View } from "react-native";
import {
    Appbar, Banner, Button, Checkbox, Colors, Dialog, List, Text, TextInput,
    Divider, Paragraph, Portal, Title, Provider as PaperProvider, RadioButton
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import { withTheme } from 'react-native-paper';

// Swipe Widgets
import { MaterialIcons } from '@expo/vector-icons';
import StepIndicator from 'react-native-step-indicator';
import Swiper from 'react-native-swiper';
import {
    Tabs,
    TabScreen,
    useTabIndex,
    useTabNavigation,
} from 'react-native-paper-tabs';

// Style
import styles from "./style";

// Map
import MapView, { Geojson, Marker } from "react-native-maps";

// GPX
import createGpx from "gps-to-gpx";

// Step config
import * as StepConfig from './stepconfig';

const PAGES = ['Page 1', 'Page 2', 'Page 3'];

function ExploreWitHookExamples() {
    const goTo = useTabNavigation();
    const index = useTabIndex();
    return (
        <View style={{ flex: 1 }}>
            <Title>Explore</Title>
            <Paragraph>Index: {index}</Paragraph>
            <Button onPress={() => goTo(1)}>Go to Flights</Button>
        </View>
    );
}


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

        // Tipo de icone da rota
        markerIcon: "bus-marker.png",

        // Variáveis do georeferenciamento
        region: {
            latitude: -16.6782432,
            longitude: -49.2530005,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
        },

        watch_id: null,
        walkedCoordsGps: [],
        gpxString: "",

        // Botoões e ações para salvar 
        buttonChange: true,
        buttonStart: false,
        buttonStop: false,

        // Dialogos
        errorMessage: "",
        showInfoBanner: true,
        showErrorDialog: false,
        showSaveDialog: false,

    };

    activateSaveDialog() {
        this.setState({
            showSaveDialog: true
        });
    }

    finishSaveDialog() {
        this.setState({
            showSaveDialog: false
        });
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (params) => {
                console.log("AQUI")
                console.log(params)
                this.setState({
                    region: {
                        latitude: params.coords.latitude,
                        longitude: params.coords.longitude,
                        latitudeDelta: 0.00922,
                        longitudeDelta: 0.00421,
                    },
                });
                console.log("Geolocation found with success");
            },
            (err) => {
                // TODO: mostrar erro pro usuário
                console.error(err);
            },
            {
                timeout: 2000,
                enableHighAccuracy: true,
                maximumAge: 1000,
            }
        );
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
                timeout: 2000,
                enableHightAccuracy: true,
                maximunAge: 1000,
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
        this.activateSaveDialog();

        if (this.state.watch_id)
            navigator.geolocation.clearWatch(this.state.watch_id);
        this.setState({
            buttonChange: true,
            watch_id: null,
            gpxString: await createGpx(this.state.walkedCoordsGps),
        });
    }

    async handleExportRoutePress() {
        console.log("GEN GPX", this.state.gpxString);
    }


    renderStepIndicator = (params) => {
        // console.log("PARAMS", params)
        return (
            <MaterialIcons {...StepConfig.getStepIcon(params)} />
        )
    };

    onStepPress = (position, ...params) => {
        console.log(params)
        console.log("APERTOU O BOTÃO")
        console.log(position)
        this.setState({
            showInfoBanner: false,
            currentScreen: position,
        });
        this.forceUpdate()
        console.log("SwIPE", this.swipe)
        // if (position == 1) {
        //     this.goToTrackingPage()
        // }
    };


    isBasicInformationSupplied() {
        const { tipoRota, nomeRota, funcionaManha, funcionaTarde, funcionaNoite } = this.state;

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
            console.log("PODEMOS IR");
            this.setState({
                showInfoBanner: false,
                showErrorDialog: false,
                currentScreen: 1
            })
        } else {
            console.log("NÃO PODEMOS IR");
            console.log(errorMessage);
            this.setState({
                showErrorDialog: true,
                errorMessage
            })
        }
    }

    render() {
        const { currentScreen, showInfoBanner, showSaveDialog, showErrorDialog, errorMessage } = this.state;
        return (
            <PaperProvider theme={this.props.theme}>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <Appbar.Content
                        title="SETE"
                        subtitle="Gerar Rota usando o GPS"
                    />
                </Appbar.Header>
                <View style={styles.container}>
                    <Tabs
                    // defaultIndex={0} // default = 0
                    // uppercase={false} // true/false | default=true | labels are uppercase
                    // showTextLabel={false} // true/false | default=false (KEEP PROVIDING LABEL WE USE IT AS KEY INTERNALLY + SCREEN READERS)
                    // iconPosition // leading, top | default=leading
                    style={{ backgroundColor:'#fff', color: "red" }} // works the same as AppBar in react-native-paper
                    // dark={false} // works the same as AppBar in react-native-paper
                    // theme={} // works the same as AppBar in react-native-paper
                    mode="fixed" // fixed, scrollable | default=fixed
                    // onChangeIndex={(newIndex) => {}} // react on index change
                    // showLeadingSpace={true} //  (default=true) show leading space in scrollable tabs inside the header
                    >
                        <TabScreen label="Explore" icon="compass">
                            <ExploreWitHookExamples />
                        </TabScreen>
                        <TabScreen label="Flights" icon="airplane">
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
                        </TabScreen>
                        <TabScreen label="Trips" icon="bag-suitcase">
                            <View style={{ backgroundColor: 'red', flex: 1 }} />
                        </TabScreen>
                    </Tabs>
                </View>
            </PaperProvider>
        );
    }
}

export default withTheme(GenerateRouteScreen);
