import {
    LOCALIZACAO_RASTREAMENTO_COMECAR,
    LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO,
    LOCALIZACAO_RASTREAMENTO_TERMINAR,
    LOCALIZACAO_RASTREAMENTO_NAO_COMECOU,
} from "../constants/index";

const estadoInicial = {
    vetorPosicoes: [],
    status: LOCALIZACAO_RASTREAMENTO_NAO_COMECOU,
};

export const localizacao = (estado = estadoInicial, acao) => {
    if (acao.type == LOCALIZACAO_RASTREAMENTO_COMECAR || 
        acao.type == LOCALIZACAO_RASTREAMENTO_NAO_COMECOU) {
        return {
            ...estado,
            vetorPosicoes: [],
            status: acao.type,
        };
    } else if (acao.type == LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO) {
        return {
            ...estado,
            vetorPosicoes: [...acao.vetorPosicoes],
            status: LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO,
        };
    } else if (acao.type == LOCALIZACAO_RASTREAMENTO_TERMINAR) {
        return {
            ...estado,
            vetorPosicoes: acao.vetorPosicoes,
            status: LOCALIZACAO_RASTREAMENTO_TERMINAR,
        };
    } else {
        return estado;
    }
};
