import { useEffect, useRef, useState } from 'react';
import MapWrapper from "./MapWrapper";
import GeoJSON from 'ol/format/GeoJSON'


function Gps({ data }) {
    const [dataProcessed, setDataProccesed] = useState();
    // define time threshold
    const [timeThreshold, setTimeThreshold] = useState(3000);
    useEffect(()=>{
        setDataProccesed(dataToFeatures(data, timeThreshold));
    },[data])

    return (<>
        {dataProcessed &&
        <MapWrapper
            features={ dataProcessed }>
        </MapWrapper>}</>
    );
}

function dataToFeatures(data, timeThreshold) {
    // make sure data is not undefined
    if (data == undefined) {
        data = []
    }

    // sort data by time ascending
    data.sort(function(gpsData1, gpsData2){return gpsData1.time - gpsData2.time});

    console.log("Parsing data to features: ", data)
    
    let features = []
    let linesCoordinates = [[]]

    // create lines
    for (let idx = 0; idx < data.length-1; idx++) {
        const currGpsData = data[idx];

        // calculate time difference between gps data reads
        let timeDiff = 0;  
        if (idx > 0) {
            timeDiff = Math.abs(currGpsData.time - data[idx-1].time)
        }

        // if time difference between data reads exceeded time threshold
        if (timeDiff > timeThreshold) {
            // create new line for gps data separated by time than timeThreshold 
            linesCoordinates.push([])
        }

        // get curr last coordinates list
        linesCoordinates[linesCoordinates.length-1].push([currGpsData.x, currGpsData.y])
    }

    console.log("Lines: ", linesCoordinates)

    linesCoordinates.forEach((coordinates) => {
        features.push(
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                  "coordinates": coordinates,
                  "type": "LineString"
                }
              }
        )
    })

    // convert from gps android format to global
    const wktOptions = {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }

    const parsedFeatures = new GeoJSON().readFeatures({
        "type": "FeatureCollection",
        "features": features
    }, wktOptions)
    console.log("Parsed Features from data: ", parsedFeatures)
    return parsedFeatures
}

export default Gps;
