import { loadImages } from "./database.js";

// create gallery

const container = document.querySelector("main");

loadImages((id, url, onload) => {
  const figure = document.createElement("figure");
  const img = document.createElement("img");

  img.src = url;
  img.id = `image${id}`;
  img.alt = `Illustration ${id}`;

  figure.appendChild(img);
  container.appendChild(figure);

  img.onload = onload;
});
