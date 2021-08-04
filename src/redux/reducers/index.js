import { combineReducers } from "redux";
import { usuario } from "./usuario";
import { db } from "./db";
import { localizacao } from "./localizacao";

const Reducers = combineReducers({
    localizacao: localizacao,
    usuario: usuario,
    db: db,
});

export default Reducers;
