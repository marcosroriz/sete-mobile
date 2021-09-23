/**
 * DashboardScreen.js
 *
 * A tela principal da aplicação móvel.
 * Lista as telas existentes, além de informações básicas do município, como nome e estado.
 * Além disso, lista operações pendentes (realizadas offline), para que o usuário possa enviá-las quando tiver conexão.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React, { Component } from "react";

// Redux Store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fazLogout } from "../../redux/actions/usuario";
import { dbEnviaOperacoesPendentes, dbLimparAcoes, dbSincronizar } from "../../redux/actions/db";

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
        this.sincronizar = this.sincronizar.bind(this);
    }

    componentDidMount() {
        this.sincronizar();

        this.unsubscribeAction = this.props.navigation.addListener("focus", () => {
            this.sincronizar();
        });
    }

    componentWillUnmount() {
        // Remove o listener de sincronizacao
        this.unsubscribeAction();
    }

    logout() {
        this.props.fazLogout();
    }

    sincronizar() {
        this.props.dbLimparAcoes();
        this.props.dbSincronizar();
    }

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

    render() {
        const { iniciouEnvioPendencias } = this.state;
        const {
            usuarioAtual,
            filaOperacoesParaEnviar,
            estaConectadoInternet,
            terminouOperacao,
            terminouOperacaoNaInternet,
            terminouOperacaoNoCache,
            terminouOperacaoComErro,
        } = this.props;

        let cidade = usuarioAtual?.CIDADE;
        let estado = usuarioAtual?.ESTADO;
        let numOperacoesPendentes = filaOperacoesParaEnviar.length;

        if (!terminouOperacao) {
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
                                                this.sincronizar();
                                            }}
                                        />
                                    )}
                                />
                            </Card>
                            <List.Section title="Funcionalidades">
                                <List.Item
                                    title="Visão Geral"
                                    left={(props) => <List.Icon {...props} icon="clipboard-text" style={{ leftMargin: 10 }} />}
                                    onPress={() => this.props.navigation.navigate("VisaoGeralScreen")}
                                />
                                <List.Item
                                    title="Georeferenciar Aluno"
                                    left={(props) => <List.Icon {...props} icon="map-marker-plus" style={{ leftMargin: 10 }} />}
                                    onPress={() =>
                                        this.props.navigation.navigate("ListarEntidadeScreen", {
                                            subtitulo: "Alunos",
                                            dadoAlvo: "alunos",
                                            descricaoTela: "Selecione um aluno",
                                            campoUsarComoID: "ID",
                                            campoUsarComoValor: "NOME",
                                            estaEditando: true,
                                            telaAlvo: "AlunosGeoreferenciarScreen",
                                        })
                                    }
                                />
                                <List.Item
                                    title="Lista de Alunos"
                                    left={(props) => <List.Icon {...props} icon="face" style={{ leftMargin: 10 }} />}
                                    onPress={() =>
                                        this.props.navigation.navigate("ListarEntidadeScreen", {
                                            subtitulo: "Alunos",
                                            dadoAlvo: "alunos",
                                            descricaoTela: "Selecione um aluno",
                                            campoUsarComoID: "ID",
                                            campoUsarComoValor: "NOME",
                                            estaEditando: true,
                                            telaAlvo: "AlunosEdicaoScreen",
                                        })
                                    }
                                />
                                <List.Item
                                    title="Mapa de Alunos"
                                    left={(props) => <List.Icon {...props} icon="map" style={{ leftMargin: 10 }} />}
                                    onPress={() => this.props.navigation.navigate("AlunosMapScreen")}
                                />
                                <List.Item
                                    title="Realizar Viagem"
                                    left={(props) => <List.Icon {...props} icon="map-marker-path" style={{ leftMargin: 10 }} />}
                                    onPress={() =>
                                        this.props.navigation.navigate("ListarEntidadeScreen", {
                                            subtitulo: "Escolha uma rota",
                                            dadoAlvo: "rotas",
                                            descricaoTela: "Rotas Cadastradas",
                                            campoUsarComoID: "ID",
                                            campoUsarComoValor: "NOME",
                                            estaEditando: true,
                                            telaAlvo: "RotasPercorrerScreen",
                                        })
                                    }
                                />
                                <List.Item
                                    title="Traçar Nova Rota (GPS)"
                                    left={(props) => <List.Icon {...props} icon="crosshairs-gps" style={{ leftMargin: 10 }} />}
                                    onPress={() => this.props.navigation.navigate("RotasTracarScreen")}
                                />
                                {/* <List.Accordion title="Alunos" left={(props) => <List.Icon {...props} icon="face" />}>
                                    <List.Item title="Estatistica" onPress={() => this.props.navigation.navigate("AlunosEstatisticaScreen")} />
                                    <List.Item
                                        title="Georeferenciar Aluno"
                                        onPress={() =>
                                            this.props.navigation.navigate("ListarEntidadeScreen", {
                                                subtitulo: "Alunos",
                                                dadoAlvo: "alunos",
                                                descricaoTela: "Selecione um aluno",
                                                campoUsarComoID: "ID",
                                                campoUsarComoValor: "NOME",
                                                estaEditando: true,
                                                telaAlvo: "AlunosGeoreferenciarScreen",
                                            })
                                        }
                                    />

                                    <List.Item
                                        title="Lista de Alunos Atendidos"
                                        onPress={() =>
                                            this.props.navigation.navigate("ListarEntidadeScreen", {
                                                subtitulo: "Alunos",
                                                dadoAlvo: "alunos",
                                                descricaoTela: "Selecione um aluno",
                                                campoUsarComoID: "ID",
                                                campoUsarComoValor: "NOME",
                                                estaEditando: true,
                                                telaAlvo: "AlunosEdicaoScreen",
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
                                    <List.Item
                                        title="Percorrer rota"
                                        onPress={() =>
                                            this.props.navigation.navigate("ListarEntidadeScreen", {
                                                subtitulo: "Escolha uma rota",
                                                dadoAlvo: "rotas",
                                                descricaoTela: "Rotas cadastradas",
                                                campoUsarComoID: "ID",
                                                campoUsarComoValor: "NOME",
                                                estaEditando: true,
                                                telaAlvo: "RotasPercorrerScreen",
                                            })
                                        }
                                    />
                                </List.Accordion> */}
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
                                    // if (!estaConectadoInternet) {
                                    //     Alert.alert("Você ainda está offline", "Tente enviar as operações pendentes em um local com internet");
                                    // } else {
                                        this.setState({
                                            iniciouEnvioPendencias: true,
                                        });
                                        this.props.dbEnviaOperacoesPendentes();
                                    // }
                                }}
                            />
                        ) : null}

                        {this.renderDialogos(iniciouEnvioPendencias, terminouOperacaoNaInternet, terminouOperacaoComErro)}
                    </View>
                </PaperProvider>
            );
        }
    }
}

// Mapeamento redux
const mapDispatchProps = (dispatch) =>
    bindActionCreators(
        {
            dbEnviaOperacoesPendentes,
            dbLimparAcoes,
            dbSincronizar,
            fazLogout,
        },
        dispatch
    );

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuario.usuarioAtual,
    estaAutenticado: store.usuario.estaAutenticado,
    estaConectadoInternet: store.usuario.estaConectadoInternet,

    terminouOperacao: store.db.terminouOperacao,
    terminouOperacaoNaInternet: store.db.terminouOperacaoNaInternet,
    terminouOperacaoNoCache: store.db.terminouOperacaoNoCache,
    terminouOperacaoComErro: store.db.terminouOperacaoComErro,

    filaOperacoesParaEnviar: store.db.filaOperacoesParaEnviar,
});

export default connect(mapStateToProps, mapDispatchProps)(withTheme(DashboardScreen));
