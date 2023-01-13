import { useEffect, useRef, useState } from 'react';
import { Canvas } from './Canvas';
var trilat = require("trilat");

function Ble({ data }) {
    const [dataProcessed, setDataProcessed] = useState();
    const [dimentions, setDimentions] = useState();

    useEffect(() => {
        setDataProcessed(data ? readBLEData(data) : null);
        setDimentions(data ? getRoomDimensions(data) : null);
    }, [data]);


    return (
        <>
            {dataProcessed &&
                <Canvas
                    data={dataProcessed}
                    dimentions={dimentions}>
                </Canvas>}
        </>
    );
}

function getRoomDimensions(data) {
    return {
        width: Math.max(...data.map((doc) => doc.x)),
        height: Math.max(...data.map((doc) => doc.y)),
    };
}

function readBLEData(bleData) {
    let onlyUnique = (value, index, self) => {
        return self.indexOf(value) === index;
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
            );
        });
        return mean;
    };

    let i = 1;
    let points = [];

    bleData.forEach((doc) => {
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
    points2.pop();

    let result = points2.map((point) => {
        return trilat(meanPoint(point));
    });

    return result.filter(
        (doc) => doc[0] > 0 && doc[1] > 0 && doc[0] < 10 && doc[1] < 10
    );
}

export default Ble;