import firebase from "firebase";
import { USUARIO_MUDANCA_REDE, USER_STATE_CHANGE } from "../constants/index";

/**
 * Essa função despacha as mudanças que ocorrem na conexão.
 * Recebe como entrada se o usuário está ou não conectado no momento, bem como qual o tipo de rede que ele está conectado.
 */
export function mudancaNaConexao(tipoRede, estaConectadoInternet) {
    return (dispatch) => {
        dispatch({
            type: USUARIO_MUDANCA_REDE,
            tipoRede,
            estaConectadoInternet,
        });
    };
}

export function finishLoginUserAction(uid) {
    return (dispatch) => {
        firebase
            .firestore()
            .collection("users")
            .doc(uid)
            .get({ source: "server" })
            .then((res) => {
                if (res.exists) {
                    dispatch({
                        type: USER_STATE_CHANGE,
                        currentUser: res.data(),
                        isLogged: true,
                    });
                }
            });
    };
}

export function logoutAction() {
    return (dispatch) => {
        firebase
            .auth()
            .signOut()
            .then(
                dispatch({
                    type: USER_STATE_CHANGE,
                    currentUser: undefined,
                    isLogged: false,
                })
            );
    };
}
