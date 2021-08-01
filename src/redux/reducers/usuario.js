import { USUARIO_MUDANCA_REDE, USUARIO_MUDANCA_ESTADO } from "../constants/index";

const estadoInicial = {
    usuarioAtual: null,
    estaAutenticado: false,
    estaConectadoInternet: false,
    tipoRede: "",
};

export const usuario = (estado = estadoInicial, acao) => {
    if (acao.type == USUARIO_MUDANCA_REDE) {
        return {
            ...estado,
            estaConectadoInternet: acao.estaConectadoInternet,
            tipoRede: acao.tipoRede,
        };
    } else if (acao.type == USUARIO_MUDANCA_ESTADO) {
        return {
            ...estado,
            usuarioAtual: acao.usuarioAtual,
            estaAutenticado: acao.estaAutenticado,
        };
    } else {
        return estado;
    }
};
