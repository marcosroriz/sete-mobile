// Basic React Imports
import React, { Component } from "react"

// Basic Widgets
import { KeyboardAvoidingView, Image, ScrollView, View } from "react-native";
import {
    Appbar, Banner, Button, Checkbox, Colors, Dialog, List, Text, TextInput,
    Divider, Paragraph, Portal, Provider as PaperProvider, RadioButton
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import { withTheme } from 'react-native-paper';

// Swipe Widgets
import { MaterialIcons } from '@expo/vector-icons';
import StepIndicator from 'react-native-step-indicator';
import Swiper from 'react-native-swiper';

// Style
import styles from "./style";

// Map
import MapView, { Geojson, Marker } from "react-native-maps";

// GPX
import createGpx from "gps-to-gpx";

// Step config
import * as StepConfig from './stepconfig';

const PAGES = ['Page 1', 'Page 2', 'Page 3'];

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
        console.log("SwIPE", this.swipe.current)
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
                    <AwesomeAlert
                        show={showErrorDialog}
                        showProgress={false}
                        title="Erro"
                        message={errorMessage}
                        showConfirmButton={true}
                        confirmText="OK"
                        confirmButtonColor="#d33"
                        onConfirmPressed={() => {
                            this.setState({ showErrorDialog: false, errorMessage: "" });
                        }}
                    />
                    <AwesomeAlert
                        show={showSaveDialog}
                        showProgress={false}
                        title="Terminar o rastreamento?"
                        message="Você tem certeza que deseja terminar o georeferenciamento da rota?"
                        closeOnTouchOutside={false}
                        closeOnHardwareBackPress={false}
                        showCancelButton={true}
                        showConfirmButton={true}
                        cancelText="Não, voltar a rastrear"
                        cancelButtonColor="#3085d6"
                        confirmText="Sim, terminar"
                        confirmButtonColor="#d33"
                        onCancelPressed={() => {
                            this.finishSaveDialog();
                        }}
                        onConfirmPressed={() => {
                            this.finishSaveDialog();
                        }}
                    />
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
                                            source={require('../../../assets/bus-marker.png')}
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
                                {this.state.walkedCoordsGps.length > 0 &&
                                    this.state.buttonChange &&
                                    this.state.gpxString.length > 0 ? (
                                    <Button
                                        mode="contained"
                                        onPress={async () =>
                                            await this.handleExportRoutePress()
                                        }
                                        compact
                                    >
                                        Salvar Rota
                                    </Button>
                                ) : null}
                            </View>
                        </View>

                        <View key={3} style={styles.page}>
                            <Text>{currentScreen}</Text>
                            <Text>{3}</Text>
                        </View>
                    </Swiper>

                </View>

            </PaperProvider>
        );
    }
}

export default withTheme(GenerateRouteScreen);
