import { combineReducers } from "redux";
import { usuario } from "./usuario";
import { db } from "./db";
import { location } from "./location";

const Reducers = combineReducers({
    locState: location,
    usuario: usuario,
    db: db,
});

export default Reducers;
