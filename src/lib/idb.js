// src/lib/idb.js
// Capa de persistencia local para offline-first.
// Stores:
//   tickets   → array de tickets del usuario
//   tecnicos  → array de asignables
//   perfil    → objeto usuario
//   notificaciones → array
//   metricas  → objeto de dashboard
//   recurrencias → reglas de recurrencia por maquina
//   preventivos_matriz → matriz anual de preventivos
// Cada store guarda {data, timestamp} para saber qué tan fresco es el dato.

const DB_NAME = 'CuadraPWA';
const DB_VERSION = 5;
const STORE_SCHEMAS = {
  tickets: { keyPath: 'key' },
  tecnicos: { keyPath: 'key' },
  perfil: { keyPath: 'key' },
  notificaciones: { keyPath: 'key' },
  metricas: { keyPath: 'key' },
  sync_queue: { autoIncrement: true },
  recurrencias: { keyPath: 'key' },
  preventivos_matriz: { keyPath: 'key' },
};
const SNAPSHOT_STORES = ['tickets', 'tecnicos', 'perfil', 'notificaciones', 'metricas', 'recurrencias', 'preventivos_matriz'];

let _db = null;
let _openPromise = null;
const loggedMessages = new Set();

const logOnce = (level, key, message, detail) => {
  if (loggedMessages.has(key)) return;
  loggedMessages.add(key);
  console[level](message, detail);
};

const createMissingStores = (db) => {
  Object.entries(STORE_SCHEMAS).forEach(([name, options]) => {
    if (!db.objectStoreNames.contains(name)) {
      db.createObjectStore(name, options);
    }
  });
};

const attachVersionChangeHandler = (db) => {
  db.onversionchange = (event) => {
    logOnce(
      'warn',
      'versionchange',
      `[IDB] ${DB_NAME} recibio versionchange (${event.oldVersion} -> ${event.newVersion ?? 'desconocida'}). Se cierra la conexion local.`,
    );
    db.close();
    if (_db === db) _db = null;
  };
};

const openDB = () => {
  if (_db) return Promise.resolve(_db);
  if (_openPromise) return _openPromise;

  _openPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onblocked = (event) => {
      logOnce(
        'warn',
        'open-blocked',
        `[IDB] Apertura bloqueada: db=${DB_NAME}, requestedVersion=${DB_VERSION}, oldVersion=${event.oldVersion}, newVersion=${event.newVersion}.`,
        new Error('Cierra otras pestanas de esta aplicacion para permitir la migracion de IndexedDB.'),
      );
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      createMissingStores(db);
    };

    request.onsuccess = (event) => {
      _db = event.target.result;
      attachVersionChangeHandler(_db);
      _openPromise = null;
      resolve(_db);
    };

    request.onerror = (event) => {
      const error = event.target.error;
      logOnce(
        'error',
        `open-error-${error?.name || 'unknown'}`,
        `[IDB] Error al abrir db=${DB_NAME}, requestedVersion=${DB_VERSION}.`,
        error,
      );
      _openPromise = null;
      reject(error);
    };
  });

  return _openPromise;
};

// ── Primitivos ─────────────────────────────────────────────────────────────

export const idbSet = async (storeName, key, data) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put({ key, data, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    logOnce(
      'warn',
      `set-${storeName}-${error?.name || 'unknown'}`,
      `[IDB] idbSet fallo: db=${DB_NAME}, version=${DB_VERSION}, store=${storeName}, key=${key}.`,
      error,
    );
    return false;
  }
};

export const idbGet = async (storeName, key) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    logOnce(
      'warn',
      `get-${storeName}-${error?.name || 'unknown'}`,
      `[IDB] idbGet fallo: db=${DB_NAME}, version=${DB_VERSION}, store=${storeName}, key=${key}.`,
      error,
    );
    return null;
  }
};

export const idbDelete = async (storeName, key) => {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
    return true;
  } catch (error) {
    logOnce(
      'warn',
      `delete-${storeName}-${error?.name || 'unknown'}`,
      `[IDB] idbDelete fallo: db=${DB_NAME}, version=${DB_VERSION}, store=${storeName}, key=${key}.`,
      error,
    );
    return false;
  }
};

// ── API de alto nivel para cada dominio ────────────────────────────────────
// Staleness: cuántos ms antes de considerar el dato "viejo"
const STALE_TIME = {
  tickets:       5  * 60 * 1000,  // 5 minutos
  tecnicos:      10 * 60 * 1000,  // 10 minutos
  perfil:        30 * 60 * 1000,  // 30 minutos
  notificaciones: 2  * 60 * 1000, // 2 minutos
  metricas:       5  * 60 * 1000,
};

const isStale = (timestamp, domain) => {
  if (!timestamp) return true;
  return Date.now() - timestamp > (STALE_TIME[domain] ?? 5 * 60 * 1000);
};

// Lee un snapshot del store. Devuelve { data, isStale, timestamp } o null.
export const readSnapshot = async (storeName, key = 'default') => {
  const record = await idbGet(storeName, key);
  if (!record) return null;
  return {
    data:      record.data,
    timestamp: record.timestamp,
    isStale:   isStale(record.timestamp, storeName),
  };
};

// Guarda un snapshot (resultado de un fetch exitoso)
export const writeSnapshot = (storeName, data, key = 'default') => {
  return idbSet(storeName, key, data);
};

// Elimina todos los snapshots (logout)
export const clearAllSnapshots = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(SNAPSHOT_STORES, 'readwrite');
    SNAPSHOT_STORES.forEach((name) => {
      tx.objectStore(name).clear();
    });
  } catch (error) {
    logOnce(
      'warn',
      `clear-snapshots-${error?.name || 'unknown'}`,
      `[IDB] clearAllSnapshots fallo: db=${DB_NAME}, version=${DB_VERSION}.`,
      error,
    );
  }
};
