import { useRef } from 'react';
import { readBLEData } from '../services/bleService';
import { Canvas } from './Canvas';


function Ble({ data }) {
    const dataProcessed = useRef(readBLEData(data));

    return (
        <Canvas data={dataProcessed.current}></Canvas>
    );
}

export default Ble;