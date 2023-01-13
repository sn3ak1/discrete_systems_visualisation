import { useEffect, useRef, useState } from 'react';
import MapWrapper from "./MapWrapper";
import GeoJSON from 'ol/format/GeoJSON'


function Gps({ data }) {
    const [dataProcessed, setDataProccesed] = useState();
    // define time threshold
    const [timeThreshold, setTimeThreshold] = useState(5000); // miliseconds
    const [accuracyThreshold, setAccuracyThreshold] = useState(6.0); // meters

    useEffect(() => {
        setDataProccesed(dataToFeatures(data, timeThreshold, accuracyThreshold));
    }, [data])

    return (<>
        {dataProcessed &&
            <MapWrapper
                features={dataProcessed}>
            </MapWrapper>}</>
    );
}

function dataToFeatures(data, timeThreshold, accuracyThreshold) {
    // make sure data is not undefined
    if (data == undefined) {
        data = []
    }

    // sort data by time ascending
    data.sort(function (gpsData1, gpsData2) { return gpsData1.time - gpsData2.time });


    let features = []
    let linesCoordinates = [[]]

    // create lines
    for (let idx = 0; idx < data.length - 1; idx++) {
        const currGpsData = data[idx];

        // if gps readout was less accurate than threshold value
        if (currGpsData.accuracy > accuracyThreshold) {
            // skip this gps data point/readout (dont include it in line)
            console.log("Skipping data with accuracy: ", currGpsData.accuracy)
            continue
        }

        // calculate time difference between gps data reads
        let timeDiff = 0;
        if (idx > 0) {
            timeDiff = Math.abs(currGpsData.time - data[idx - 1].time)
        }

        // if time difference between data reads exceeded time threshold
        // and at least two points are in coordinares list already
        if (timeDiff > timeThreshold && linesCoordinates[linesCoordinates.length - 1].length >= 2) {
            // create new line for gps data separated by time than timeThreshold 
            linesCoordinates.push([])
        }

        // get curr last coordinates list
        linesCoordinates[linesCoordinates.length - 1].push([currGpsData.x, currGpsData.y])
    }


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
    return parsedFeatures
}

export default Gps;
