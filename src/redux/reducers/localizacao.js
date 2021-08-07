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
    if (acao.type == LOCALIZACAO_RASTREAMENTO_COMECAR) {
        console.log("START", estado);
        console.log("START", acao);
        return {
            ...estado,
            vetorPosicoes: [],
            status: LOCALIZACAO_RASTREAMENTO_COMECAR,
        };
    } else if (acao.type == LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO) {
        console.log("UPDATE", estado);
        console.log("UPDATE", acao);
        return {
            ...estado,
            vetorPosicoes: [...acao.vetorPosicoes],
            status: LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO,
        };
    } else if (acao.type == LOCALIZACAO_RASTREAMENTO_TERMINAR) {
        console.log("END", estado);
        console.log("END", acao);
        return {
            ...estado,
            vetorPosicoes: acao.vetorPosicoes,
            status: LOCALIZACAO_RASTREAMENTO_TERMINAR,
        };
    } else {
        return estado;
    }
};
