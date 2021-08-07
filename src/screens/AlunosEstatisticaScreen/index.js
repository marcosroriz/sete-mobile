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
import paletaCores from "../../styles/EstatisticaStyle";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// CONFIGURAÇÕES E VARIÁVEIS //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Variável lógica que indica se estamos no IOS
const isIOS = Platform.OS === "ios";

// Tamanho da tela
const tamanhoTela = Dimensions.get("window").width;

// Tamanho da paleta
const tamanhoPaleta = paletaCores.length;

// Configuração do gráfico
const configGrafico = {
    decimalPlaces: 0,
    backgroundGradientFrom: "#222222",
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "#aaaaaa",
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.8,
    useShadowColorFromDataset: false, // optional
    /*propsForVerticalLabels: {
        fontSize: "20",
        fontWeight: "bold",
    },*/
    // style: {
    //     borderRadius: 50,
    // },
    // propsForDots: {
    //     r: "6",
    //     strokeWidth: "2",
    //     stroke: "#ffa726",
    // },
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
        let numAlunosEmEscola = dbData?.escolatemalunos?.length;
        let numAlunosEmRota = dbData?.rotaatendealuno?.length;
        let numAlunosTotal = dbData?.alunos.length;

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

        return {
            numAlunosTotal,
            numAlunosEmEscola,
            numAlunosEmRota,
            numEscolasAtendidas,
            numRotasRodoviario,
            numRotasAquaviario,
            numMotoristas,
            numVeiculosManutencao,
            numVeiculosOperando,
        };
    }

    renderGraficoPizza(dados, campoNome, campoValor, altura = 220) {
        let dadosGrafico = [];
        let i = 0;
        for (let dado of dados) {
            dadosGrafico.push({
                name: dado[campoNome],
                valores: dado[campoValor],
                color: paletaCores[i++ % tamanhoPaleta],
                legendFontColor: "black",
                legendFontSize: 14,
            });
        }

        console.log(dadosGrafico);

        return (
            <PieChart
                data={dadosGrafico}
                width={0.95 * tamanhoTela}
                height={150}
                chartConfig={configGrafico}
                accessor={"valores"}
                backgroundColor={"transparent"}
                hasLegend={true}
                paddingLeft={"0"}
                center={[10, 0]}
                absolute={false}
                avoidFalseZero={true}
                // absolute
                style={{
                    backgroundGradientFrom: "#222222",
                    backgroundGradientFromOpacity: 0.5,
                    backgroundGradientTo: "#222222",
                    backgroundGradientToOpacity: 1,

                    backgroundColor: "#cccccc",
                    // marginVertical: 8,
                    borderRadius: 16,
                    // marginTop: 50,
                    marginBottom: 50,
                    // paddingBottom: 50
                    // marginRight: 50,
                }}
            />
        );
    }

    renderGraficoNivelDeEscolaridade(db) {
        let campos = ["Creche", "Fundamental", "Médio", "Superior", "Outro"];
        let dados = [];
        for (let i in campos) {
            console.log(i);
            dados.push({
                name: campos[i],
                valores: 0,
                color: paletaCores[i % tamanhoPaleta],
                legendFontColor: "black",
                legendFontSize: 15,
            });
        }

        db.escolatemalunos.forEach((rel) => {
            let idAluno = rel.ID_ALUNO;
            let alunoArray = db.alunos.filter((aluno) => String(aluno.ID) == idAluno);
            let nivel = Number(alunoArray[0].NIVEL) - 1;
            dados[nivel].valores++;
        });
        console.log(dados);

        let dataset = [];
        let cores = [];
        for (let i in campos) {
            dataset.push(dados[i].valores);
            cores.push((opacity = 1) => dados[i].color);
        }
        const dadosGrafico = {
            labels: campos,
            datasets: [
                {
                    data: dataset,
                    colors: cores,
                },
            ],
        };
        console.log(db.escolatemalunos.length);
        console.log(dadosGrafico);

        return (
            <BarChart
                // style={configGrafico}
                data={dadosGrafico}
                width={0.95 * tamanhoTela}
                height={220}
                chartConfig={configGrafico}
                // verticalLabelRotation={30}
                // withHorizontalLabels={true}
                withHorizontalLabels={false}
                withCustomBarColorFromData={true}
                flatColor={true}
                showBarTops={true}
                showValuesOnTopOfBars={true}
                withInnerLines={true}
                segments={4}
                style={{
                    paddingRight: 10,
                    marginLeft: 10,
                    alignItems: "center",
                    borderRadius: 20,
                }}
            />
        );
    }

    render() {
        const { db } = this.props;
        const estatistica = this.parseDados(db);
        const dadosAtendimento = [
            {
                name: "Sem rota cadastrada",
                value: estatistica.numAlunosTotal - estatistica.numAlunosEmRota,
            },
            {
                name: "Com rota cadastrada",
                value: estatistica.numAlunosEmRota,
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
                        <View>
                            <Title style={styles.tituloGrafico}>Porcentagem de alunos atendidos</Title>
                            {this.renderGraficoPizza(dadosAtendimento, "name", "value")}
                        </View>

                        <View style={{ width: "100%", alignContent: "center" }}>
                            <Title style={styles.tituloGrafico}>Distribuição de alunos por nível de escolaridade</Title>
                            {this.renderGraficoNivelDeEscolaridade(db)}
                        </View>
                        {/* <PieChart
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
                        /> */}
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
