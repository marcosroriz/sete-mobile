/**
 * Reducers db.js
 *
 * Este arquivo inclui os reducers da base de dados.
 * Basicamente quando recebemos uma ação incluimos o estado e a ação dentro da base de dados.
 * Também fazemos a checagem e colocamos os flags correspondentes (e.g., terminouOperacaoComErro, terminouOperacaoNoCache, etc)
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {
    DB_LIMPAR_ACOES,
    DB_SINCRONIZACAO_COMPLETA_INTERNET,
    DB_SINCRONIZACAO_COMPLETA_CACHE,
    DB_SINCRONIZACAO_ERRO,
    DB_SALVAR_COMPLETO_INTERNET,
    DB_SALVAR_COMPLETO_CACHE,
    DB_SALVAR_ERROR,
    DB_OPERACOES_PENDENTES_VAZIA,
    DB_OPERACOES_PENDENTES_ENVIADAS,
    DB_OPERACOES_PENDENTES_ERRO,
} from "../constants/index";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// ESTADO INICIAL /////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const estadoInicial = {
    dataUltimoUpdate: null,
    estaSincronizado: false,

    terminouOperacao: false,
    terminouOperacaoNaInternet: false,
    terminouOperacaoNoCache: false,
    terminouOperacaoComErro: false,

    filaOperacoesParaEnviar: [],
    dados: {},
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// REDUCER ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const db = (estado = estadoInicial, acao) => {
    if (acao.type == DB_LIMPAR_ACOES) {
        return {
            ...estado,

            terminouOperacao: false,
            terminouOperacaoNaInternet: false,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: false,
        };
    } else if (acao.type == DB_SINCRONIZACAO_COMPLETA_INTERNET) {
        return {
            ...estado,
            ...acao,

            terminouOperacao: true,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: false,
        };
    } else if (acao.type == DB_SINCRONIZACAO_COMPLETA_CACHE) {
        return {
            ...estado,
            ...acao,

            terminouOperacao: true,
            terminouOperacaoNaInternet: false,
            terminouOperacaoNoCache: true,
            terminouOperacaoComErro: false,
        };
    } else if (acao.type == DB_SINCRONIZACAO_ERRO) {
        return {
            ...estado,
            ...acao,

            terminouOperacao: true,
            terminouOperacaoNaInternet: false,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: true,
        };
    } else if (acao.type == DB_SALVAR_COMPLETO_CACHE) {
        return {
            ...estado,
            ...acao,

            terminouOperacao: true,
            terminouOperacaoNaInternet: false,
            terminouOperacaoNoCache: true,
            terminouOperacaoComErro: false,
        };
    } else if (acao.type == DB_SALVAR_COMPLETO_INTERNET) {
        return {
            ...estado,
            ...acao,

            terminouOperacao: true,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: false,
        };
    } else if (acao.type == DB_SALVAR_ERROR) {
        return {
            ...estado,
            ...acao,

            terminouOperacao: true,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: true,
        };
    } else if (acao.type == DB_OPERACOES_PENDENTES_VAZIA) {
        return {
            ...estado,
            ...acao,

            terminouOperacao: true,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: false,
        };
    } else if (acao.type == DB_OPERACOES_PENDENTES_ERRO) {
        return {
            ...estado,

            terminouOperacao: true,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: true,
        };
    } else if (acao.type == DB_OPERACOES_PENDENTES_ENVIADAS) {
        return {
            ...estado,
            ...acao,

            terminouOperacao: true,
            terminouOperacaoNaInternet: true,
            terminouOperacaoNoCache: false,
            terminouOperacaoComErro: false,
        };
    } else {
        return estado;
    }
};
