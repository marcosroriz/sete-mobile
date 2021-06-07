// Store.js
// Configure redux, including middleware (thunk) and persistence

// Basic Imports
import { createStore, applyMiddleware } from 'redux';
import thunk from "redux-thunk";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Our reducers
import rootReducer from "../redux/reducers"

// Persistence
import { persistStore, persistReducer } from 'redux-persist';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    // stateReconciler: hardSet,
    blacklist: ["userState"]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Redux Store and Persistor
export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);