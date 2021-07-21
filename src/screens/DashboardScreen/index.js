/**
 * DashboardScreen.js is the application menu screen.
 *
 * The dashboard lists the existing screens, alongside basic information about the city, e.g., name and state.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Basic React Imports
import React, { Component } from "react";

// Redux Store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { logoutAction } from "../../redux/actions/userActions";
import { dbEnviaOperacoesPendentes, dbClearAction, dbSynchronizeAction } from "../../redux/actions/dbCRUDAction";

// Widgets
import { Alert, Platform, ScrollView, View } from "react-native";
import {
    ActivityIndicator,
    Appbar,
    Button,
    Card,
    Colors,
    IconButton,
    FAB,
    List,
    Text,
    Dialog,
    Divider,
    Paragraph,
    Portal,
    Provider as PaperProvider,
} from "react-native-paper";
import { withTheme } from "react-native-paper";

// Style
import styles from "./style";

// Firebase
import firebase from "firebase";
import "@firebase/firestore";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// CONFIGURAÇÕES E VARIÁVEIS //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Variável lógica que indica se estamos no IOS
const isIOS = Platform.OS === "ios";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENT //////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DashboardScreen
export class DashboardScreen extends Component {
    // Estado
    state = {
        // Iniciou envio de pendencia
        iniciouEnvioPendencias: false,
    };

    constructor(props) {
        super(props);
        this.onSync = this.onSync.bind(this);
    }

    componentDidMount() {
        console.log("VALOR DE FINISHED OPERATION", this.props.finishedOperation);
        console.log("VALOR DE DBSYNC", this.props.dbIsSync);
        this.onSync();

        this.unsubscribeAction = this.props.navigation.addListener("focus", () => {
            console.log("CHAMANDO AQUI?");
            this.onSync();
        });
    }

    componentWillUnmount() {
        // remove event listener
        this.unsubscribeAction();
    }

    logout() {
        this.props.logoutAction();
    }

    onSync() {
        this.props.dbClearAction();
        this.props.dbSynchronizeAction();
    }

    handleNavigate = (destination) => {
        this.props.navigation.navigate(destination);
    };

    renderDialogos(iniciouEnvioPendencias, terminouOperacaoNaInternet, terminouOperacaoComErro) {
        if (iniciouEnvioPendencias && terminouOperacaoNaInternet && !terminouOperacaoComErro) {
            return (
                <Portal>
                    <Dialog visible={iniciouEnvioPendencias} onDismiss={() => this.setState({ iniciouEnvioPendencias: false })}>
                        <Dialog.Title>Dados enviados com sucesso</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>Os dados foram salvos com sucesso no sistema SETE.</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => this.setState({ iniciouEnvioPendencias: false })}>Ok</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            );
        } else if (terminouOperacaoComErro) {
            <Portal>
                <Dialog visible={iniciouEnvioPendencias} onDismiss={() => this.setState({ iniciouEnvioPendencias: false })}>
                    <Dialog.Title>Erro ao tentar enviar dados pendentes</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>Verifique se sua conexão com a internet está funcionaond e tente novamente.</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => this.setState({ iniciouEnvioPendencias: false })}>Ok</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>;
        } else {
            return (
                <Portal>
                    <Dialog visible={iniciouEnvioPendencias} dismissable={false}>
                        <Dialog.Title>Processando</Dialog.Title>
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
    renderCurrentState() {
        const { iniciouEnvioPendencias } = this.state;
        const { currentUser, finishedOperation, filaOperacoesParaEnviar, estaConectadoInternet, terminouOperacaoNaInternet, terminouOperacaoComErro } =
            this.props;

        let cidade = currentUser?.CIDADE;
        let estado = currentUser?.ESTADO;
        let numOperacoesPendentes = filaOperacoesParaEnviar.length;

        if (!finishedOperation) {
            return (
                <View style={styles.syncContainer}>
                    <ActivityIndicator animating={true} color={Colors.orange500} size={100} style={styles.syncLoadingIndicator} />
                    <Text>Fazendo a sincronização com os dados de...</Text>
                    <Text style={styles.syncHeadlineBold}>{cidade}</Text>
                    <Divider />
                </View>
            );
        } else {
            return (
                <PaperProvider theme={this.props.theme}>
                    <Appbar.Header style={styles.headerBar}>
                        <Appbar.BackAction
                            onPress={() => {
                                this.logout();
                            }}
                        />
                        <Appbar.Content title="SETE" />
                    </Appbar.Header>
                    <View style={styles.container}>
                        <ScrollView style={styles.scrollContainer}>
                            <Card>
                                <Card.Title
                                    title={cidade}
                                    subtitle={estado}
                                    right={(props) => (
                                        <IconButton
                                            {...props}
                                            icon="refresh"
                                            onPress={() => {
                                                this.onSync();
                                            }}
                                        />
                                    )}
                                />
                            </Card>
                            <List.Section title="Funcionalidades">
                                <List.Item
                                    title="Visão Geral"
                                    left={(props) => <List.Icon {...props} icon="clipboard-text" style={{ leftMargin: 10 }} />}
                                    onPress={() => this.props.navigation.navigate("StatScreen")}
                                />
                                <List.Accordion title="Alunos" left={(props) => <List.Icon {...props} icon="face" />}>
                                    <List.Item
                                        title="Georeferenciar Aluno"
                                        onPress={() =>
                                            this.props.navigation.navigate("OverviewScreen", {
                                                targetData: "alunos",
                                                keyID: "ID",
                                                keyValue: "NOME",
                                                targetDesc: "Selecione um aluno",
                                                screenSubTitle: "Alunos",
                                                editScreen: "AlunosGeoreferenciarScreen",
                                            })
                                        }
                                    />

                                    <List.Item
                                        title="Lista de Alunos Atendidos"
                                        onPress={() =>
                                            this.props.navigation.navigate("OverviewScreen", {
                                                targetData: "alunos",
                                                keyID: "ID",
                                                keyValue: "NOME",
                                                targetDesc: "Alunos atendidos",
                                                screenSubTitle: "Alunos",
                                                editScreen: "AlunosEditScreen",
                                            })
                                        }
                                    />
                                    <List.Item title="Mapa de Alunos" onPress={() => this.props.navigation.navigate("AlunosMapScreen")} />
                                    <List.Item title="Relatório de Alunos Atendidos" onPress={() => this.props.navigation.navigate("AlunosMapScreen")} />
                                </List.Accordion>

                                <List.Accordion title="Escolas" left={(props) => <List.Icon {...props} icon="school" />}>
                                    <List.Item
                                        title="Lista de Escolas Atendidas"
                                        onPress={() =>
                                            this.props.navigation.navigate("OverviewScreen", {
                                                targetData: "escolas",
                                                keyID: "ID",
                                                keyValue: "NOME",
                                                targetDesc: "Escolas atendidas",
                                                screenSubTitle: "Escolas",
                                                editScreen: "InfoEscolaScreen",
                                            })
                                        }
                                    />
                                    <List.Item title="Mapa de Escolas Atendidas" />
                                </List.Accordion>
                                <List.Accordion title="Rotas" left={(props) => <List.Icon {...props} icon="map" />}>
                                    <List.Item title="Gerar rota usando o GPS" onPress={() => this.props.navigation.navigate("GenerateRouteScreen")} />
                                    <List.Item title="Mapa de Escolas Atendidas" />
                                    <List.Item title="Percorrer rota" onPress={() => this.props.navigation.navigate("RotasPercorrerScreen")} />
                                </List.Accordion>
                            </List.Section>
                        </ScrollView>

                        {numOperacoesPendentes != 0 ? (
                            <FAB
                                small
                                icon="alert"
                                color="white"
                                label={numOperacoesPendentes + " operações pendentes"}
                                style={styles.fabOperacoesPendentes}
                                onPress={() => {
                                    if (!estaConectadoInternet) {
                                        Alert.alert("Você ainda está offline", "Tente enviar as operações pendentes em um local com internet");
                                    } else {
                                        this.setState({
                                            iniciouEnvioPendencias: true,
                                        });
                                        this.props.dbEnviaOperacoesPendentes();
                                    }
                                }}
                            />
                        ) : null}

                        {this.renderDialogos(iniciouEnvioPendencias, terminouOperacaoNaInternet, terminouOperacaoComErro)}
                    </View>
                </PaperProvider>
            );
        }
    }

    render() {
        console.log("ESTÁ AQUI NO RENDER DASHBOARD??");
        return this.renderCurrentState();
    }
}

const mapDispatchProps = (dispatch) =>
    bindActionCreators(
        {
            dbEnviaOperacoesPendentes,
            dbClearAction,
            dbSynchronizeAction,
            logoutAction,
        },
        dispatch
    );

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    isLogged: store.userState.isLogged,
    dbIsSync: store.dbState.isSync,
    dbLastUpdate: store.dbState.lastUpdate,
    dbData: store.dbState.data,
    finishedOperation: store.dbState.finishedOperation,
    errorOcurred: store.dbState.errorOcurred,

    terminouOperacaoNaInternet: store.dbState.terminouOperacaoNaInternet,
    terminouOperacaoComErro: store.dbState.terminouOperacaoComErro,

    filaOperacoesParaEnviar: store.dbState.filaOperacoesParaEnviar,
    estaConectadoInternet: store.userState.estaConectadoInternet,
});

export default connect(mapStateToProps, mapDispatchProps)(withTheme(DashboardScreen));
