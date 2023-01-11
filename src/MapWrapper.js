import React, { useEffect, useState, useRef } from 'react';
import styled from "styled-components";

import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import OSM from 'ol/source/OSM.js'
import SourceStamen from 'ol/source/Stamen';
import { transform } from 'ol/proj'
import { toStringXY } from 'ol/coordinate';
import { forOfStatement } from '@babel/types';
import {OverviewMap, ZoomToExtent, defaults as defaultControls} from 'ol/control.js';

import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';

const div = styled.div`
  width: 300px;
  height: 50px;

  min-width: 1px;
  min-heigth: 1px;
`;

function MapWrapper(props) {
  // get ref to div element - OpenLayers will render into this div
  const mapElement = useRef()

  // set intial state - used to track references to OpenLayers 
  //  objects for use in hooks, event handlers, etc.

  const initalFeaturesLayer = new VectorLayer({
    source: new VectorSource()
  })

  const osm = new TileLayer({
    title: 'OSM',
    type: 'base',
    visible: true,
    source: new OSM()
  });

  const watercolor = new TileLayer({
    title: 'Water color',
    type: 'base',
    visible: false,
    source: new SourceStamen({
      layer: 'watercolor'
    })
  });

  const baseMaps = new LayerGroup({
    title: 'Base maps',
    layers: [osm, watercolor]
  });

  // create map
  const initialMap = new Map({
    target: mapElement.current,
    layers: [
      baseMaps
    ],
    view: new View({
      projection: 'EPSG:3857',
      center: [
        // 50.0585, 
        2265237.640645714, //19.9342
        5572486.729875085
      ],
      zoom: 15
    }),
    controls: defaultControls().extend([
      new ZoomToExtent({
        extent: [
          2265237.640645714,
          5572486.729875085
        ],
      }),
      new OverviewMap({
        layers: [
          new TileLayer({
            title: 'Open Street Map',            
            type: 'base',
            source: new OSM(),
          }),
        ],
      }),
      new LayerSwitcher({
        reverse: false,
        groupSelectStyle: 'group'
      })
    ]),
  })

  
  const [featuresLayer, setFeaturesLayer] = useState(initalFeaturesLayer)
  const [map, setMap] = useState(initialMap)
  const [selectedCoord, setSelectedCoord] = useState()

  const mapRef = useRef()
  mapRef.current = map

  // map click handler
  const handleMapClick = (event) => {

    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

    // set React state
    setSelectedCoord(transormedCoord)
  }

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    console.log("Running MapWraper initialization")

    // register map on click callback 
    map.on('click', handleMapClick)
  }, [])

  // update map if features prop changes - logic formerly put into componentDidUpdate
  useEffect(() => {

    if (props.features.length) { // may be empty on first render

      console.log("Map received features: ", props.features);
      console.log("FeaturesLayer", featuresLayer)
      console.log("Map", map)
      // set features to map
      featuresLayer.setSource(
        new VectorSource({
          features: props.features // make sure features is an array
        })
      )

      // fit map to feature extent (with 100px of padding)
      map.getView().fit(featuresLayer.getSource().getExtent(), {
        padding: [100, 100, 100, 100]
      })

    }

  }, [props.features, featuresLayer, map])

  return (
    <div ref={mapElement} className="map-container"></div>
  )

}

export default MapWrapper