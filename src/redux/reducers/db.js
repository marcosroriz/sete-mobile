import {
    DB_CLEAR,
    DB_SYNCHRONIZE_OK,
    DB_SYNCHRONIZE_ERROR,
    DB_SYNC_CACHE_EMPTY,
    DB_SYNC_CACHE_OK,
    DB_SYNC_CACHE_ERROR,
    DB_SAVE_CACHE,
    DB_SAVE_OK,
    DB_SAVE_ERROR,
} from "../constants/index";

const initialState = {
    lastUpdate: null,
    isSync: false,
    finishedOperation: false,
    errorOcurred: false,

    terminouOperacaoNaInternet: false,
    terminouOperacaoNoCache: false,
    terminouOperacaoComErro: false,

    filaOperacoesParaEnviar: [],
    data: {},
};

export const db = (state = initialState, action) => {
    console.log(action.type);
    if (action.type == DB_CLEAR) {
        return {
            ...state,
            terminouOperacaoNaInternet: false,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: false,

            finishedOperation: false,
            errorOcurred: false,
        };
    } else if (action.type == DB_SAVE_CACHE) {
        return {
            ...state,
            terminouOperacaoNaInternet: false,
            terminouOperacaoNoCache: true,
            terminouOperacaoComErro: false,

            filaOperacoesParaEnviar: action.filaOperacoesParaEnviar,
            lastUpdate: action.lastUpdate,
            data: action.data,
        };
    } else if (action.type == DB_SAVE_OK) {
        return {
            ...state,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: false,

            finishedOperation: true,
            errorOcurred: false,
            lastUpdate: action.lastUpdate,
            data: action.data,
        };
    } else if (action.type == DB_SAVE_ERROR) {
        return {
            ...state,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: true,

            finishedOperation: true,
            errorOcurred: true,
        };
    } else if (action.type == DB_SYNCHRONIZE_OK) {
        return {
            ...state,
            finishedOperation: true,
            errorOcurred: false,
            lastUpdate: action.lastUpdate,
            isSync: action.isSync,
            data: action.data,
        };
    } else if (action.type == DB_SYNCHRONIZE_ERROR) {
        return {
            ...state,
            finishedOperation: true,
            errorOcurred: true,
            lastUpdate: action.lastUpdate,
            isSync: action.isSync,
            data: action.data,
        };
    } else if (action.type == DB_SYNC_CACHE_EMPTY) {
        return {
            ...state,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: false,
        };
    } else if (action.type == DB_SYNC_CACHE_ERROR) {
        return {
            ...state,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: true,
        };
    } else if (action.type == DB_SYNC_CACHE_OK) {
        return {
            ...state,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: false,
            lastUpdate: action.lastUpdate,
            filaOperacoesParaEnviar: action.filaOperacoesParaEnviar,
            data: action.data,
        };
    } else {
        return state;
    }
};
