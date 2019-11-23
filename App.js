import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import AutoLogin from './AutoLogin.js'
import Dashboard from './Dashboard'
import ListarAlunos from './ListarAlunos.js'
import Login from './Login.js'
import MapaRotas from './MapaRotas.js'

export default createAppContainer(
  createSwitchNavigator(
    {
      AutoLogin,
      Dashboard,
      Login,
      ListarAlunos,
      MapaRotas
    },
    {
      initialRouteName: 'AutoLogin',
    }
  )
);
