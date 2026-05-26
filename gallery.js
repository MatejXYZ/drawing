import { loadImages } from "./database.js";

const container = document.querySelector("#gallery");

// modal

class GalleryItem extends HTMLElement {
  constructor() {
    super();

    this.imageUrl = "";
    this.imageAlt = "";
    this.imageId = "";
    this.icon = document.createElement("div");
    this.img = document.createElement("img");

    this.icon.className = "icon";
    this.addEventListener("click", this.handleActivate);
    this.addEventListener("keydown", this.handleKeydown);
  }

  connectedCallback() {
    this.tabIndex = 0;
    this.setAttribute("role", "button");

    if (!this.img.isConnected) {
      this.append(this.icon, this.img);
    }

    this.sync();
  }

  set data({ id, url, alt }) {
    this.imageId = id;
    this.imageUrl = url;
    this.imageAlt = alt;
    this.sync();
  }

  handleActivate = () => {
    if (!this.imageUrl) return;

    this.dispatchEvent(
      new CustomEvent("open-image", {
        bubbles: true,
        detail: {
          alt: this.imageAlt,
          url: this.imageUrl,
        },
      }),
    );
  };

  handleKeydown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    this.handleActivate();
  };

  sync() {
    if (!this.isConnected || !this.imageUrl) return;

    this.img.src = this.imageUrl;
    this.img.id = `image${this.imageId}`;
    this.img.alt = this.imageAlt;
    this.setAttribute("aria-label", `Open ${this.imageAlt}`);
  }
}

customElements.define("gallery-item", GalleryItem);

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

container.addEventListener("open-image", (event) => {
  openModal(event.detail.url, event.detail.alt);
});

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

// page

export const showGallery = () => {
  container.style.display = "grid";
  container.classList.toggle("hidden", false);

  if (container.childElementCount > 0) {
    return;
  }

  loadImages((id, url) => {
    const item = document.createElement("gallery-item");
    const alt = `Illustration ${id}`;

    galleryUrls.push(url);
    item.data = { id, url, alt };
    container.appendChild(item);
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
