const storeId = "s";
let db;
const container = document.querySelector("main");

const req = window.indexedDB.open("db", 1);

req.onupgradeneeded = () => {
  if (!req.result.objectStoreNames.contains(storeId)) {
    req.result.createObjectStore(storeId);
  }
};

req.onsuccess = () => {
  db = req.result;

  const tx = db.transaction(storeId, "readonly");
  const store = tx.objectStore(storeId);

  const keysReq = store.getAllKeys();

  keysReq.onsuccess = () => {
    const keys = keysReq.result;

    keys.forEach((id) => {
      const x = store.get(id);

      x.onsuccess = () => {
        const blob = x.result;
        if (!blob) return;

        const url = URL.createObjectURL(blob);

        const figure = document.createElement("figure");
        const img = document.createElement("img");

        img.src = url;
        img.id = `image${id}`;
        img.alt = `Illustration ${id}`;

        figure.appendChild(img);
        container.appendChild(figure);

        img.onload = () => URL.revokeObjectURL(url);
      };
    });
  };
};
