// Basic React Imports
import React, { Component } from "react"

// Redux Store
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { dbClearAction, dbSynchronizeAction } from "../../redux/actions/dbCRUDAction"

// Widgets
import { ScrollView, View } from 'react-native';
import { Appbar, List, Text, Divider, Provider as PaperProvider } from 'react-native-paper';
import { withTheme } from 'react-native-paper';
import { ActivityIndicator, Avatar, Button, Card, Colors, Headline, IconButton, Title, Paragraph } from 'react-native-paper';

const RightContent = props => <Avatar.Icon {...props} icon="folder" />

// Style
import styles from "./style"

// Firebase
import firebase from "firebase";
import '@firebase/firestore';


// DashboardScreen
export class DashboardScreen extends Component {
    constructor(props) {
        super(props);
        this.onSync = this.onSync.bind(this);
    }

    componentDidMount() {
        console.log("VALOR DE FINISHED OPERATION", this.props.finishedOperation)
        console.log("VALOR DE DBSYNC", this.props.dbIsSync)
        this.onSync();
    }

    onSync() {
        console.log("METODO ON SYNC")
        this.props.dbClearAction();
        this.props.dbSynchronizeAction();
    }

    handleNavigate = (destination) => {
        this.props.navigation.navigate(destination);
    };


    renderCurrentState() {
        const { currentUser, finishedOperation, dbIsSync, dbData, dbLastUpdate } = this.props;
        console.log("FINISHED OPERATION", finishedOperation)
        // console.log("IS LOGGED", isLogged)
        // console.log("IS SYNC", dbIsSync)
        // console.log("LAST UPDATE", dbLastUpdate)
        // console.log("DATA", dbData)
        // console.log(this.props)

        let cidade = currentUser?.CIDADE;
        let estado = currentUser?.ESTADO;
        console.log("CIDADE", cidade)
        console.log("ESTADO", cidade)

        if (!finishedOperation) {
            return (
                <View style={styles.syncContainer}>
                    <ActivityIndicator animating={true} color={Colors.orange500} size={100}
                        style={styles.syncLoadingIndicator} />
                    <Text>
                        Fazendo a sincronização com os dados de...
                    </Text>
                    <Text style={styles.syncHeadlineBold}>
                        {cidade}
                    </Text>
                    <Divider />


                </View>
            )
        } else {
            return (
                <PaperProvider theme={this.props.theme}>
                    <Appbar.Header style={styles.headerBar}>
                        <Appbar.Content
                            title="SETE"
                        />
                    </Appbar.Header>
                    <View style={styles.container}>
                        <ScrollView style={styles.scrollContainer}>
                            <Card>
                                <Card.Title title={cidade} subtitle={estado}
                                    right={props => <IconButton {...props} icon="refresh" onPress={() => { }} />}
                                />
                                {/* <Card.Content>
                                    <Title
                                        left={props => <Avatar.Icon {...props} icon="folder" />}
                                        right={(props) => <IconButton {...props} icon="more-vert" onPress={() => { }} />}
                                    >{cidade}</Title>
                                    <Paragraph>{estado}</Paragraph>
                                </Card.Content> */}
                            </Card>

                            <List.Section title="Funcionalidades">
                                <List.Item
                                    title="Visão Geral"
                                    left={props => <List.Icon {...props} icon="clipboard-text" style={{ leftMargin: 10 }} />}
                                    onPress={() => this.props.navigation.navigate("StatScreen")}
                                />
                                <List.Accordion
                                    title="Alunos"
                                    left={props => <List.Icon {...props} icon="face" />}>
                                    {/* <List.Item title="Cadastrar Aluno" />     */}
                                    <List.Item
                                        title="Lista de Alunos Atendidos"
                                        // onPress={() => this.onSync()}
                                        onPress={() => this.props.navigation.navigate("OverviewScreen", {
                                            targetData: "alunos",
                                            keyID: "ID",
                                            keyValue: "NOME",
                                            targetDesc: "Alunos atendidos",
                                            screenSubTitle: "Alunos"
                                        })}
                                    />
                                    {/* <List.Item title="Mapa de Alunos" /> */}
                                </List.Accordion>

                                <List.Accordion
                                    title="Escolas"
                                    left={props => <List.Icon {...props} icon="school" />}>
                                    <List.Item
                                        title="Lista de Escolas Atendidas"
                                        onPress={() => this.props.navigation.navigate("OverviewScreen", {
                                            targetData: "escolas",
                                            keyID: "ID",
                                            keyValue: "NOME",
                                            targetDesc: "Escolas atendidas",
                                            screenSubTitle: "Escolas"
                                        })} />
                                    <List.Item title="Mapa de Escolas Atendidas" />
                                </List.Accordion>
                                <List.Accordion
                                    title="Rotas"
                                    left={props => <List.Icon {...props} icon="map" />}>
                                    <List.Item
                                        title="Gerar rota usando o GPS"
                                        onPress={() => this.props.navigation.navigate("GenerateRouteScreen")} />
                                    <List.Item title="Mapa de Escolas Atendidas" />
                                </List.Accordion>

                                <List.Accordion
                                    title="Escolas"
                                    left={props => <List.Icon {...props} icon="school" />}>
                                    <List.Item title="Listar Escolas Atendidas" />
                                    <List.Item title="Mapa de Escolas Atendidas" />
                                </List.Accordion>
                                <List.Accordion
                                    title="Escolas"
                                    left={props => <List.Icon {...props} icon="school" />}>
                                    <List.Item title="Listar Escolas Atendidas" />
                                    <List.Item title="Mapa de Escolas Atendidas" />
                                </List.Accordion>
                            </List.Section>
                        </ScrollView>
                    </View>
                </PaperProvider>
            )
        }
    }

    render() {
        return (
            this.renderCurrentState()
        )
    }

}

const mapDispatchProps = (dispatch) => bindActionCreators(
    {
        dbClearAction: dbClearAction,
        dbSynchronizeAction: dbSynchronizeAction
    },
    dispatch
)

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    isLogged: store.userState.isLogged,
    dbIsSync: store.dbState.isSync,
    dbLastUpdate: store.dbState.lastUpdate,
    dbData: store.dbState.data,
    finishedOperation: store.dbState.finishedOperation,
    errorOcurred: store.dbState.errorOcurred,
})

export default connect(mapStateToProps, mapDispatchProps)(withTheme(DashboardScreen))
