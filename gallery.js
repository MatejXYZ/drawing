import { loadImages } from "./database.js";

const container = document.querySelector("#gallery");
const galleryUrls = [];
const dialog = document.createElement("dialog");
const dialogContent = document.createElement("div");
const closeButton = document.createElement("button");
const dialogImage = document.createElement("img");

dialog.className = "gallery-modal";
dialog.setAttribute("aria-label", "Image preview");

dialogContent.className = "gallery-modal__content";

closeButton.type = "button";
closeButton.className = "gallery-modal__close";
closeButton.setAttribute("aria-label", "Close image preview");
closeButton.textContent = "×";

dialogImage.className = "gallery-modal__image";

dialogContent.append(closeButton, dialogImage);
dialog.append(dialogContent);
document.body.appendChild(dialog);

const closeModal = () => {
  if (dialog.open) {
    dialog.close();
  }
};

const openModal = (url, alt) => {
  dialogImage.src = url;
  dialogImage.alt = alt;

  if (!dialog.open) {
    dialog.showModal();
  }
};

closeButton.addEventListener("click", closeModal);

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    closeModal();
  }
});

dialog.addEventListener("close", () => {
  dialogImage.removeAttribute("src");
  dialogImage.alt = "";
});

export const showGallery = () => {
  container.style.display = "grid";
  container.classList.toggle("hidden", false);

  if (container.childElementCount > 0) {
    return;
  }

  loadImages((id, url) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const icon = document.createElement("div");
    icon.classList.add("icon");

    galleryUrls.push(url);
    img.src = url;
    img.id = `image${id}`;
    img.alt = `Illustration ${id}`;
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `Open ${img.alt}`);

    figure.addEventListener("click", () => {
      openModal(url, img.alt);
    });

    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(url, img.alt);
      }
    });

    figure.appendChild(icon);
    figure.appendChild(img);
    container.appendChild(figure);
  });
};

export const hideGallery = () => {
  closeModal();
  galleryUrls.forEach((url) => URL.revokeObjectURL(url));
  galleryUrls.length = 0;
  container.style.display = "none";
  container.classList.toggle("hidden", true);
  container.innerHTML = "";
};
