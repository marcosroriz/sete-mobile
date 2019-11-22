import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import AutoLogin from './AutoLogin.js'
import Dashboard from './Dashboard'
import Login from './Login.js'

// const AppStack = createStackNavigator({
//   Home: HomeScreen,
//   Other: OtherScreen
// });
// const AuthStack = createStackNavigator({
//   "Login": Login
// });

export default createAppContainer(
  createSwitchNavigator(
    {
      AutoLogin,
      Login,
      Dashboard
    },
    {
      initialRouteName: 'AutoLogin',
    }
  )
);
