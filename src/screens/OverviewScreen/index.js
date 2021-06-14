// Basic React Imports
import React, { Component } from "react"

// Redux Store
import { connect } from "react-redux"

// Widgets
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Appbar, List, Badge, Card, Colors, Text, TextInput, Divider, Provider as PaperProvider } from 'react-native-paper';
import { AlphabetList } from "react-native-section-alphabet-list";
import { withTheme } from 'react-native-paper';

// Style
import styles from "./style"

export class OverviewScreen extends Component {
    state = {
        // Edit Screen
        editScreen: "",

        // Screen subtitle
        screenSubTitle: ""
    };

    componentDidMount() {
        const { route } = this.props;
        const { editScreen, screenSubTitle } = route.params

        this.setState({
            editScreen,
            screenSubTitle
        });

    }

    onPressItem = (item) => {
        console.log("LOG", item);
        console.log("editScreen", this.state.editScreen);
        console.log("screenSubTitle", this.state.screenSubTitle);

        this.props.navigation.navigate(this.state.editScreen, {
            targetData: item,
            isEditing: true,
            screenSubTitle: this.state.screenSubTitle,
        })
    };

    renderListItem = (item) => {
        return (
            <View style={styles.listItemContainer}>
                <List.Item
                    titleStyle={styles.listItemLabel}
                    title={item.value}
                    onPress={() => this.onPressItem(item)}
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
        const { navigation, route, dbData } = this.props;
        // console.log(dbData)
        const { screenSubTitle, targetData, targetDesc, keyID, keyValue } = route.params

        const listData = dbData[targetData].map(d => {
            let listName = d[keyValue].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let listID = d[keyID];
            return {
                ...d,
                "value": listName,
                "key": listID
            }
        })

        let targetSize = listData.length;

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
                        indexLetterColor={'black'}
                        renderCustomItem={this.renderListItem}
                        renderCustomSectionHeader={this.renderSectionHeader}
                        renderCustomListHeader={this.renderCustomListHeader(targetDesc, targetSize)}
                        getItemHeight={() => 60}
                        sectionHeaderHeight={30}
                        listHeaderHeight={80}
                    // removeClippedSubviews={true}
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
