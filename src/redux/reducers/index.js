import { combineReducers  } from "redux";
import { user } from "./user";
import { db } from "./db";
import { location } from "./location";

const Reducers = combineReducers({
    locState: location,
    userState: user,
    dbState: db,
})

export default Reducers;