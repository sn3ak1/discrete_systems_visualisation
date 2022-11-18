import React, { useEffect, useRef } from "react";

export function Canvas({ data }) {
  const canvas = useRef();
  let ctx = null;

  // initialize the canvas context
  useEffect(() => {
    // dynamically assign the width and height to canvas
    const canvasEle = canvas.current;
    canvasEle.width = 4.36 * 1000;
    canvasEle.height = 3.77 * 1000;

    // get context of the canvas
    ctx = canvasEle.getContext("2d");
  }, []);

  let draw = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1 * 100, y1 * 100);
    ctx.lineTo(x2 * 100, y2 * 100);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 10;
    ctx.stroke();
  };

  useEffect(() => {
    for (let i = 1; i < data.length; i++) {
      draw(data[i - 1].x, data[i - 1].y, data[i].x, data[i].y);
    }

    // data.forEach((point) => {
    //   draw(point.x, point.y);
    // });
  }, []);

  return (
    <div>
      <canvas ref={canvas}></canvas>
    </div>
  );
}
