import React, { useEffect, useRef } from "react";
import Slider from '@mui/material/Slider';
const Rainbow = require('rainbowvis.js');
const rainbow = new Rainbow();

const SCALAR = 100;

let drawLine = (ctx, x1, y1, x2, y2, lineIndex = 1) => {
  var grad = ctx.createLinearGradient(x1 * SCALAR, y1 * SCALAR, x2 * SCALAR, y2 * SCALAR);
  grad.addColorStop(0, '#' + rainbow.colorAt(lineIndex - 1));
  grad.addColorStop(1, '#' + rainbow.colorAt(lineIndex));

  ctx.beginPath();
  ctx.moveTo(x1 * SCALAR, y1 * SCALAR);
  ctx.lineTo(x2 * SCALAR, y2 * SCALAR);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 10;
  ctx.stroke();
};

export function Canvas({ data }) {
  const canvas = useRef();
  const slider = useRef();

  const [value, setValue] = React.useState(0);
  const [sliderTouched, setSliderTouched] = React.useState(false);

  const autoDraw = useRef();

  useEffect(() => {
    canvas.current.width = 1000;
    canvas.current.height = 1000;

    rainbow.setNumberRange(0, data.length);
    rainbow.setSpectrum('blue', 'red');
  }, []);

  useEffect(() => {
    setValue(0);
    setSliderTouched(false);
    slider.current.max = data.length;
  }, [data]);

  useEffect(() => {
    if (autoDraw.current) {
      clearInterval(autoDraw.current);
    }

    autoDraw.current = setInterval(() => {
      setValue((value) => {
        if (sliderTouched || value === data.length) {
          return value;
        }
        return value + 1;
      });
    }, 100);

    return () => clearInterval(autoDraw);
  }, [sliderTouched, data]);

  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

    for (let i = 1; i < value; i++) {
      drawLine(ctx, data[i - 1][0], data[i - 1][1], data[i][0], data[i][1], i);
    }
  }, [value]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', width: '80%', height: '80vh', margin: 'auto', padding: '10px'
    }}>
      <Slider
        ref={slider}
        max={data.length}
        value={value}
        onChange={(event, value) => {
          console.log(event);
          if (event?.type === 'mousedown' || event?.type === 'touchstart') {
            setSliderTouched(true);
          }
          setValue(value);
        }}
      >
      </Slider>
      <canvas ref={canvas} style={{ height: '100%', border: '1px solid black', marginTop: '15px' }}></canvas>
    </div>
  );
}
