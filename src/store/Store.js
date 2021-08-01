// Store.js
// Configure redux, including middleware (thunk) and persistence

// Basic Imports
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Our reducers
import rootReducer from "../redux/reducers";

// Persistence
import { persistStore, persistReducer } from "redux-persist";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  // stateReconciler: hardSet,
  blacklist: ["usuario"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Redux Store and Persistor
// export const store = createStore(persistedReducer, applyMiddleware(thunk));
// export const persistor = persistStore(store);

// // Redux Store and Persistor
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(thunk)));
export const persistor = persistStore(store);
