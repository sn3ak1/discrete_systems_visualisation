import logo from "./logo.svg";

import React, { useState, useEffect, useRef } from "react";

import "./App.css";

import MapWrapper from "./MapWrapper";
import { NavBar } from "./components/NavBar";

// openlayers
import GeoJSON from 'ol/format/GeoJSON'
import {
  fetchBleDevicesNames, getBleDevicesNames, fetchBleData, fetchGpsDevicesNames,
  fetchGpsData, isDataFetched, getGpsDevicesNames, getBleData, getGpsData
} from "./services/dataService";
import Ble from "./components/Ble";


function App() {
  const [flag, setFlag] = React.useState(false);

  const [selectedDevice, setSelectedDevice] = useState();
  const [refreshData, setRefreshData] = useState(false);

  const bleDevices = useRef();
  const gpsDevices = useRef();
  const bleData = useRef();
  const gpsData = useRef();


  // set intial state
  const [features, setFeatures] = useState([]);
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
    <div className="App">
      <NavBar
        changeViewHandler={() => setMapView(!mapView)}
        refreshDataHandler={() => setRefreshData(true)}
        deviceChangeHandler={(e) => setSelectedDevice(e.target.value)}
        devices={bleDevices.current} />

      {!mapView &&
        <Ble
          data={bleData.current[selectedDevice]}>
        </Ble>}

      {mapView &&
        <div style={{ height: '90vh' }}>
          <MapWrapper
            features={features}>
          </MapWrapper>
        </div>}
    </div>
  );
}

export default App;
