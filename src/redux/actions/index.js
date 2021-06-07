import * as firebase from "firebase";
import 'firebase/firestore';
import { USER_STATE_CHANGE } from "../constants/index";
import { DB_SYNCHRONIZE_OK } from "../constants/index";
import { DB_SYNCHRONIZE_ERROR } from "../constants/index";

export function fetchUser(uid) {
    return (dispatch => {
        console.log("ACTION uid", uid)
        firebase.firestore()
            .collection("users")
            .doc(uid)
            .get({ source: "server" })
            .then(res => {
                console.log("peguei o dado", res.data())
                if (res.exists) {
                    dispatch({
                        type: USER_STATE_CHANGE,
                        currentUser: res.data(),
                        isLogged: true
                    })
                } else {
                    console.log("does not exist")
                }
            })
    })
}

let lastUp = undefined;


export function dbSynchronize() {
    return ((dispatch, getState) => {
        console.log("VALOR DE GESTSATE", getState())
        let codCidade = getState().userState.currentUser["COD_CIDADE"];
        console.log("COD CIDADE", codCidade);

        if (lastUp == undefined) {
            console.log("LAST UPDATE NULO")
            dispatch({
                type: DB_SYNCHRONIZE_ERROR,
                lastUpdate: "FF",
                isSync: false
            })
            lastUp = true;
        } else {
            console.log("LAST UPDATE OK")
            dispatch({
                type: DB_SYNCHRONIZE_OK,
                lastUpdate: "fafas",
                isSync: true
            })
        }
    })
}