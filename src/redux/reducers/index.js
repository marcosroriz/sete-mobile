import { combineReducers  } from "redux";
import { user } from "./user";
import { db } from "./db";

const Reducers = combineReducers({
    userState: user,
    dbState: db
})

export default Reducers;