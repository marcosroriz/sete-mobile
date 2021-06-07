import * as firebase from "firebase";
import 'firebase/firestore';
import { DB_SAVE_OK } from "../constants/index";
import { DB_SAVE_ERROR } from "../constants/index";


// Nome da coleção raiz que armazena os dados no firebase
const COLECAO_RAIZ = "municipios";

// Ultima vez que atualizamos a base de dados
let lastUpdate = undefined;

// Função básica que acessa/recupera uma determinada colecao
function dbAcessarDados(codCidade, nomeColecao) {
    return firebase.firestore()
                   .collection(COLECAO_RAIZ)
                   .doc(codCidade)
                   .collection(nomeColecao)
}

// Ação para sincronizar a base de dados dentro do app 
export function dbSaveAction(collection, id, payload) {
    return ((dispatch, getState) => {
        // Pegamos o código da cidade para buscar a base dentro do firebase
        let codCidade = getState().userState.currentUser["COD_CIDADE"];

        // Promessas que vamos executar aqui no firebase
        let firebasePromises;
        
        // Verificar se o objeto que vamos salvar já tem um ID
        if (id != "" || id != undefined || id != null) {
            // Tem ID
            dbAcessarDados(codCidade, collection)
        } else {
            // Não tem ID
            dbAcessarDados(codCidade, collection)

        }
        // Vamos verificar se precisamos atualizar, para isso olharemos o campo "status"
        // dentro da firebase e checaremos se é equivalente ao que temos aqui (lastUpdate)
        dbAcessarDados(codCidade, "status")
        .doc
        .then((resStatus) => {
            let isSynced = false;
            
            // Verifica o documento status dentro do firebase
            if (resStatus.docs.length != 0) {
                let lastUpdateServer = resStatus.docs[0].data()["LAST_UPDATE"];

                // Bate com a última vez que atualizamos?
                if (lastUpdate == lastUpdateServer) {
                    isSynced = true;
                }
            }
            
            return isSynced;
        })
        .then((isSynced) => {
            if (!isSynced) {
                // Precisamos atualizar a cópia do nosso firebase
                // Promessas para buscar dados no firebase
                let syncPromisses = new Array();
                DB_TABLES.forEach(db => syncPromisses.push(dbAcessarDados(codCidade, db)))

                return Promise.all(syncPromisses);
            } else {
                // Já está sincronizado, não precisamos sincronizar
                return Promise.reject("ALREADY_SYNC");
            }
        })
        .then((syncPromisses) => {
            // Recuperamos a base de dados, vamos colocar em um objeto do app
            console.log("CHEGOU AQUI");

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
            
            console.log("BAIXOU TODO OS DADOS")
            console.log(dbSnapshot)

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