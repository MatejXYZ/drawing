### Popis

Cílem projektu je vytvořit jednoduchý editor pro kresbu s lokálním úložištěm obrázků.
Editor je vytvořen přes canvas a pointer události, galerie přes IndexedDB, aplikace podporuje navigaci mezi editorem a historií.
Kresba podporuje změnu barvy a velikosti štětce. Obrázky lze v galerii rozkliknout anebo smazat

### Postup

Aplikace je rozdělená do několika jednoduchých modulů. `editor.js` řeší kreslení do canvasu a ovládací prvky editoru,
`gallery.js` vykresluje uložené obrázky a obsluhuje modal, `navigation.js` přepíná jednotlivé stránky přes URL parametr
a `database.js` ukládá obrázky do IndexedDB.

### Funkčnost

- kreslení do canvasu pomocí pointer událostí
- změna barvy a velikosti štětce
- přepínání mezi štětcem a gumou
- uložení obrázku do galerie v IndexedDB
- stažení obrázku jako `.png`
- otevření obrázku v galerii a jeho smazání
- navigace mezi editorem a galerií včetně tlačítek zpět/vpřed
- indikace offline stavu a zvuková odezva po akci

### Spuštění

např. `python3 -m http.server 8000`.

### Nasazeno

https://simecmat.site/
