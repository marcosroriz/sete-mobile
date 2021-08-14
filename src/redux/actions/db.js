/**
 * Ações db.js
 *
 * Este arquivo inclui as ações que manipulam a base de dados.
 * Incluindo operações para sincronizar, salvar e enviar operações pendentes par a base de dados.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// IMPORTS ////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import * as firebase from "firebase";
import "firebase/firestore";
import {
    DB_LIMPAR_ACOES,
    DB_SINCRONIZACAO_COMPLETA_INTERNET,
    DB_SINCRONIZACAO_COMPLETA_CACHE,
    DB_SINCRONIZACAO_ERRO,
    DB_SYNC_CACHE_ERROR,
    DB_SALVAR_COMPLETO_INTERNET,
    DB_SALVAR_COMPLETO_CACHE,
    DB_SALVAR_ERROR,
    DB_OPERACOES_PENDENTES_VAZIA,
    DB_OPERACOES_PENDENTES_ENVIADAS,
    DB_OPERACOES_PENDENTES_ERRO,
} from "../constants/index";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// CONFIGURAÇÕES E VARIÁVEIS //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Tabelas (coleções) do banco de dados
const DB_TABELAS = [
    "status",
    "alunos",
    "escolas",
    "escolatemalunos",
    "fornecedores",
    "faztransporte",
    "garagem",
    "garagemtemveiculo",
    "motoristas",
    "municipios",
    "ordemdeservico",
    "rotas",
    "rotaatendealuno",
    "rotadirigidapormotorista",
    "rotapassaporescolas",
    "rotapossuiveiculo",
    "veiculos",
    "viagenspercurso",
    "viagensalertas",
];

// Nome da coleção raiz que armazena os dados no firebase
const COLECAO_RAIZ = "municipios";

// Ultima vez que atualizamos a base de dados
let dataUltimoUpdate = undefined;

// Operações não foram enviadas
let filaOperacoesParaEnviar = [];

// Cópia da base de dados do firebase
let dbSnapshot = undefined;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// FUNÇÕES INTERNAS ///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Função básica que acessa/recupera uma determinada colecao
function __dbAcessarDados(codCidade, nomeColecao) {
    return firebase.firestore().collection(COLECAO_RAIZ).doc(codCidade).collection(nomeColecao);
}

/**
 * Função que expande a base de dados com as alterações vindas das operações
 * @param {Array} operacoes vetor de operações que serão adicionados na nossa base
 */
function __expandeBaseDados(operacoes) {
    operacoes.forEach(({ collection, id, payload }) => {
        // console.log("--------------------------------------");
        // console.log("COLLECTION", collection);
        // console.log("ID", id);
        // console.log("ANTES");
        let dataIndex = dbSnapshot[collection].findIndex((obj) => obj.ID == id);
        // console.log(dbSnapshot[collection][dataIndex]);
        // console.log("-------");
        // console.log("DEPOIS");
        if (id != "" || id != undefined || (id != null && dbSnapshot)) {
            if (dbSnapshot[collection][dataIndex]) {
                dbSnapshot[collection][dataIndex] = {
                    ...dbSnapshot[collection][dataIndex],
                    ...payload,
                };
            } else {
                dbSnapshot[collection][dataIndex] = payload;
            }
        }
    });
}

/**
 * Função que prepara o envio de um conjunto de operações para a base de dados. Retorna uma promise com todos os envios.
 * @param {Number} codCidade codigo da cidade
 * @param {Array} operacoes array de operações
 * @param {Date} updateTimestamp o tempo em que
 * @returns {Array<Promise>} vetor de promessas
 */
