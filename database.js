// init db storage

const storeId = "s";
let db;
let imageId = localStorage.getItem("idb-last-image");

if (!imageId) {
  imageId = 0;
  localStorage.setItem("idb-last-image", imageId);
} else imageId++;

const req = window.indexedDB.open("db", 1);
req.onupgradeneeded = () => {
  if (!req.result.objectStoreNames.contains(storeId)) {
    req.result.createObjectStore(storeId);
  }
};
req.onsuccess = () => (db = req.result);

export const loadImages = (onload) => {
  const req = window.indexedDB.open("db", 1);

  req.onupgradeneeded = () => {
    if (!req.result.objectStoreNames.contains(storeId)) {
      req.result.createObjectStore(storeId);
    }
  };

  req.onsuccess = () => {
    const tx = req.result.transaction(storeId, "readonly");
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

          onload(id, url);
        };
      });
    };
  };
};

export const ifReadyDB = (callback) => {
  if (!db) return console.warn("DB not ready");
  callback();
};

export const saveBlobToDB = (blob, ondone) => {
  const tx = db.transaction(storeId, "readwrite");
  tx.objectStore(storeId).put(blob, imageId++);
  localStorage.setItem("idb-last-image", imageId);

  if (ondone) {
    tx.oncomplete = () => ondone();
  }
};

export const deleteImageFromDB = (id, ondone) => {
  if (!db) return console.warn("DB not ready");

  const tx = db.transaction(storeId, "readwrite");
  tx.objectStore(storeId).delete(id);

  if (ondone) {
    tx.oncomplete = () => ondone();
  }
};
