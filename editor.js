import { ifReadyDB, saveBlobToDB } from "./database.js";

const editorPage = document.querySelector("#editor");

// config

const backgroundColor = "#fff";

let scale = 2;

let brushSize = 25;
let color = "#000";
let isEraser = false;

// canvas init

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let rect = canvas.getBoundingClientRect();

const resize = () => {
  rect = canvas.getBoundingClientRect();
  scale = 1000 / rect.width;
};

window.addEventListener("resize", resize);

resize();

// drawing

let isDrawing = false;

const getCoordinates = (x, y) => {
  return [x * scale, y * scale];
};

let points = [];

// pointer events

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

// toolbar events

const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
});

const colorInput = document.querySelector("input[type=color]");
colorInput.addEventListener("change", (e) => {
  color = e.target.value;
});

const sizeInput = document.querySelector("input[type=range]");
const sizeInput2 = document.querySelector("input[type=number]");
const minSize = Number(sizeInput.min);
const maxSize = Number(sizeInput.max);
const defaultSize = 10;

const clampSizeValue = (value) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return Math.min(maxSize, Math.max(minSize, Math.round(parsedValue)));
};

const updateBrushSize = (value) => {
  sizeInput.value = value;
  sizeInput2.value = value;
  sizeInput2.setCustomValidity("");
  // exponential size for good UX
  brushSize = 1 + Math.pow(value / maxSize, 2) * 300;
};

// fn for numeral input which allows arbitrary values
const validateSizeField = (value) => {
  if (value.trim() === "") {
    sizeInput2.setCustomValidity(
      `Enter a size between ${minSize} and ${maxSize}.`,
    );
    return false;
  }

  const parsedValue = Number(value);
  if (
    !Number.isFinite(parsedValue) ||
    parsedValue < minSize ||
    parsedValue > maxSize
  ) {
    sizeInput2.setCustomValidity(
      `Size must stay between ${minSize} and ${maxSize}.`,
    );
    return false;
  }

  sizeInput2.setCustomValidity("");
  return true;
};

const commitSizeValue = (value) => {
  const normalizedValue = clampSizeValue(value);

  // clamp can return non-null
  if (normalizedValue === null) {
    sizeInput2.reportValidity();
    updateBrushSize(sizeInput.value);
    return;
  }

  updateBrushSize(normalizedValue);
};

sizeInput.addEventListener("input", (e) => {
  commitSizeValue(e.target.value);
});

sizeInput2.addEventListener("input", (e) => {
  const rawValue = e.target.value;

  if (!validateSizeField(rawValue)) {
    return;
  }

  commitSizeValue(rawValue);
});

sizeInput2.addEventListener("change", (e) => {
  commitSizeValue(e.target.value);
});

updateBrushSize(defaultSize);

const brushRadio = document.querySelector("input[id=brush]");
const brushRadioLabel = document.querySelector("label[for=brush]");
const eraserRadio = document.querySelector("input[id=eraser]");
const eraserRadioLabel = document.querySelector("label[for=eraser]");
brushRadioLabel.classList.toggle("active", true);
eraserRadioLabel.classList.toggle("active", false);
brushRadio.addEventListener("change", (e) => {
  isEraser = false;
  brushRadioLabel.classList.toggle("active", true);
  eraserRadioLabel.classList.toggle("active", false);
});
eraserRadio.addEventListener("change", (e) => {
  isEraser = true;
  brushRadioLabel.classList.toggle("active", false);
  eraserRadioLabel.classList.toggle("active", true);
});

// save

const saveButton = document.querySelector("button#save");
saveButton.addEventListener("click", () => {
  ifReadyDB(() => {
    canvas.toBlob((blob) => {
      saveBlobToDB(blob);
    });
  });
});

// download

const downloadButton = document.querySelector("button#download");
downloadButton.addEventListener("click", () => {
  const url = canvas.toDataURL();
  const a = document.createElement("a");
  a.href = url;
  a.download = new Date(Date.now()).toISOString() + ".png";
  a.click();
  a.remove();
});

// drawing

const draw = (x, y) => {
  points.push({ x, y });
};

const render = () => {
  let lColor = isEraser ? backgroundColor : color;
  ctx.beginPath();

  if (points.length == 1) {
    ctx.fillStyle = lColor;
    ctx.arc(
      ...getCoordinates(points[0].x, points[0].y),
      brushSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else {
    ctx.strokeStyle = lColor;
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

// page

export const showEditor = () => {
  editorPage.style.display = "flex";

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 1000, 1000);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  requestAnimationFrame(() => {
    sizeInput2.focus({ preventScroll: true });
  });
};

export const hideEditor = () => {
  editorPage.style.display = "none";
};
