import {
    LOCALIZACAO_RASTREAMENTO_COMECAR,
    LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO,
    LOCALIZACAO_RASTREAMENTO_TERMINAR,
    LOCALIZACAO_RASTREAMENTO_NAO_COMECOU,
} from "../constants/index";

let vetorPosicoes = [];
let status = LOCALIZACAO_RASTREAMENTO_NAO_COMECOU;

export function locComecarRastreamento() {
    return (dispatch) => {
        vetorPosicoes = [];
        status = LOCALIZACAO_RASTREAMENTO_COMECAR;

        dispatch({
            type: LOCALIZACAO_RASTREAMENTO_COMECAR,
            vetorPosicoes: [],
            status,
        });
    };
}

export function locAtualizarPosicao(localizacoes) {
    return (dispatch) => {
        localizacoes.forEach((loc) => vetorPosicoes.push(loc));

        let novasPosicoes = [...vetorPosicoes];
        status = LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO;

        dispatch({
            type: LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO,
            vetorPosicoes: novasPosicoes,
            status,
        });
    };
}

export function locPararRastreamento() {
    return (dispatch) => {
        status = LOCALIZACAO_RASTREAMENTO_TERMINAR;

        dispatch({
            type: LOCALIZACAO_RASTREAMENTO_TERMINAR,
            vetorPosicoes,
            status,
        });
    };
}
