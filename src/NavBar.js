import React, { useEffect, useRef } from "react";

export function NavBar({ changeViewHandler, devices }) {

    return (
        <div style={{ height: '10vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <select name="devices" id="cars">
                {
                    devices.map((device, i) => {
                        return <option key={i} value={device}>{device}</option>
                    })
                }
            </select>

            <button onClick={changeViewHandler}>
                Change view
            </button>
        </div>
    );
}
