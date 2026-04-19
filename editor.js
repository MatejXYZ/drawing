const backgroundColor = "#fff";

let scale = 2;

let brushSize = 25;
let color = "#000";
let isEraser = false;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, 1000, 1000);
ctx.lineCap = "round";
ctx.lineJoin = "round";

const rect = canvas.getBoundingClientRect();

let isDrawing = false;

const getCoordinates = (x, y) => {
  return [x * scale, y * scale];
};

let points = [];

const draw = (x, y) => {
  points.push({ x, y });
};

const render = () => {
  color = isEraser ? backgroundColor : color;
  ctx.beginPath();

  if (points.length == 1) {
    ctx.fillStyle = color;
    ctx.arc(
      ...getCoordinates(points[0].x, points[0].y),
      brushSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.moveTo(...getCoordinates(points[0].x, points[0].y));

    if (points.length == 2) {
      ctx.lineTo(...getCoordinates(points[0].x, points[0].y));
    } else if (points.length > 2) {
      for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;

        ctx.quadraticCurveTo(
          ...getCoordinates(points[i].x, points[i].y),
          ...getCoordinates(midX, midY),
        );
      }
    }

    ctx.stroke();
  }
};

const tryDraw = (e) => {
  e.preventDefault();
  if (isDrawing) {
    draw(e.clientX - rect.left, e.clientY - rect.top);

    requestAnimationFrame(render);
  }
};

canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  isDrawing = true;
  points = [];
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

let storeId = "s";
let imageId = localStorage.getItem("idb-last-image");
if (!imageId) {
  imageId = 0;
  localStorage.setItem("idb-last-image", imageId);
} else imageId++;

console.log(imageId);

let db;
const req = window.indexedDB.open("db", 1);
req.onupgradeneeded = () => {
  if (!req.result.objectStoreNames.contains(storeId)) {
    req.result.createObjectStore(storeId);
  }
};
req.onsuccess = () => (db = req.result);

const saveButton = document.querySelector("button#save");
saveButton.addEventListener("click", () => {
  if (!db) return console.warn("DB not ready");

  canvas.toBlob((blob) => {
    const tx = db.transaction(storeId, "readwrite");
    tx.objectStore(storeId).put(blob, imageId++);
    localStorage.setItem("idb-last-image", imageId);
  });
});
