import { USER_STATE_CHANGE } from "../constants/index";

const initialState = {
    currentUser: null,
    isLogged: false
}

export const user = (state = initialState, action) => {
    console.log(action.type)
    if (action.type == USER_STATE_CHANGE) {
        return {
            ...state,
            currentUser: action.currentUser,
            isLogged: action.isLogged
        }
    } else {
        return state;
    }
}