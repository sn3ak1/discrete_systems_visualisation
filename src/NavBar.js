import React, { useEffect, useRef } from "react";

export function NavBar({ changeViewHandler }) {

    return (
        <div style={{ height: '10vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <select name="cars" id="cars">
                <option value="volvo">Volvo</option>
                <option value="saab">Saab</option>
                <option value="opel">Opel</option>
                <option value="audi">Audi</option>
            </select>

            <button onClick={changeViewHandler}>
                Change view
            </button>
        </div>
    );
}
