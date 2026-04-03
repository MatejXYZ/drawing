const backgroundColor = "#fff";

let scale = 2;

let brushSize = 25;
let color = "#000";
let isEraser = false;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, 1000, 1000);

const rect = canvas.getBoundingClientRect();

let isDrawing = false;

const getCoordinates = (x, y) => {
  return [x * scale, y * scale];
};

const draw = (x, y) => {
  ctx.fillStyle = isEraser ? backgroundColor : color;
  ctx.beginPath();
  ctx.arc(...getCoordinates(x, y), brushSize, 0, 2 * Math.PI);
  ctx.fill();
};

const tryDraw = (e) => {
  e.preventDefault();
  if (isDrawing) {
    draw(e.clientX - rect.left, e.clientY - rect.top);
  }
};

canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  isDrawing = true;
  tryDraw(e);
});

document.addEventListener("pointerup", (e) => {
  canvas.releasePointerCapture(e.pointerId);
  isDrawing = false;
});

canvas.addEventListener("pointermove", (e) => {
  tryDraw(e);
});

const colorInput = document.querySelector("input[type=color]");
colorInput.addEventListener("change", (e) => {
  color = e.target.value;
});

const sizeInput = document.querySelector("input[type=range]");
sizeInput.addEventListener("change", (e) => {
  brushSize = e.target.value;
});

const brushRadio = document.querySelector("input[id=brush]");
const eraserRadio = document.querySelector("input[id=eraser]");
brushRadio.addEventListener("change", (e) => {
  isEraser = false;
});
eraserRadio.addEventListener("change", (e) => {
  isEraser = true;
});
