import { hideEditor, showEditor } from "./editor.js";
import { hideGallery, showGallery } from "./gallery.js";

const showPage = (path) => {
  switch (path) {
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
};

document.addEventListener("click", (e) => {
  if (e.target.tagName == "A") {
    e.preventDefault();
    const path = e.target.getAttribute("href");
    history.pushState("", "", "?page=" + path);
    showPage(path);
  }
});

window.addEventListener("popstate", (e) => {
  route();
});

route();
