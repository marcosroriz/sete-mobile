import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import AutoLogin from './AutoLogin.js'
import Dashboard from './Dashboard'
import ListaAlunos from './ListaAlunos.js'
import ListarEscolas from './ListarEscolas.js'
import Login from './Login.js'
import MapaRotas from './MapaRotas.js'
import InfoAluno from './InfoAluno.js'

export default createAppContainer(
  createSwitchNavigator(
    {
      AutoLogin,
      Dashboard,
      Login,
      ListaAlunos,
      ListarEscolas,
      InfoAluno,
      MapaRotas
    },
    {
      initialRouteName: 'AutoLogin',
    }
  )
);
