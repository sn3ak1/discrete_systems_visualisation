
import { initializeApp } from "firebase/app";
import { getFirestore, getCollections } from "firebase/firestore";
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDkGkuaI5rVYUBdr4zPJW7D7cBKkSJt_o4",
    authDomain: "discrete2-8b6a7.firebaseapp.com",
    projectId: "discrete2-8b6a7",
    storageBucket: "discrete2-8b6a7.appspot.com",
    messagingSenderId: "900918646172",
    appId: "1:900918646172:web:fdb0aca4c49496e410e459"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function fetchGpsDevicesNames() {
    const docGps = await getDoc(doc(db, "Devices", "devicesGPS"));
    const devicesGps = await docGps.get("devices");
    localStorage.setItem("devicesGps", JSON.stringify(devicesGps));
    return devicesGps;
}

export async function fetchBleDevicesNames() {
    const docBle = await getDoc(doc(db, "Devices", "devicesBluetooth"));
    const devicesBle = await docBle.get("devices");
    localStorage.setItem("devicesBle", JSON.stringify(devicesBle));
    return devicesBle;
}

async function getData(deviceType, devices) {
    const data = {};
    for (let device of devices) {
        const docs = await getDocs(collection(db, `Devices/${deviceType}/${device}`));
        const timestamps = [];
        docs.forEach((doc) => {
            timestamps.push(doc.data());
        });
        data[device] = timestamps;
    }
    return data;
}

export async function fetchBleData(devices) {
    const data = await getData("Bluetooth", devices);
    localStorage.setItem("BLE", JSON.stringify(data));
    return data;
}

export async function fetchGpsData(devices) {
    const data = await getData("GPS", devices);
    localStorage.setItem("GPS", JSON.stringify(data));
    return data;
}

export function getGpsDevicesNames() {
    return JSON.parse(localStorage.getItem("devicesGps"));
}

export function getBleDevicesNames() {
    return JSON.parse(localStorage.getItem("devicesBle"));
}

export function getGpsData() {
    return JSON.parse(localStorage.getItem("GPS"));
}

export function getBleData() {
    return JSON.parse(localStorage.getItem("BLE"));
}

export function isDataFetched() {
    if (getGpsDevicesNames() == null) {
        return false;
    } else {
        return true;
    }
}
