import logo from "./logo.svg";

import React, { useState, useEffect, useRef } from "react";

import "./App.css";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getFirestore, getCollections } from "firebase/firestore";

// Initialize Cloud Firestore and get a reference to the service
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";
import { CookiesProvider, useCookies } from 'react-cookie';

import { Canvas } from "./Canvas";
import MapWrapper from "./MapWrapper";
import { NavBar } from "./NavBar";

// openlayers
import GeoJSON from 'ol/format/GeoJSON'

var trilat = require("trilat");


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrzfiHgu_LZGq9qniVyxOp5rf7ZqQsOgA",
  authDomain: "discretesystems-fbef2.firebaseapp.com",
  projectId: "discretesystems-fbef2",
  storageBucket: "discretesystems-fbef2.appspot.com",
  messagingSenderId: "355100286047",
  appId: "1:355100286047:web:e7a06fd14996ad7d730fea",
  measurementId: "G-EJJVYYDEY5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}


// TODO change
let devicesGps;

async function readData() {
  // const querySnapshot = await getDocs(collection(db, "Devices"));
  const docGps = await getDoc(doc(db, "Devices", "GPS"));
  const docBle = await getDoc(doc(db, "Devices", "Bluetooth"));

  devicesGps = docGps.get("devices");
  const devicesBle = docBle.get("devices");

  // console.log(devicesGps);

  localStorage.setItem("devicesGps", JSON.stringify(devicesGps));


  /**
   * Get data from GPS devices for given timestamp and put it in local storage.
   */
  devicesGps.forEach(async (device) => {
    const docs = await getDocs(collection(db, `Devices/GPS/${device}`));
    const a = [];
    docs.forEach((doc) => {
      a.push(doc.data());
    });
    localStorage.setItem("GPS", JSON.stringify(a));
  });

  devicesBle.forEach(async (device) => {
    const docs = await getDocs(collection(db, `Devices/Bluetooth/${device}`));
    const a = [];
    docs.forEach((doc) => {
      a.push(doc.data());
    });
    localStorage.setItem("GPS", JSON.stringify(a));
  });


  const arrayBle = JSON.parse(localStorage.getItem("GPS"));

  let i = 1;
  let points = [];

  arrayBle.forEach((doc) => {
    if (points.length < i) {
      points.push([]);
    }
    points[i - 1].push(doc);
    if (
      points[i - 1].map((doc) => doc.beaconID).filter(onlyUnique).length >= 3
    ) {
      i++;
    }
  });

  let points2 = points.filter((doc) => doc.length > 2);

  // let last = points2[points2.length - 1];
  // console.log(last);
  // if (last.filter(onlyUnique).length < 3) {
  points2.pop();
  // }

  let result = points2.map((point) => {
    // console.log(trilat(meanPoint(point)));
    return trilat(meanPoint(point));
  });

  return result.filter(
    (doc) => doc[0] > 0 && doc[1] > 0 && doc[0] < 10 && doc[1] < 10
  );
}

let meanPoint = (beaconData) => {
  if (beaconData == null) {
    return null;
  }

  let p = [];

  let beacons = beaconData.map((doc) => doc.beaconID).filter(onlyUnique);

  beacons.forEach((beacon) => {
    p.push(beaconData.filter((doc) => doc.beaconID == beacon));
  });

  let mean = [];

  p.forEach((beacon) => {
    mean.push(
      [
        parseFloat(beacon[0].x),
        parseFloat(beacon[0].y),
        beacon.reduce((total, next) => total + next.meters, 0) / beacon.length,
      ]
      //   {
      //   x: parseFloat(beacon[0].x),
      //   y: parseFloat(beacon[0].y),
      //   distance:
      //     beacon.reduce((total, next) => total + next.meters, 0) / beacon.length,
      // }
    );
  });

  return mean;

  // beaconData.filter;
};

function App() {
  const [flag, setFlag] = React.useState(false);
  const data = useRef();
  // set intial state
  const [features, setFeatures] = useState([]);
  const [mapView, setMapView] = useState(true);

  const changeViewClick = () => {
    setMapView(!mapView);
  }

  readData().then((d) => {
    data.current = d;
    setFlag(true);
  });

  // initialization - retrieve GeoJSON features from Mock JSON API get features from mock 
  //  GeoJson API (read from flat .json file in public directory)
  useEffect(() => {

    fetch('../public/mock-geojson-api.json')
      .then(response => response.json())
      .then((fetchedFeatures) => {

        // parse fetched geojson into OpenLayers features
        //  use options to convert feature from EPSG:4326 to EPSG:3857
        const wktOptions = {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        }
        const parsedFeatures = new GeoJSON().readFeatures(fetchedFeatures, wktOptions)

        // set features into state (which will be passed into OpenLayers
        //  map component as props)
        setFeatures(parsedFeatures)

      })

  }, [])

  if (!flag) {
    return <div>Loading...</div>;
  }

  return (
    <CookiesProvider>
      <div className="App">
        <NavBar changeViewHandler={changeViewClick} devices={devicesGps} />


        {!mapView && <Canvas
          data={data.current}
        ></Canvas>}

        {mapView && <div style={{ height: '90vh' }}>
          <MapWrapper
            features={features}></MapWrapper>
        </div>}

      </div>
    </CookiesProvider>

  );
}

export default App;
