// Basic React Imports
import React, { Component } from "react"

// Redux Store
import { connect } from "react-redux"

// Widgets
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Appbar, List, Badge, Card, Colors, Text, TextInput, Divider, Provider as PaperProvider } from 'react-native-paper';
import { AlphabetList } from "react-native-section-alphabet-list";
import { withTheme } from 'react-native-paper';

import Icon from 'react-native-vector-icons/FontAwesome';

// Style
import styles from "./style"

export class OverviewScreen extends Component {

    onPressTitle = (item) => {
        console.log("LOG", item);
    };


    renderListItem = (item) => {
        return (
            <View style={styles.listItemContainer}>
                <List.Item
                    titleStyle={styles.listItemLabel}
                    title={item.value}
                    onPress={() => this.onPressTitle(item)}
                />
            </View>
        );
    };

    renderSectionHeader = (section) => {
        return (
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeaderLabel}>{section.title}</Text>
            </View>
        );
    };

    renderCustomListHeader = (desc, numDesc) => {
        return (
            <Card>
                <Card.Title title={desc}
                    right={() => <Badge size={30} style={styles.numBadges}>{numDesc}</Badge>}
                />
            </Card>
        );
    };

    render() {
        const { currentUser, dbData } = this.props;
        // console.log(currentUser);
        // console.log(dbData);

        let screenSubTitle = "Visão Geral";

        let targetData = "alunos";

        let keyID = "ID";
        let keyValue = "NOME";
        console.log(dbData[targetData].length)

        const listData = dbData[targetData].map(d => {
            let listName = d[keyValue].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let listID = d[keyID];
            return {
                ...d,
                "value": listName,
                "key": listID
            }
        })

        let targetDesc = "Alunos atendidos";
        let targetSize = listData.length;

        let numAlunosAtendidos = 2000;
        let numEscolasAtendidas = new Set();
        let numRotasRodoviario = 5;
        let numRotasAquaviario = 3;
        let numMotoristas = 2;
        let numVeiculosManutencao = 5;
        let numVeiculosOperando = 20;

        // // Pegando dados da base de dados
        // // Só considerar num alunos que estão vinculados a escolas
        // let numAlunosAtendidos = dbData.escolatemalunos.length;
        // let numEscolasAtendidas = new Set();
        // dbData.escolatemalunos.forEach(k => numEscolasAtendidas.add(k.ID_ESCOLA))

        // // Número de Rotas
        // // let numRotasAtendidas = dbData.rotas.length;
        // let numRotasRodoviario = 0;
        // let numRotasAquaviario = 0;
        // dbData.rotas.forEach(r => {
        //     switch (Number(r.TIPO)) {
        //         case 1:
        //             numRotasRodoviario++;
        //             break;
        //         case 2:
        //             numRotasAquaviario++;
        //             break;
        //         case 3:
        //             numRotasRodoviario++;
        //             numRotasAquaviario++;
        //             break;
        //         default:
        //             break;
        //     }
        // })

        // // Número de Motoristas
        // let numMotoristas = dbData.motoristas.length;

        // // Número de Veículos
        // let numVeiculosManutencao = 0;
        // let numVeiculosOperando = 0;
        // dbData.veiculos.forEach(v => v.MANUTENCAO ? numVeiculosManutencao++ : numVeiculosOperando++)
        const data = [
            { value: 'Lillie-Mai Allen', key: 'lCUTs2' },
            { value: 'Emmanuel Goldstein', key: 'TXdL0c' },
            { value: 'Winston Smith', key: 'zqsiEw' },
            { value: 'William Blazkowicz', key: 'psg2PM' },
            { value: 'Gordon Comstock', key: '1K6I18' },
            { value: 'Philip Ravelston', key: 'NVHSkA' },
            { value: 'Rosemary Waterlow', key: 'SaHqyG' },
            { value: 'Julia Comstock', key: 'iaT1Ex' },
            { value: 'Mihai Maldonado', key: 'OvMd5e' },
            { value: 'Murtaza Molina', key: '25zqAO' },
            { value: 'Peter Petigrew', key: '8cWuu3' },
        ]

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
                    <AlphabetList
                        data={listData}
                        style={{ flex: 1 }}
                        indexLetterColor={'blue'}
                        renderCustomItem={this.renderListItem}
                        renderCustomSectionHeader={this.renderSectionHeader}
                        renderCustomListHeader={this.renderCustomListHeader(targetDesc, targetSize)}
                        getItemHeight={() => 40}
                        sectionHeaderHeight={30}
                        listHeaderHeight={80}
                    />

                </View>
            </PaperProvider>
        )
    }
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    dbData: store.dbState.data
})

export default connect(mapStateToProps, null)(withTheme(OverviewScreen))
