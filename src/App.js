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

  const bleDevices = useRef();
  const gpsDevices = useRef();
  const bleData = useRef();
  const gpsData = useRef();


  // set intial state
  const [mapView, setMapView] = useState(true);


  useEffect(() => {
    if (isDataFetched() && !refreshData) {
      bleDevices.current = getBleDevicesNames();
      gpsDevices.current = getGpsDevicesNames();
      bleData.current = getBleData();
      gpsData.current = getGpsData();
      setFlag(true);
      setSelectedDevice(bleDevices.current[0]);
    } else {
      fetchBleDevicesNames()
        .then((devices) => {
          bleDevices.current = devices;
        })
        .then(() => { fetchBleData(bleDevices.current).then((data) => bleData.current = data) });
      fetchGpsDevicesNames()
        .then((devices) => {
          gpsDevices.current = devices;
        })
        .then(() => { fetchGpsData(gpsDevices.current).then((data) => gpsData.current = data) })
        .then(() => {
          setFlag(true);
          setSelectedDevice(bleDevices.current[0]);
        });
      setRefreshData(false);
    }
  }, [refreshData])

  if (!flag) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <NavBar
        changeViewHandler={() => setMapView(!mapView)}
        refreshDataHandler={() => setRefreshData(true)}
        deviceChangeHandler={(e) => setSelectedDevice(e.target.value)}
        devices={gpsDevices.current} />

      {!mapView &&
        <Ble
          data={bleData.current[selectedDevice]}>
        </Ble>
      }

      {mapView &&
        <Gps
          data={gpsData.current[selectedDevice]}>
        </Gps>
      }
    </div>
  );
}

export default App;
