import { LOCATION_TRACK_START, LOCATION_TRACK_UPDATE, LOCATION_TRACK_END, LOCATION_TRACK_NOT_STARTED } from "../constants/index";

let locationTrackData = [];
let locationTrackStatus = LOCATION_TRACK_NOT_STARTED;

export function locationStartTracking() {
    console.log("CHEGUEI NO START TRACKING")
    return (dispatch => {
        locationTrackData = [];
        locationTrackStatus = LOCATION_TRACK_START;

        dispatch({
            type: LOCATION_TRACK_START,
            data: locationTrackData,
            locationTrackStatus
        })
    })
}

export function locationUpdatePosition(locations) {
    return (dispatch => {
        console.log("LOCATION ANTES", locationTrackData.length)
        locations.forEach(loc => locationTrackData.push({
            "latitude": loc.latitude,
            "longitude": loc.longitude
        }))
        locationTrackStatus = LOCATION_TRACK_UPDATE;
        console.log("LOCATION DEPOIS", locationTrackData.length)
        console.log("NOVA VERSAO DO LOCATIONS", locationTrackData)
        dispatch({
            type: LOCATION_TRACK_UPDATE,
            data: locationTrackData,
            locationTrackStatus
        })
    })
}

export function locationStopTracking() {
    return (dispatch => {
        locationTrackStatus = LOCATION_TRACK_END;

        dispatch({
            type: LOCATION_TRACK_END,
            data: locationTrackData,
            locationTrackStatus
        })
    })
}
