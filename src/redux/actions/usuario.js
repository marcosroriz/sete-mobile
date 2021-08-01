import firebase from "firebase";
import { USUARIO_MUDANCA_REDE, USUARIO_MUDANCA_ESTADO } from "../constants/index";

/**
 * Essa função despacha as mudanças que ocorrem na conexão.
 * Recebe como entrada se o usuário está ou não conectado no momento, bem como qual o tipo de rede que ele está conectado.
 *
 * @param {String} tipoRede
 * @param {boolean} estaConectadoInternet
 * @returns dispache de uma ação
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

/**
 * Finaliza a ação de login, mudando o estado de redux
 * @param {String} uid do usuário na Firebase
 * @returns dispache de uma ação USUARIO_MUDANCA_ESTADO
 */
export function finalizaAcaoLogin(uid) {
    return (dispatch) => {
        firebase
            .firestore()
            .collection("users")
            .doc(uid)
            .get({ source: "server" })
            .then((res) => {
                if (res.exists) {
                    dispatch({
                        type: USUARIO_MUDANCA_ESTADO,
                        usuarioAtual: res.data(),
                        estaAutenticado: true,
                    });
                }
            });
    };
}

/**
 * Faz logout do usuário
 * @returns dispache de uma ação USUARIO_MUDANCA_ESTADO removendo o usuarioAtual do estado.
 */
export function fazLogout() {
    return (dispatch) => {
        firebase
            .auth()
            .signOut()
            .then(
                dispatch({
                    type: USUARIO_MUDANCA_ESTADO,
                    usuarioAtual: undefined,
                    estaAutenticado: false,
                })
            );
    };
}
