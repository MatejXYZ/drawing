import { hideEditor, showEditor } from "./editor.js";
import { hideGallery, showGallery } from "./gallery.js";

// navbar

const editorLink = document.querySelector("nav a[href=index]");
const galleryLink = document.querySelector("nav a[href=gallery]");

const toggleActiveOn = (el) => {
  el.classList.toggle("active", true);
};
const toggleActiveOff = (el) => {
  el.classList.toggle("active", false);
};

const updateActiveLink = (page) => {
  switch (page) {
    case "gallery":
      toggleActiveOn(galleryLink);
      toggleActiveOff(editorLink);
      break;
    default:
      toggleActiveOn(editorLink);
      toggleActiveOff(galleryLink);
  }
};

// navigation

const showPage = (page) => {
  switch (page) {
    case "gallery":
      showGallery();
      hideEditor();
      break;
    default:
      showEditor();
      hideGallery();
  }
};

const route = () => {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");
  showPage(page);

  updateActiveLink(page);
};

document.addEventListener("click", (e) => {
  if (e.target.tagName == "A") {
    e.preventDefault();
    const page = e.target.getAttribute("href");
    history.pushState("", "", "?page=" + page);
    showPage(page);

    updateActiveLink(page);
  }
});

window.addEventListener("popstate", (e) => {
  route();
});

route();

// offline

const offlineIndicator = document.querySelector("#offline-indicator");

window.addEventListener("online", () => {
  offlineIndicator.style.display = "none";
});
window.addEventListener("offline", () => {
  offlineIndicator.style.display = "flex";
});
