import {
    DB_CLEAR, DB_SYNCHRONIZE_OK, DB_SYNCHRONIZE_ERROR,
    DB_SAVE_OK, DB_SAVE_ERROR
} from "../constants/index";

const initialState = {
    lastUpdate: null,
    isSync: false,
    finishedOperation: false,
    errorOcurred: false,
    data: {}
}

export const db = (state = initialState, action) => {
    if (action.type == DB_CLEAR) {
        return {
            ...state,
            finishedOperation: false,
            errorOcurred: false,
        }
    } else if (action.type == DB_SAVE_OK) {
        return {
            ...state,
            finishedOperation: true,
            errorOcurred: false,
            lastUpdate: action.lastUpdate,
            data: action.data
        }
    } else if (action.type == DB_SAVE_ERROR) {
        return {
            ...state,
            finishedOperation: true,
            errorOcurred: true
        }
    } else if (action.type == DB_SYNCHRONIZE_OK) {
        return {
            ...state,
            finishedOperation: true,
            errorOcurred: false,
            lastUpdate: action.lastUpdate,
            isSync: action.isSync,
            data: action.data
        }
    } else if (action.type == DB_SYNCHRONIZE_ERROR) {
        return {
            ...state,
            finishedOperation: true,
            errorOcurred: true,
            lastUpdate: action.lastUpdate,
            isSync: action.isSync,
            data: action.data,
        }
    } else {
        return state;
    }
}

