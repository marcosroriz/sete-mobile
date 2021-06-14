// Basic React Imports
import React, { Component } from "react"

// Redux Store
import { connect } from "react-redux"

// Widgets
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Appbar, List, Badge, Text, TextInput, Divider, Provider as PaperProvider } from 'react-native-paper';
import { withTheme } from 'react-native-paper';

import Icon from 'react-native-vector-icons/FontAwesome';

// Style
import styles from "./style"

export class StatScreen extends Component {
    render() {
        const { currentUser, dbData } = this.props;
        console.log(currentUser);
        // console.log(dbData);
        let screenSubTitle = "Visão Geral"

        // Pegando dados da base de dados
        // Só considerar num alunos que estão vinculados a escolas
        let numAlunosAtendidos = dbData?.escolatemalunos?.length;
        let numEscolasAtendidas = new Set();
        
        dbData.escolatemalunos.forEach(k => numEscolasAtendidas.add(k.ID_ESCOLA))

        // Número de Rotas
        // let numRotasAtendidas = dbData.rotas.length;
        let numRotasRodoviario = 0;
        let numRotasAquaviario = 0;
        dbData.rotas.forEach(r => {
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
        })

        // Número de Motoristas
        let numMotoristas = dbData.motoristas.length;

        // Número de Veículos
        let numVeiculosManutencao = 0;
        let numVeiculosOperando = 0;
        dbData.veiculos.forEach(v => v.MANUTENCAO ? numVeiculosManutencao++ : numVeiculosOperando++)

        return (
            <PaperProvider>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <Appbar.Content
                        title="SETE"
                        subtitle={screenSubTitle}
                    />

                </Appbar.Header>
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <List.Section style={styles.infoSection}>
                            <List.Item
                                title="Alunos Atendidos"
                                left={props => <List.Icon {...props} icon="face" />}
                                right={() => <Badge size={30} style={styles.numBadges}>{numAlunosAtendidos}</Badge>}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Escolas Atendidas"
                                left={props => <List.Icon {...props} icon="school" />}
                                right={() => <Badge size={30} style={styles.numBadges}>{numEscolasAtendidas.size}</Badge>}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Rotas Realizadas"
                                description="Rodoviário"
                                left={props => <List.Icon {...props} icon="road-variant" />}
                                right={() => <Badge size={30} style={styles.numBadges}>{numRotasRodoviario}</Badge>}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Rotas Realizadas"
                                description="Aquaviário"
                                left={props => <List.Icon {...props} icon="ferry" />}
                                right={() => <Badge size={30} style={styles.numBadges}>{numRotasAquaviario}</Badge>}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Veículos"
                                description="Operação"
                                left={props => <List.Icon {...props} icon="bus" />}
                                right={() => <Badge size={30} style={styles.numBadges}>{numVeiculosOperando}</Badge>}
                                style={styles.infoDiv}
                            />
                            <List.Item
                                title="Veículos"
                                description="Manutenção"
                                left={props => <List.Icon {...props} icon="bus-alert" />}
                                right={() => <Badge size={30} style={styles.numBadges}>{numVeiculosManutencao}</Badge>}
                                style={styles.infoDiv}
                            />
                        </List.Section>
                    </ScrollView>
                </View>
            </PaperProvider>
        )
    }
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    dbData: store.dbState.data
})

export default connect(mapStateToProps, null)(withTheme(StatScreen))
