import { LOCATION_TRACK_START, LOCATION_TRACK_UPDATE, LOCATION_TRACK_END, LOCATION_TRACK_NOT_STARTED } from "../constants/index";

const initialState = {
    locationTrackData: [],
    locationTrackStatus: LOCATION_TRACK_NOT_STARTED
}

export const location = (state = initialState, action) => {
    console.log(action.type)
    if (action.type == LOCATION_TRACK_START) {
        console.log("START", state)
        console.log("START", action)
        return {
            ...state,
            locationTrackData: [],
            locationTrackStatus: LOCATION_TRACK_START
        }
    } else if (action.type == LOCATION_TRACK_UPDATE) {
        console.log("UPDATE", state)
        console.log("UPDATE", action)
        return {
            ...state,
            locationTrackData: [...action.data],
            locationTrackStatus: LOCATION_TRACK_UPDATE
        }
    } else if (action.type == LOCATION_TRACK_END) {
        console.log("END", state)
        console.log("END", action)
        return {
            ...state,
            locationTrackData: action.data,
            locationTrackStatus: LOCATION_TRACK_END
        }
    } else {
        return state;
    }
}

