
import { initializeApp } from "firebase/app";
import { getFirestore, getCollections } from "firebase/firestore";
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBrzfiHgu_LZGq9qniVyxOp5rf7ZqQsOgA",
    authDomain: "discretesystems-fbef2.firebaseapp.com",
    projectId: "discretesystems-fbef2",
    storageBucket: "discretesystems-fbef2.appspot.com",
    messagingSenderId: "355100286047",
    appId: "1:355100286047:web:e7a06fd14996ad7d730fea",
    measurementId: "G-EJJVYYDEY5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function fetchGpsDevicesNames() {
    const docGps = await getDoc(doc(db, "Devices", "GPS"));
    const devicesGps = await docGps.get("devices");
    localStorage.setItem("devicesGps", JSON.stringify(devicesGps));
    return devicesGps;
}

export async function fetchBleDevicesNames() {
    const docBle = await getDoc(doc(db, "Devices", "Bluetooth"));
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
    // console.log(data);
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
        console.log("GPS devices not fetched");
        return false;
    } else {
        console.log("GPS devices fetched");
        return true;
    }
}
