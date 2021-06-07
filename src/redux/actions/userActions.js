import firebase from "firebase";
import { USER_STATE_CHANGE } from "../constants/index";

export function finishLoginUserAction(uid) {
    return (dispatch => {
        firebase.firestore()
            .collection("users")
            .doc(uid)
            .get({ source: "server" })
            .then(res => {
                if (res.exists) {
                    dispatch({
                        type: USER_STATE_CHANGE,
                        currentUser: res.data(),
                        isLogged: true
                    })
                }
            })
    })
}


export function logoutAction() {
    return (dispatch => {
        firebase.auth()
            .signOut()
            .then(
                dispatch({
                    type: USER_STATE_CHANGE,
                    currentUser: undefined,
                    isLogged: false
                })
            )
    })
}