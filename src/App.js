import logo from "./graphics/icons/logo.svg";

import React, { useState, useEffect, useRef } from "react";

import "./App.css";

import { NavBar } from "./components/NavBar";

// openlayers
import {
  fetchBleDevicesNames, getBleDevicesNames, fetchBleData, fetchGpsDevicesNames,
  fetchGpsData, isDataFetched, getGpsDevicesNames, getBleData, getGpsData
} from "./services/dataService";
import Ble from "./components/Ble";
import Gps from "./components/Gps";



function App() {
  const [flag, setFlag] = React.useState(false);

  const [selectedDevice, setSelectedDevice] = useState();
  const [refreshData, setRefreshData] = useState(false);

  const [bleDevices, setBleDevices] = useState();
  const [gpsDevices, setGpsDevices] = useState();
  const [bleData, setBleData] = useState();
  const [gpsData, setGpsData] = useState();


  // set intial state
  const [mapView, setMapView] = useState(true);


  useEffect(() => {
    if (isDataFetched() && !refreshData) {
      const gpsDevices = getGpsDevicesNames();
      setBleDevices(getBleDevicesNames());
      setGpsDevices(gpsDevices);
      setBleData(getBleData());
      setGpsData(getGpsData());

      setFlag(true);
      setSelectedDevice(gpsDevices[0]);
    } else {
      fetchBleDevicesNames()
        .then((devices) => {
          setBleDevices(devices);
          return devices;
        })
        .then((devices) => { fetchBleData(devices).then((data) => setBleData(data)) });
      fetchGpsDevicesNames()
        .then((devices) => {
          setGpsDevices(devices)
          return devices;
        })
        .then((devices) => { fetchGpsData(devices).then((data) => setGpsData(data)) })
        .then(() => {
          setFlag(true);
          setSelectedDevice(gpsDevices[0]);
        });
      setRefreshData(false);
    }
  }, [refreshData])

  if (!flag) {
    return <div>Loading...</div>;
  }

  return (
    console.log('render',gpsData),
    <div className="App">
      <NavBar
        changeViewHandler={() => setMapView(!mapView)}
        refreshDataHandler={() => setRefreshData(true)}
        deviceChangeHandler={(e) => setSelectedDevice(e.target.value)}
        devices={gpsDevices} />

      {!mapView &&
        <Ble
          data={bleData[selectedDevice]}>
        </Ble>}

      {mapView &&
        <Gps
          data={gpsData[selectedDevice]}>
        </Gps>
      }
    </div>
  );
}

export default App;
