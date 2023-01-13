import geoMarkerIcon from '../graphics/icons/geo-alt-fill.svg';
import React, { useEffect, useState, useRef } from 'react';
import styled from "styled-components";

import { Feature } from 'ol';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import VectorImage from 'ol/layer/VectorImage'

import Point from 'ol/geom/Point';

import XYZ from 'ol/source/XYZ'
import OSM from 'ol/source/OSM.js'
import SourceStamen from 'ol/source/Stamen';
import { transform } from 'ol/proj'
import { toStringXY } from 'ol/coordinate';
import { forOfStatement, tryStatement } from '@babel/types';
import { OverviewMap, ZoomToExtent, defaults as defaultControls } from 'ol/control.js';

import LayerSwitcherImage from 'ol-ext/control/LayerSwitcherImage'

import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';
import FlowLine from 'ol-ext/style/FlowLine'
import GeoJSON from 'ol/format/GeoJSON'


function MapWrapper(props) {
  const [featuresLayer, setFeaturesLayer] = useState()
  const [userPositionLayer, setUserPositionLayer] = useState()
  const [map, setMap] = useState()
  const [selectedCoord, setSelectedCoord] = useState()

  const mapRef = useRef()
  mapRef.current = map
  // get ref to div element - OpenLayers will render into this div
  const mapElement = useRef()

  // set intial state - used to track references to OpenLayers 
  //  objects for use in hooks, event handlers, etc.

  function gpsTraceLineStyleFunction(f) {
    return new FlowLine({
      visible: false,
      lineCap: 'round',
      color: (f, step) => {
        return [255 * step, 64 * step, 255 - 255 * step]
      },
      width: 5,
      geometry: function (f) {
        if (f.getGeometry().getType() === 'MultiLineString') {
          return f.getGeometry().getLineString(0);
        } else {
          return f.getGeometry();
        }
      }
    });
  }

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {

    const initalFeaturesLayer = new VectorLayer({
      visible: true,
      title: "Features Layer",
      source: new VectorSource({
        projection: 'EPSG:3857',
        format: new GeoJSON(),
      }),
      style: gpsTraceLineStyleFunction
    })

    const initialUserPositionLayer = new VectorLayer({
      visible: true,
      title: "User position Layer",
      source: new VectorSource({
        projection: 'EPSG:3857',
        format: new GeoJSON(),
      }),
      style: new Style({
        image: new Icon({
          offsetOrigin: 'bottom-right',
          anchor: [0.5, 15],
          scale: 4,
          opacity: 0.80,
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          // src: 'https://openlayers.org/en/latest/examples/data/icon.png'
          src: geoMarkerIcon
        })
      })
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

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        osm, watercolor, initalFeaturesLayer, initialUserPositionLayer
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: transform(
          [
            0, 0
          ],
          'EPSG:4326',
          'EPSG:3857'
        ),
        zoom: 16
      }),
      controls: defaultControls().extend([
        new ZoomToExtent({
          extent: [
            0, 0
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
        new LayerSwitcherImage()
      ]),
    })

    setMap(initialMap)
    setFeaturesLayer(initalFeaturesLayer)
    setUserPositionLayer(initialUserPositionLayer)
  }, [])

  // update map if features prop changes - logic formerly put into componentDidUpdate
  useEffect(() => {
    if (props.features.length && featuresLayer != undefined && map != undefined) { // may be empty on first render

      let line = props.features[props.features.length - 1].getGeometry()
      const newZoomPoint = line.flatCoordinates.slice(-1 * line.stride)


      // set features to map
      featuresLayer.setSource(
        new VectorSource({
          projection: 'EPSG:3857',
          features: props.features,
          format: new GeoJSON()
        })
      )

      const userPositionFeature = new Feature({
        geometry: new Point(newZoomPoint), //This marker will not move.
        name: 'Last seen User position',
      });

      userPositionLayer.setSource(
        new VectorSource({
          projection: 'EPSG:3857',
          features: [userPositionFeature],
          format: new GeoJSON()
        })
      )


      // set new map center
      map.getView().setCenter(transform(
        newZoomPoint,
        'EPSG:3857', // 'EPSG:4326',
        'EPSG:3857'
      ),)
    }

  }, [props.features, featuresLayer, map])

  return (
    <div ref={mapElement} className="map-container"></div>
  )

}

export default MapWrapper