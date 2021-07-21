import { USUARIO_MUDANCA_REDE, USER_STATE_CHANGE } from "../constants/index";

const initialState = {
    currentUser: null,
    isLogged: false,
    isConnected: false,
    estaConectadoInternet: false,
    tipoRede: "",
};

export const user = (state = initialState, action) => {
    console.log(action.type);
    if (action.type == USUARIO_MUDANCA_REDE) {
        return {
            ...state,
            estaConectadoInternet: action.estaConectadoInternet,
            tipoRede: action.tipoRede,
        };
    } else if (action.type == USER_STATE_CHANGE) {
        return {
            ...state,
            currentUser: action.currentUser,
            isLogged: action.isLogged,
        };
    } else {
        return state;
    }
};
