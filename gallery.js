import { deleteImageFromDB, loadImages } from "./database.js";

const container = document.querySelector("#gallery");
const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;

// modal

function GalleryModal(host) {
  this.host = host;
  this.dialog = document.createElement("dialog");
  this.dialogContent = document.createElement("div");
  this.closeButton = document.createElement("button");
  this.deleteButton = document.createElement("button");
  this.dialogImage = document.createElement("img");
  this.currentItem = null;

  this.dialog.className = "gallery-modal";

  this.dialogContent.className = "gallery-modal__content";

  this.closeButton.type = "button";
  this.closeButton.className = "gallery-modal__close";
  this.closeButton.textContent = "×";

  this.deleteButton.type = "button";
  this.deleteButton.className = "gallery-modal__delete";
  this.deleteButton.innerHTML = deleteIcon;

  this.dialogImage.className = "gallery-modal__image";

  this.dialogContent.append(
    this.closeButton,
    this.deleteButton,
    this.dialogImage,
  );
  this.dialog.append(this.dialogContent);
  document.body.appendChild(this.dialog);

  this.boundHandleOpenImage = this.handleOpenImage.bind(this);
  this.boundHandleDialogClick = this.handleDialogClick.bind(this);
  this.boundHandleDialogClose = this.handleDialogClose.bind(this);
  this.boundHandleDelete = this.handleDelete.bind(this);
  this.boundClose = this.close.bind(this);

  this.host.addEventListener("open-image", this.boundHandleOpenImage);
  this.closeButton.addEventListener("click", this.boundClose);
  this.deleteButton.addEventListener("click", this.boundHandleDelete);
  this.dialog.addEventListener("click", this.boundHandleDialogClick);
  this.dialog.addEventListener("close", this.boundHandleDialogClose);
}

GalleryModal.prototype.handleOpenImage = function (event) {
  this.open(event.detail.item, event.detail.url, event.detail.alt);
};

GalleryModal.prototype.handleDialogClick = function (event) {
  if (event.target === this.dialog) {
    this.close();
  }
};

GalleryModal.prototype.handleDialogClose = function () {
  this.currentItem = null;
  this.dialogImage.removeAttribute("src");
  this.dialogImage.alt = "";
};

GalleryModal.prototype.handleDelete = function () {
  if (!this.currentItem) return;

  this.currentItem.deleteImage(this.boundClose);
};

GalleryModal.prototype.open = function (item, url, alt) {
  this.currentItem = item;
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
    this.deleteButton = document.createElement("button");

    this.icon.className = "icon";
    this.deleteButton.type = "button";
    this.deleteButton.className = "gallery-item__delete";

    this.deleteButton.innerHTML = deleteIcon;
    this.addEventListener("click", this.handleActivate);
    this.addEventListener("keydown", this.handleKeydown);
    this.deleteButton.addEventListener("click", this.handleDelete);
  }

  connectedCallback() {
    this.tabIndex = 0;
    this.setAttribute("role", "button");

    if (!this.img.isConnected) {
      this.append(this.icon, this.img, this.deleteButton);
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
          item: this,
          alt: this.imageAlt,
          url: this.imageUrl,
        },
      }),
    );
  };

  handleKeydown = (event) => {
    if (event.target !== this) return;

    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    this.handleActivate();
  };

  handleDelete = (event) => {
    event.stopPropagation();
    this.deleteImage();
  };

  deleteImage = (ondone) => {
    deleteImageFromDB(this.imageId, () => {
      const urlIndex = galleryUrls.indexOf(this.imageUrl);

      URL.revokeObjectURL(this.imageUrl);

      if (urlIndex !== -1) {
        galleryUrls.splice(urlIndex, 1);
      }

      this.remove();

      if (ondone) {
        ondone();
      }
    });
  };

  sync() {
    if (!this.isConnected || !this.imageUrl) return;

    this.img.src = this.imageUrl;
    this.img.id = `image${this.imageId}`;
    this.img.alt = this.imageAlt;
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
