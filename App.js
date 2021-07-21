/**
 * App.js is the application main entrypoint.
 *
 * Here we define an App component that contains two navigation branches, inside (dashboard) and outside (needs to login).
 * In addition, we wrap App with a redux store.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Imports básicos
import React, { Component } from "react";
import { LogBox } from "react-native";
import NetInfo from "@react-native-community/netinfo";

// Import de localização (para usarmos data no formato brasileiro)
import { datePolyfill } from "./src/utils/DatePolyfill";
datePolyfill();

// Bibliotecas para lidar com caching
import { Asset } from "expo-asset";
import AppLoading from "expo-app-loading";
import * as Font from "expo-font";
import { FontAwesome, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

// Redux Store
import { Provider as StoreProvider, connect } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store/Store";
import { bindActionCreators } from "redux";

// (async() => {
//   await persistor.purge();
//   await persistor.flush();
//   await persistor.persist();
//     console.log("terminou purge")
// })();

// Firebase
import * as firebase from "firebase";

// Imports para navegação
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens (telas)
import AlunosGeoreferenciarScreen from "./src/screens/AlunosGeoreferenciarScreen";
import AlunosEditScreen from "./src/screens/AlunosEditScreen";
import AlunosMapScreen from "./src/screens/AlunosMapScreen";
import GenerateRouteScreen from "./src/screens/GenerateRouteScreen";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import OverviewScreen from "./src/screens/OverviewScreen";
import RotasPercorrerScreen from "./src/screens/RotasPercorrerScreen";
import StatScreen from "./src/screens/StatScreen";

// Tema
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";

// Ação para informar perda de conexão
import { mudancaNaConexao } from "./src/redux/actions/userActions";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// CONFIGS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
        ...DefaultTheme.colors,
        primary: "#068cc9",
        // accent: 'red',
    },
};

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDOHCjGDkv-tsIjVhHxOcEt0rzusFJwQxc",
    authDomain: "softwareter.firebaseapp.com",
    databaseURL: "https://softwareter.firebaseio.com",
    projectId: "softwareter",
    storageBucket: "softwareter.appspot.com",
    messagingSenderId: "881352897273",
    appId: "1:881352897273:web:acfe04f2804ca623bc6828",
};
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}
firebase.auth().signOut();
// firebase.firestore().enablePersistence()

// Remove warnings
LogBox.ignoreLogs(["Setting a timer"]);

// Cache das imagens
function cacheImagens(images) {
    return images.map((image) => {
        return Asset.fromModule(image).downloadAsync();
    });
}

// Cache das fontes
function cacheFontes(fonts) {
    return fonts.map((font) => Font.loadAsync(font));
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// COMPONENTE /////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Navegação (stack)
const Stack = createStackNavigator();

// App componente
export class App extends Component {
    state = {
        cachePronto: false,
    };

    componentDidMount() {
        // Listener da conexão
        NetInfo.addEventListener((state) => {
            this.props.mudancaNaConexao(state.type, state.isConnected);
            console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);
        });
    }

    async realizaCacheamento() {
        const imagensCacheadas = cacheImagens([
            require("./assets/aluno-marker.png"),
            require("./assets/banner-rodape-completo.png"),
            require("./assets/banner-topo.png"),
            require("./assets/barco.png"),
            require("./assets/boat.png"),
            require("./assets/bus-marker.png"),
            require("./assets/escola-marker.png"),
            require("./assets/favicon.png"),
            require("./assets/icon.png"),
            require("./assets/onibus.png"),
            require("./assets/splash.png"),
        ]);

        const fontesCacheadas = cacheFontes([FontAwesome.font, FontAwesome5.font, MaterialIcons.font, MaterialCommunityIcons.font]);

        await Promise.all([...imagensCacheadas, ...fontesCacheadas]);
    }

    render() {
        const { isLogged } = this.props;
        const { cachePronto } = this.state;

        if (!cachePronto) {
            return <AppLoading startAsync={this.realizaCacheamento} onFinish={() => this.setState({ cachePronto: true })} onError={console.warn} />;
        } else {
            return (
                <PaperProvider theme={theme}>
                    <NavigationContainer>
                        {isLogged ? (
                            <Stack.Navigator initialRouteName="DashboardScreen">
                                <Stack.Screen name="DashboardScreen" component={DashboardScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="AlunosGeoreferenciarScreen" component={AlunosGeoreferenciarScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="AlunosEditScreen" component={AlunosEditScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="AlunosMapScreen" component={AlunosMapScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="GenerateRouteScreen" component={GenerateRouteScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="OverviewScreen" component={OverviewScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="StatScreen" component={StatScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="RotasPercorrerScreen" component={RotasPercorrerScreen} options={{ headerShown: false }} />
                            </Stack.Navigator>
                        ) : (
                            <Stack.Navigator initialRouteName="LoginScreen">
                                <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
                            </Stack.Navigator>
                        )}
                    </NavigationContainer>
                </PaperProvider>
            );
        }
    }
}

// Redux properties
const mapReduxEstado = (store) => ({ isLogged: store.userState?.isLogged });
const mapReduxAcoes = (dispatch) => bindActionCreators({ mudancaNaConexao }, dispatch);

App = connect(mapReduxEstado, mapReduxAcoes)(App);

// Wrap app with redux store
const AppWithStore = () => {
    return (
        <StoreProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </StoreProvider>
    );
};

export default AppWithStore;
