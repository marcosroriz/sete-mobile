import * as firebase from "firebase";
import 'firebase/firestore';
import {
    DB_CLEAR, DB_SYNCHRONIZE_OK, DB_SYNCHRONIZE_ERROR,
    DB_SAVE_OK, DB_SAVE_ERROR
} from "../constants/index";

// Tabelas (coleções) do banco de dados
const DB_TABLES = ["status", "alunos", "escolas", "escolatemalunos", "fornecedores",
    "faztransporte", "garagem", "garagemtemveiculo", "motoristas", "municipios",
    "ordemdeservico", "rotas", "rotaatendealuno", "rotadirigidapormotorista",
    "rotapassaporescolas", "rotapossuiveiculo", "veiculos"]

// Nome da coleção raiz que armazena os dados no firebase
const COLECAO_RAIZ = "municipios";

// Ultima vez que atualizamos a base de dados
let lastUpdate = undefined;

// Cópia da base de dados do firebase
let dbSnapshot = undefined;

// Função básica que acessa/recupera uma determinada colecao
function dbAcessarDados(codCidade, nomeColecao) {
    return firebase.firestore()
        .collection(COLECAO_RAIZ)
        .doc(codCidade)
        .collection(nomeColecao)
}

// Ação para limpar outra ações e indicar que iremos inicializar uma ação
export function dbClearAction() {
    return ((dispatch) => { dispatch({ type: DB_CLEAR }) })
}

// Ação para sincronizar a base de dados dentro do app 
export function dbSaveAction(collection, id, payload) {
    return ((dispatch, getState) => {
        // Pegamos o código da cidade para buscar a base dentro do firebase
        let codCidade = getState().userState.currentUser["COD_CIDADE"];

        // Promessas que vamos executar aqui no firebase
        let promisses = new Array();

        // Salvar o dado
        // Verificar se o objeto que vamos salvar já tem um ID
        if (id != "" || id != undefined || id != null) {
            promisses.push(dbAcessarDados(codCidade, collection).doc(id).set(payload))
        } else {
            // Não tem ID
            promisses.push(dbAcessarDados(codCidade, collection).add(payload))
        }

        // Promessa para atualizar a base
        let novoLastUpdate = new Date().toJSON()
        promisses.push(dbAcessarDados(codCidade, "status").doc("atualizacao").set({ LAST_UPDATE: novoLastUpdate }))

        // Executa promisses
        Promise.all(promisses)
            .then(() => {
                // Operação concluída com sucesso
                lastUpdate = novoLastUpdate;

                // Adiciona na nossa base
                if (dbSnapshot) {
                    if (id != "" || id != undefined || id != null && dbSnapshot) {
                        dbSnapshot[collection][id] = payload;
                        dbSnapshot["status"]["atualizacao"] = { LAST_UPDATE: novoLastUpdate };
                    }
                }

                // Despacha para atualizar o estado do app
                dispatch({
                    type: DB_SAVE_OK,
                    "lastUpdate": novoLastUpdate,
                    "data": dbSnapshot,
                })
            })
            .catch((err) => {
                // Ocorreu um erro ao tentar salvar o dado
                console.error("ERRO AO TENTAR SALVAR O DADO", err)
                dispatch({
                    type: DB_SAVE_ERROR,
                })
            })
    })
}

// Ação para sincronizar a base de dados dentro do app 
export function dbSynchronizeAction() {
    return ((dispatch, getState) => {
        console.log("INIT SYNC")
        // Pegamos o código da cidade para buscar a base dentro do firebase
        let codCidade = getState().userState.currentUser["COD_CIDADE"];
        let stateLastUpdate = getState().dbState.lastUpdate;
        let stateDBSnapshot = getState().dbState.data;

        if (lastUpdate == undefined || lastUpdate == null || lastUpdate == '') {
            lastUpdate = stateLastUpdate;
        }

        if (dbSnapshot == undefined || dbSnapshot == null || dbSnapshot == {}) {
            dbSnapshot = stateDBSnapshot;
        }

        // Vamos verificar se precisamos atualizar, para isso olharemos o campo "status"
        // dentro da firebase e checaremos se é equivalente ao que temos aqui (lastUpdate)
        dbAcessarDados(codCidade, "status")
            .get({ source: "server" })
            .then((resStatus) => {
                let isSynced = false;

                // Verifica o documento status dentro do firebase
                if (resStatus.docs.length != 0) {
                    let lastUpdateServer = resStatus.docs[0].data()["LAST_UPDATE"];

                    // Bate com a última vez que atualizamos?
                    if (lastUpdate == lastUpdateServer) {
                        isSynced = true;
                    }
                    console.log("LASTUPDATE COMPARACAO")
                    console.log(lastUpdate, lastUpdateServer)
                }


                return isSynced;
            })
            .then((isSynced) => {
                console.log("BAIXAR DADOS");
                console.log("VALOR DE IS SINC?", isSynced);
                if (!isSynced) {
                    // Precisamos atualizar a cópia do nosso firebase
                    // Promessas para buscar dados no firebase
                    let syncPromisses = new Array();
                    DB_TABLES.forEach(db => {
                        syncPromisses.push(dbAcessarDados(codCidade, db).get({ source: "server" }))
                    })

                    return Promise.all(syncPromisses);
                } else {
                    console.log("JÁ ESTÁ SINCRONIZADO");
                    // Já está sincronizado, não precisamos sincronizar
                    return Promise.reject("ALREADY_SYNC");
                }
            })
            .then((syncPromisses) => {
                // Recuperamos a base de dados, vamos colocar em um objeto do app

                // Base que vamos colocar os dados
                let dbSnapshot = {};

                // Adiciona os documentos da coleção a dbSnapshot
                for (var [key, value] of Object.entries(syncPromisses)) {
                    let dados = new Array();
                    value.forEach(documento => dados.push({
                        ...{ ID: documento.id },
                        ...documento.data()
                    }))

                    dbSnapshot[DB_TABLES[key]] = dados;
                }

                // Verifica se já foi feito alguma sincronização
                if ("status" in dbSnapshot && dbSnapshot["status"]?.length != 0) {
                    lastUpdate = dbSnapshot["status"][0]["LAST_UPDATE"];
                } else {
                    lastUpdate = "SEM_SYNC";
                }

                // Despacha para atualizar o estado do app
                dispatch({
                    type: DB_SYNCHRONIZE_OK,
                    "lastUpdate": lastUpdate,
                    "isSync": true,
                    "data": dbSnapshot
                })
            })
            .catch((err) => {
                // Ocorreu um erro ao tentar sincronizar os dados
                console.error("ERRO AO TENTAR BUSCAR A BASE", err)

                if (err == "ALREADY_SYNC") {
                    // Não precisa sincronizar, já temos o último estado da base
                    dispatch({
                        type: DB_SYNCHRONIZE_OK,
                        "lastUpdate": lastUpdate,
                        "isSync": true,
                        "data": dbSnapshot
                    })
                } else {
                    // Despachar mensagem pro app relatando que ocorreu erro
                    lastUpdate = undefined;

                    dispatch({
                        type: DB_SYNCHRONIZE_ERROR,
                        "lastUpdate": lastUpdate,
                        "isSync": false,
                        "data": dbSnapshot
                    })
                }
            })
    })
}