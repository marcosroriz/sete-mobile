// Basic Imports
import React, { Component } from 'react';
import { LogBox } from 'react-native';

// Localization
import { datePolyfill } from "./src/utils/DatePolyfill";
datePolyfill();

// Store
import { Provider as StoreProvider, connect } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './src/store/Store';

// (async() => {
//   await persistor.purge();
//   await persistor.flush();
//   await persistor.persist();
//     console.log("terminou purge")
// })();

// Firebase
import * as firebase from "firebase";

// Navigation Imports
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import AlunosMapScreen from './src/screens/AlunosMapScreen';
import EditAlunoScreen from "./src/screens/EditAlunoScreen";
import GenerateRouteScreen from "./src/screens/GenerateRouteScreen";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import OverviewScreen from "./src/screens/OverviewScreen";
import RotasPercorrerScreen from "./src/screens/RotasPercorrerScreen";
import StatScreen from "./src/screens/StatScreen";

// Theme
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#068cc9',
    // accent: 'red',
  },
};

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDOHCjGDkv-tsIjVhHxOcEt0rzusFJwQxc",
  authDomain: "softwareter.firebaseapp.com",
  databaseURL: "https://softwareter.firebaseio.com",
  projectId: "softwareter",
  storageBucket: "softwareter.appspot.com",
  messagingSenderId: "881352897273",
  appId: "1:881352897273:web:acfe04f2804ca623bc6828"
};
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

firebase.auth().signOut()

// Navigation Stack
const Stack = createStackNavigator();

// Remove warnings
LogBox.ignoreLogs(['Setting a timer'])

// App entrypoint
export class App extends Component {
  render() {
    const { currentUser, isLogged, dbLastUpdate, dbData, finishedOperation } = this.props;
    // console.log("dbData", dbData)
    // console.log("CURRENT USER", currentUser)
    // console.log("IS LOGGED", isLogged)
    // console.log("LAST UDPATE", dbLastUpdate)
    // console.log("Finished Operation", finishedOperation)

    return (
      <PaperProvider theme={theme}>
        <NavigationContainer>
          {
            isLogged ? (
              <Stack.Navigator initialRouteName="DashboardScreen">
                <Stack.Screen name="DashboardScreen" component={DashboardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AlunosMapScreen" component={AlunosMapScreen} options={{ headerShown: false }} />
                <Stack.Screen name="GenerateRouteScreen" component={GenerateRouteScreen} options={{ headerShown: false }} />
                <Stack.Screen name="OverviewScreen" component={OverviewScreen} options={{ headerShown: false }} />
                <Stack.Screen name="StatScreen" component={StatScreen} options={{ headerShown: false }} />
                <Stack.Screen name="RotasPercorrerScreen" component={RotasPercorrerScreen} options={{ headerShown: false }} />
                <Stack.Screen name="EditAlunoScreen" component={EditAlunoScreen} options={{ headerShown: false }} />
              </Stack.Navigator>
            ) : (
              <Stack.Navigator initialRouteName="LoginScreen">
                <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
              </Stack.Navigator>
            )
          }
        </NavigationContainer>
      </PaperProvider>
    )
  }
}

const mapStateToProps = (store) => ({
  currentUser: store.userState?.currentUser,
  isLogged: store.userState?.isLogged,
  dbLastUpdate: store.dbState?.lastUpdate,
  dbData: store.dbState?.data,
  finishedOperation: store.dbState?.finishedOperation,
})
App = connect(mapStateToProps)(App);

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
