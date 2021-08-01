/**
 * VisaoGeralScreen.js
 *
 * A tela de estatística da aplicação móvel.
 * Mostra os números de estudantes, alunos, etc.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React, { Component } from "react";

// Redux Store
import { connect } from "react-redux";

// Widgets
import { ScrollView, View } from "react-native";
import { Appbar, List, Badge, Provider as PaperProvider } from "react-native-paper";
import { withTheme } from "react-native-paper";

// Style
import styles from "./style";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENT //////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class VisaoGeralScreen extends Component {
    /**
     * Processa a base de dados e retorna o quantitativo das entidades
     */
    parseDados(dbData) {
        // Pegando dados da base de dados
        // Só considerar num alunos que estão vinculados a escolas
        let numAlunosAtendidos = dbData?.escolatemalunos?.length;
        let numEscolasAtendidas = new Set();

        dbData.escolatemalunos.forEach((escola) => numEscolasAtendidas.add(escola.ID_ESCOLA));

        // Número de Rotas
        // let numRotasAtendidas = dbData.rotas.length;
        let numRotasRodoviario = 0;
        let numRotasAquaviario = 0;
        dbData.rotas.forEach((r) => {
            switch (Number(r.TIPO)) {
                case 1:
                    numRotasRodoviario++;
                    break;
                case 2:
                    numRotasAquaviario++;
                    break;
                case 3:
                    numRotasRodoviario++;
                    numRotasAquaviario++;
                    break;
                default:
                    break;
            }
        });

        // Número de Motoristas
        let numMotoristas = dbData.motoristas.length;

        // Número de Veículos
        let numVeiculosManutencao = 0;
        let numVeiculosOperando = 0;
        dbData.veiculos.forEach((v) => (v.MANUTENCAO ? numVeiculosManutencao++ : numVeiculosOperando++));

        return { numAlunosAtendidos, numEscolasAtendidas, numRotasRodoviario, numRotasAquaviario, numMotoristas, numVeiculosManutencao, numVeiculosOperando };
    }

    render() {
        const { db } = this.props;
        const estatistica = this.parseDados(db);

        return (
            <PaperProvider>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                    <Appbar.Content title="SETE" subtitle="Visão Geral" />
                </Appbar.Header>
                <View style={styles.screenContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <List.Section style={styles.infoSection}>
                            <List.Item
                                title="Alunos Atendidos"
                                left={(props) => <List.Icon {...props} icon="face" />}
                                right={() => (
                                    <Badge size={30} style={styles.numBadges}>
                                        {estatistica.numAlunosAtendidos}
                                    </Badge>
                                )}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Escolas Atendidas"
                                left={(props) => <List.Icon {...props} icon="school" />}
                                right={() => (
                                    <Badge size={30} style={styles.numBadges}>
                                        {estatistica.numEscolasAtendidas.size}
                                    </Badge>
                                )}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Rotas Realizadas"
                                description="Rodoviário"
                                left={(props) => <List.Icon {...props} icon="road-variant" />}
                                right={() => (
                                    <Badge size={30} style={styles.numBadges}>
                                        {estatistica.numRotasRodoviario}
                                    </Badge>
                                )}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Rotas Realizadas"
                                description="Aquaviário"
                                left={(props) => <List.Icon {...props} icon="ferry" />}
                                right={() => (
                                    <Badge size={30} style={styles.numBadges}>
                                        {estatistica.numRotasAquaviario}
                                    </Badge>
                                )}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Motoristas"
                                left={(props) => <List.Icon {...props} icon="card-account-details" />}
                                right={() => (
                                    <Badge size={30} style={styles.numBadges}>
                                        {estatistica.numMotoristas}
                                    </Badge>
                                )}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Veículos"
                                description="Operação"
                                left={(props) => <List.Icon {...props} icon="bus" />}
                                right={() => (
                                    <Badge size={30} style={styles.numBadges}>
                                        {estatistica.numVeiculosOperando}
                                    </Badge>
                                )}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Veículos"
                                description="Manutenção"
                                left={(props) => <List.Icon {...props} icon="bus-alert" />}
                                right={() => (
                                    <Badge size={30} style={styles.numBadges}>
                                        {estatistica.numVeiculosManutencao}
                                    </Badge>
                                )}
                                style={styles.infoDiv}
                            />
                        </List.Section>
                    </ScrollView>
                </View>
            </PaperProvider>
        );
    }
}

// Mapeamento redux
const mapStateToProps = (store) => ({
    currentUser: store.usuario.usuarioAtual,
    db: store.db.dados,
});

export default connect(mapStateToProps, null)(withTheme(VisaoGeralScreen));
