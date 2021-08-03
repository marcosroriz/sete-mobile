/**
 * AlunosEstatisticaScreen.js
 *
 * Esta tela ilustra uma série de estatísticas dos dados de aluno do município.
 * Para tal, a mesma depende da biblioteca react-native-chart-kit (https://github.com/indiespirit/react-native-chart-kit).
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React, { Component } from "react";

// Redux Store
import { connect } from "react-redux";

// Widgets
import { Dimensions, ScrollView, View } from "react-native";
import { Appbar, List, Badge, Provider as PaperProvider, Title } from "react-native-paper";
import { withTheme } from "react-native-paper";

// Widgets Gráficos
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, StackedBarChart } from "react-native-chart-kit";

// Style
import styles from "./style";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// CONFIGURAÇÕES E VARIÁVEIS //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Variável lógica que indica se estamos no IOS
const isIOS = Platform.OS === "ios";

// Tamanho da tela
const tamanhoTela = Dimensions.get("window").width;

// Configuração do gráfico
const configGrafico = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENTES ////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class AlunosEstatisticaScreen extends Component {
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
        const data = [
            {
                name: "Seoul",
                population: 21500000,
                color: "rgba(131, 167, 234, 1)",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15,
            },
            {
                name: "Toronto",
                population: 2800000,
                color: "#F00",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15,
            },
            {
                name: "Beijing",
                population: 527612,
                color: "red",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15,
            },
            {
                name: "New York",
                population: 8538000,
                color: "#ffffff",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15,
            },
            {
                name: "Moscow",
                population: 11920000,
                color: "rgb(0, 0, 255)",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15,
            },
        ];

        return (
            <PaperProvider>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                    <Appbar.Content title="SETE" subtitle="Visão Geral" />
                </Appbar.Header>
                <View style={styles.screenContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Title></Title>
                        <PieChart
                            data={data}
                            width={tamanhoTela}
                            height={220}
                            chartConfig={configGrafico}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            hasLegend={true}
                            paddingLeft={"0"}
                            center={[10, 0]}
                            // absolute
                        />
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
    db: store.db.dados,
});

export default connect(mapStateToProps, null)(withTheme(AlunosEstatisticaScreen));