function __preparaEnvioDados(codCidade, operacoes, updateTimestamp) {
    // Promessas que vamos executar aqui no firebase
    let promisses = new Array();

    // Vamos salvar o dado de cada operacao
    operacoes.forEach(({ collection, id, payload }) => {
        // Verificar se o objeto que vamos salvar já tem um ID
        if (id != "" || id != undefined || id != null) {
            promisses.push(__dbAcessarDados(codCidade, collection).doc(id).set(payload, { merge: true }));
        } else {
            // Não tem ID
            promisses.push(__dbAcessarDados(codCidade, collection).add(payload));
        }
    });

    // Promessa para atualizar a base
    promisses.push(__dbAcessarDados(codCidade, "status").doc("atualizacao").set({ LAST_UPDATE: updateTimestamp }));

    return promisses;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// AÇÕES //////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Ação para limpar outra ações e indicar que iremos inicializar uma ação *
 */
export function dbLimparAcoes() {
    return (dispatch) => {
        dispatch({ type: DB_LIMPAR_ACOES });
    };
}

/**
 * Esta ação envia todas as operações pendentes para o Firebase
 */
export function dbEnviaOperacoesPendentes() {
    return (dispatch, getState) => {
        // Vamos verificar se há operações a serem enviadas
        let estadoOperacoesPendentes = getState().db.filaOperacoesParaEnviar;

        // Vamos verificar se o usuário está conectado a Internet
        let estaConectado = getState().usuario.estaConectadoInternet;

        // Caso o usuário não tenha nenhuma operação pendente, terminamos
        if (estadoOperacoesPendentes == [] || estadoOperacoesPendentes.length == 0) {
            dispatch({
                type: DB_OPERACOES_PENDENTES_VAZIA,
            });
        } else if (!estaConectado) {
            // Caso o usuário tenha algo a enviar, mas não esteja conectado dispare um erro pra UI
            dispatch({
                type: DB_OPERACOES_PENDENTES_ERRO,
            });
        } else {
            // Caso esteja conectado e tenha algo a enviar, fazemos o envio
            // Pegamos o código da cidade para buscar a base dentro do firebase
            let codCidade = getState().usuario.usuarioAtual["COD_CIDADE"];

            // Nova data para a última modificação
            let novaDataUltimoUpdate = new Date().toJSON();

            // Promessas que vamos executar aqui no firebase
            let promisses = __preparaEnvioDados(codCidade, estadoOperacoesPendentes, novaDataUltimoUpdate);

            Promise.all(promisses)
                .then(() => {
                    // Operação concluída com sucesso, atualiza a data do último update
                    dataUltimoUpdate = novaDataUltimoUpdate;
                    dbSnapshot["status"]["atualizacao"] = { LAST_UPDATE: novaDataUltimoUpdate };

                    // Limpa fila de operações pendentes
                    filaOperacoesParaEnviar = [];

                    // Despacha para atualizar o estado do app
                    dispatch({
                        type: DB_OPERACOES_PENDENTES_ENVIADAS,
                        dataUltimoUpdate: novaDataUltimoUpdate,
                        filaOperacoesParaEnviar: [],
                        dados: dbSnapshot,
                    });
                })
                .catch((err) => {
                    dispatch({
                        type: DB_SYNC_CACHE_ERROR,
                    });
                });
        }
    };
}

/**
 * Ação para salvar um conjunto de operações. Cada objeto operação deve ter o seguinte formato:
 * Exemplo de operação
 * {
 *    collection: "alunos", // NOME_DA_COLECAO
 *    id: "XYZ", // ID_DA_ENTIDADE
 *    payload: {
 *        LOC_LATITUDE: -44.24323,
 *        LOC_LONGITUDE: -23.23434,
 *    }
 * }
 *
 * As operações podem ser enviadas para Internet ou serem cacheadas.
 * Caso ocorra algum erro, a ação notifica a APP
 *
 * @param {Array<Object>} operacoes as operações a serem salvas
 * @param {Boolean} atualizaDataServidor se devemos ou não forçar o envio de uma nova data de atualização ao servidor ao salvar os dados
 */
export function dbSalvar(operacoes, atualizaDataServidor = true) {
    return (dispatch, getState) => {
        // Vamos verificar se o usuário está conectado a Internet
        let estaConectado = getState().usuario.estaConectadoInternet;

        // Caso o usuário não esteja conectado, armazenamos a modificação
        if (!estaConectado) {
            filaOperacoesParaEnviar.push(...operacoes);

            // Adiciona na nossa base
            __expandeBaseDados(operacoes);

            dispatch({
                type: DB_SALVAR_COMPLETO_CACHE,
                dados: dbSnapshot,
                filaOperacoesParaEnviar: [...filaOperacoesParaEnviar],
            });
        } else {
            // Caso contrário, usuário está conectado, fazemos a modificação

            // Pegamos o código da cidade para buscar a base dentro do firebase
            let codCidade = getState().usuario.usuarioAtual["COD_CIDADE"];

            // Nova data para a última modificação
            // Assume que é a última data, a não ser que tenhamos que atualizar
            let novaDataUltimoUpdate = dataUltimoUpdate;
            if (atualizaDataServidor) {
                novaDataUltimoUpdate = new Date().toJSON();
            }

            // Promessas que vamos executar aqui no firebase
            let promisses = __preparaEnvioDados(codCidade, operacoes, novaDataUltimoUpdate);

            // Executa promisses
            Promise.all(promisses)
                .then(() => {
                    // Operação concluída com sucesso, atualiza a data do último update
                    dataUltimoUpdate = novaDataUltimoUpdate;
                    dbSnapshot["status"]["atualizacao"] = { LAST_UPDATE: novaDataUltimoUpdate };

                    // Adiciona na nossa base
                    __expandeBaseDados(operacoes, novaDataUltimoUpdate);

                    // Despacha para atualizar o estado do app
                    dispatch({
                        type: DB_SALVAR_COMPLETO_INTERNET,
                        dataUltimoUpdate: novaDataUltimoUpdate,
                        dados: dbSnapshot,
                    });
                })
                .catch((err) => {
                    // Ocorreu um erro ao tentar salvar o dado
                    console.error("ERRO AO TENTAR SALVAR O DADO", err);
                    dispatch({
                        type: DB_SALVAR_ERROR,
                    });
                });
        }
    };
}

/**
 * Ação para sincronizar a base de dados dentro do app
 */
export function dbSincronizar() {
    return (dispatch, getState) => {
        // Pegamos o código da cidade para buscar a base dentro do firebase
        let codCidade = getState().usuario.usuarioAtual["COD_CIDADE"];
        let cacheDataUltimoUpdate = getState().db.dataUltimoUpdate;
        let cacheDBSnapshot = getState().db.dados;

        if (dataUltimoUpdate == undefined || dataUltimoUpdate == null || dataUltimoUpdate == "") {
            dataUltimoUpdate = cacheDataUltimoUpdate;
        }

        if (dbSnapshot == undefined || dbSnapshot == null || dbSnapshot == {}) {
            dbSnapshot = cacheDBSnapshot;
        }

        // Vamos verificar se precisamos atualizar, para isso olharemos o campo "status"
        // dentro da firebase e checaremos se é equivalente ao que temos aqui (lastUpdate)
        __dbAcessarDados(codCidade, "status")
            .get({ source: "server" })
            .then((resStatus) => {
                let estaSincronizado = false;

                // Somente se o snapshot não estiver vazio que fazemos a checagem se está atualizado
                // Pois se o snapshot está vazio, já sabemos que não está sincronizado (estaSincronizado = false) como descrito
                if (cacheDBSnapshot != undefined && cacheDBSnapshot != {} && Object.keys(cacheDBSnapshot).length != 0) {
                    // Verifica o documento status dentro do firebase
                    if (resStatus.docs.length != 0) {
                        let dataUltimoUpdateNoServidor = resStatus.docs[0].data()["LAST_UPDATE"];

                        // Bate com a última vez que atualizamos?
                        if (dataUltimoUpdate == dataUltimoUpdateNoServidor) {
                            estaSincronizado = true;
                        }
                        console.log("LASTUPDATE COMPARACAO");
                        console.log(dataUltimoUpdate, dataUltimoUpdateNoServidor);
                    }
                }

                return estaSincronizado;
            })
            .then((estaSincronizado) => {
                if (!estaSincronizado) {
                    // Precisamos atualizar a cópia do nosso firebase
                    // Promessas para buscar dados no firebase
                    let syncPromessas = new Array();
                    DB_TABELAS.forEach((db) => {
                        syncPromessas.push(__dbAcessarDados(codCidade, db).get({ source: "server" }));
                    });

                    return Promise.all(syncPromessas);
                } else {
                    // Já está sincronizado, não precisamos sincronizar
                    return Promise.reject("ALREADY_SYNC");
                }
            })
            .then((syncPromessas) => {
                // Recuperamos a base de dados, vamos colocar em um objeto do app

                // Base que vamos colocar os dados
                dbSnapshot = {};

                // Adiciona os documentos da coleção a dbSnapshot
                for (var [key, value] of Object.entries(syncPromessas)) {
                    let dadosDocumento = new Array();
                    value.forEach((documento) =>
                        dadosDocumento.push({
                            ...{ ID: documento.id },
                            ...documento.data(),
                        })
                    );

                    dbSnapshot[DB_TABELAS[key]] = dadosDocumento;
                }

                // Verifica se já foi feito alguma sincronização
                if ("status" in dbSnapshot && dbSnapshot["status"]?.length != 0) {
                    dataUltimoUpdate = dbSnapshot["status"][0]["LAST_UPDATE"];
                } else {
                    dataUltimoUpdate = "SEM_SYNC";
                }

                // Despacha para atualizar o estado do app
                dispatch({
                    type: DB_SINCRONIZACAO_COMPLETA_INTERNET,

                    dataUltimoUpdate: dataUltimoUpdate,
                    estaSincronizado: true,
                    dados: dbSnapshot,
                });
            })
            .catch((err) => {
                // Ocorreu um erro ao tentar sincronizar os dados
                if (err == "ALREADY_SYNC") {
                    // Não precisa sincronizar, já temos o último estado da base
                    dispatch({
                        type: DB_SINCRONIZACAO_COMPLETA_CACHE,

                        dataUltimoUpdate: dataUltimoUpdate,
                        estaSincronizado: true,
                        dados: dbSnapshot,
                    });
                } else {
                    // Despachar mensagem pro app relatando que ocorreu erro
                    dataUltimoUpdate = undefined;

                    dispatch({
                        type: DB_SINCRONIZACAO_ERRO,

                        dataUltimoUpdate: dataUltimoUpdate,
                        estaSincronizado: false,
                        dados: dbSnapshot,
                        erro: err,
                    });
                }
            });
    };
}
