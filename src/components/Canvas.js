import React, { useEffect, useRef } from "react";
import Slider from '@mui/material/Slider';

export function Canvas({ data }) {
  const canvas = useRef();

  const [value, setValue] = React.useState();

  // initialize the canvas context
  useEffect(() => {
    const canvasEle = canvas.current;
    canvas.current.width = 1000;
    canvas.current.height = 1000;
  }, []);

  let drawLine = (x1, y1, x2, y2) => {
    const ctx = canvas.current.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x1 * 100, y1 * 100);
    ctx.lineTo(x2 * 100, y2 * 100);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 10;
    ctx.stroke();
  };

  useEffect(() => {
    canvas.current.getContext("2d").clearRect(0, 0, canvas.current.width, canvas.current.height);

    for (let i = 1; i < Math.round(value * data.length / 100); i++) {
      drawLine(data[i - 1][0], data[i - 1][1], data[i][0], data[i][1]);
    }
  }, [value]);


  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', width: '80%', height: '70vh', margin: 'auto'
    }}>
      <Slider
        onChange={(_, value) => {
          setValue(value);
        }}>
      </Slider>
      <canvas ref={canvas} style={{ height: '100%', border: '1px solid black' }}></canvas>
    </div>
  );
}
