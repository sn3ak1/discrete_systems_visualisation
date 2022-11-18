import React, { useEffect, useRef } from "react";

export function Canvas({ data }) {
  const canvas = useRef();
  let ctx = null;

  // initialize the canvas context
  useEffect(() => {
    // dynamically assign the width and height to canvas
    const canvasEle = canvas.current;
    canvasEle.width = 500;
    canvasEle.height = 500;

    // get context of the canvas
    ctx = canvasEle.getContext("2d");
  }, []);

  let draw = (x, y) => {
    ctx.beginPath();
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.stroke();
  };

  useEffect(() => {
    ctx.moveTo(data[0].x, data[1].y);
    data.forEach((point) => {
      draw(point.x, point.y);
    });
  }, []);

  return (
    <div>
      <canvas ref={canvas}></canvas>
    </div>
  );
}
