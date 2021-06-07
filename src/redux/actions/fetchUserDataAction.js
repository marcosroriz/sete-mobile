import firebase from "firebase";
import { USER_STATE_CHANGE } from "../constants/index";

export function fetchUserDataAction(uid) {
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
                } else {
                    console.log("does not exist")
                }
            })
    })
}