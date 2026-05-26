import { loadImages } from "./database.js";

const container = document.querySelector("#gallery");

export const showGallery = () => {
  container.style.display = "grid";
  container.classList.toggle("hidden", false);
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
};

export const hideGallery = () => {
  container.style.display = "none";
  container.classList.toggle("hidden", true);
  container.innerHTML = "";
};
