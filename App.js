import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import AutoLogin from './AutoLogin.js'
import Dashboard from './Dashboard'
import ListarAlunos from './ListarAlunos.js'
import ListarEscolas from './ListarEscolas.js'
import Login from './Login.js'
import MapaAluno from './MapaAluno'
import MapaRota from './MapaRota.js'
import InfoAluno from './InfoAluno.js'

export default createAppContainer(
  createSwitchNavigator(
    {
      AutoLogin,
      Dashboard,
      Login,
      ListarAlunos,
      ListarEscolas,
      InfoAluno,
      MapaAluno,
      MapaRota
    },
    {
      initialRouteName: 'AutoLogin',
    }
  )
);
