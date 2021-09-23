/**
 * ListarEntidadeScreen.js
 *
 * Esta tela possibilita listar uma entidade (aluno, escola, rota, etc).
 * Além disso, também possibilita que especifique a tela que deverá ser chamada quando o usuário clicar em uma entidade.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React, { Component } from "react";

// Redux
import { connect } from "react-redux";

// Widgets
import { View } from "react-native";
import { Appbar, List, Badge, Card, Text, Provider as PaperProvider, Searchbar } from "react-native-paper";
import { AlphabetList } from "react-native-section-alphabet-list";
import { withTheme } from "react-native-paper";

// Style
import styles from "./style";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENTES ////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class ListarEntidadeScreen extends Component {
    state = {
        // Nome da tela alvo
        telaAlvo: "",

        // Subitutlo da tela
        subtitulo: "",

        // Esta editando?
        estaEditando: false,

        // Lista original e filtrada
        listaOriginal: [],
        listaFiltrada: [],
    };

    componentDidMount() {
        const { route, db } = this.props;
        const { telaAlvo, subtitulo, estaEditando, dadoAlvo, descricaoTela, campoUsarComoID, campoUsarComoValor } = route.params;

        const listData = db[dadoAlvo].map((dado) => {
            let listValor = dado[campoUsarComoValor].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let listID = dado[campoUsarComoID];
            return {
                ...dado,
                value: listValor,
                key: listID,
            };
        });

        listData.sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()));

        this.setState({
            telaAlvo,
            subtitulo,
            estaEditando,
            listaOriginal: listData,
            listaFiltrada: listData,
        });
    }

    apertouItemDaLista = (item) => {
        this.props.navigation.navigate(this.state.telaAlvo, {
            dadoAlvo: item,
            estaEditando: this.state.estaEditando,
            subtitulo: this.state.subtitulo,
        });
    };

    realizarBusca = (str) => {
        const normSTR = str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        let novaListaFiltrada = this.state.listaOriginal.filter((elemento) => elemento.value.toLowerCase().includes(normSTR));

        this.setState({
            listaFiltrada: novaListaFiltrada,
        });
    };

    renderItemDaLista = (item) => {
        return (
            <View style={styles.listItemContainer}>
                <List.Item titleStyle={styles.listItemLabel} title={item.value} onPress={() => this.apertouItemDaLista(item)} />
            </View>
        );
    };

    renderCabecalhoSecao = (secao) => {
        return (
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeaderLabel}>{secao.title}</Text>
            </View>
        );
    };

    renderCabecalho = (desc, numDesc) => {
        return (
            <Card>
                <Card.Title
                    title={desc}
                    right={() => (
                        <Badge size={30} style={styles.numBadges}>
                            {numDesc}
                        </Badge>
                    )}
                />
            </Card>
        );
    };

    render() {
        const { route } = this.props;
        const { subtitulo, descricaoTela } = route.params;
        const { listaFiltrada } = this.state;

        let tamLista = listaFiltrada.length;

        return (
            <PaperProvider>
                <Appbar.Header style={styles.headerBar}>
                    <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                    <Appbar.Content title="SETE" subtitle={subtitulo} />
                </Appbar.Header>
                <View style={{ marginVertical: 10, marginHorizontal: 10 }}>
                    <Searchbar placeholder="Buscar" onChangeText={this.realizarBusca} />
                </View>

                {tamLista > 0 ? (
                    <View style={styles.screenContainer}>
                        <AlphabetList
                            data={listaFiltrada}
                            style={{ flex: 1 }}
                            indexLetterColor={"black"}
                            renderCustomItem={this.renderItemDaLista}
                            renderCustomSectionHeader={this.renderCabecalhoSecao}
                            renderCustomListHeader={this.renderCabecalho(descricaoTela, tamLista)}
                            getItemHeight={() => 60}
                            sectionHeaderHeight={45}
                            listHeaderHeight={80}
                            // removeClippedSubviews={true}
                        />
                    </View>
                ) : (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingTitle}>Nenhum resultado encontrado.</Text>
                    </View>
                )}
            </PaperProvider>
        );
    }
}

// Mapeamento redux
const mapStateToProps = (store) => ({
    db: store.db.dados,
});

export default connect(mapStateToProps, null)(withTheme(ListarEntidadeScreen));
