import logo from "./logo.svg";

import React, { useEffect, useRef } from "react";

import "./App.css";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getFirestore } from "firebase/firestore";

// Initialize Cloud Firestore and get a reference to the service
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";

import { Canvas } from "./Canvas";

var trilateration = require("node-trilateration");

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

async function readData() {
  const querySnapshot = await getDocs(collection(db, "Oclean X"));
  let array = [];
  querySnapshot.forEach((doc) => {
    array.push(doc.data());
  });

  let i = 1;
  let points = [];

  array.forEach((doc) => {
    if (points.length < i) {
      points.push([]);
    }
    points[i - 1].push(doc);
    if (
      points[i - 1].map((doc) => doc.beaconID).filter(onlyUnique).length == 3
    ) {
      i++;
    }
  });

  let points2 = points.filter((doc) => doc.length > 2);

  let points_sorted = points2.map((point) => {
    return point.sort(function (a, b) {
      return a.x - b.x || a.y - b.y;
    });
  });

  let result = points_sorted.map((point) => {
    return trilateration.calculate(meanPoint(point));
  });

  return result;
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
    mean.push({
      x: parseFloat(beacon[0].x),
      y: parseFloat(beacon[0].y),
      distance:
        beacon.reduce((total, next) => total + next.meters, 0) / beacon.length,
    });
  });

  return mean;

  // beaconData.filter;
};

function App() {
  const [flag, setFlag] = React.useState(false);
  const data = useRef();
  readData().then((d) => {
    data.current = d;
    setFlag(true);
  });

  if (!flag) {
    return <div>Loading...</div>;
  }

  console.log(data.current);

  return (
    <div className="App">
      <Canvas data={data.current}></Canvas>
    </div>
  );
}

export default App;
