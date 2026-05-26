import { loadImages } from "./database.js";

const container = document.querySelector("#gallery");

// modal

function GalleryModal(host) {
  this.host = host;
  this.dialog = document.createElement("dialog");
  this.dialogContent = document.createElement("div");
  this.closeButton = document.createElement("button");
  this.dialogImage = document.createElement("img");

  this.dialog.className = "gallery-modal";
  this.dialog.setAttribute("aria-label", "Image preview");

  this.dialogContent.className = "gallery-modal__content";

  this.closeButton.type = "button";
  this.closeButton.className = "gallery-modal__close";
  this.closeButton.setAttribute("aria-label", "Close image preview");
  this.closeButton.textContent = "×";

  this.dialogImage.className = "gallery-modal__image";

  this.dialogContent.append(this.closeButton, this.dialogImage);
  this.dialog.append(this.dialogContent);
  document.body.appendChild(this.dialog);

  this.boundHandleOpenImage = this.handleOpenImage.bind(this);
  this.boundHandleDialogClick = this.handleDialogClick.bind(this);
  this.boundHandleDialogClose = this.handleDialogClose.bind(this);
  this.boundClose = this.close.bind(this);

  this.host.addEventListener("open-image", this.boundHandleOpenImage);
  this.closeButton.addEventListener("click", this.boundClose);
  this.dialog.addEventListener("click", this.boundHandleDialogClick);
  this.dialog.addEventListener("close", this.boundHandleDialogClose);
}

GalleryModal.prototype.handleOpenImage = function (event) {
  this.open(event.detail.url, event.detail.alt);
};

GalleryModal.prototype.handleDialogClick = function (event) {
  if (event.target === this.dialog) {
    this.close();
  }
};

GalleryModal.prototype.handleDialogClose = function () {
  this.dialogImage.removeAttribute("src");
  this.dialogImage.alt = "";
};

GalleryModal.prototype.open = function (url, alt) {
  this.dialogImage.src = url;
  this.dialogImage.alt = alt;

  if (!this.dialog.open) {
    this.dialog.showModal();
  }
};

GalleryModal.prototype.close = function () {
  if (this.dialog.open) {
    this.dialog.close();
  }
};

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
const galleryModal = new GalleryModal(container);

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
  galleryModal.close();
  galleryUrls.forEach((url) => URL.revokeObjectURL(url));
  galleryUrls.length = 0;
  container.style.display = "none";
  container.classList.toggle("hidden", true);
  container.innerHTML = "";
};
