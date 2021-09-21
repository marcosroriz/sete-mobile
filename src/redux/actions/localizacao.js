import {
    LOCALIZACAO_RASTREAMENTO_COMECAR,
    LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO,
    LOCALIZACAO_RASTREAMENTO_TERMINAR,
    LOCALIZACAO_RASTREAMENTO_NAO_COMECOU,
} from "../constants/index";

let vetorPosicoes = [];
let status = LOCALIZACAO_RASTREAMENTO_NAO_COMECOU;

export function locLimparRastreamento() {
    return (dispatch) => {
        vetorPosicoes = [];
        status = LOCALIZACAO_RASTREAMENTO_NAO_COMECOU;

        dispatch({
            type: LOCALIZACAO_RASTREAMENTO_NAO_COMECOU,
            vetorPosicoes: [],
            status,
        });
    };
}

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
        try {
            if (localizacoes != null && localizacoes != undefined && vetorPosicoes != null && vetorPosicoes != undefined) {
                localizacoes.forEach((loc) => vetorPosicoes.push(loc));

                let novasPosicoes = [...vetorPosicoes];
                status = LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO;

                dispatch({
                    type: LOCALIZACAO_RASTREAMENTO_NOVAPOSICAO,
                    vetorPosicoes: novasPosicoes,
                    status,
                });
            } else {
                console.log("DEU PAU, NÃO DEVERIA");
            }
        } catch (error) {
            console.log("FATAL ERROR", error);
        }
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
