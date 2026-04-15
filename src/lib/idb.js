// src/lib/idb.js
// Capa de persistencia local para offline-first.
// Stores:
//   tickets   → array de tickets del usuario
//   tecnicos  → array de asignables
//   perfil    → objeto usuario
//   notificaciones → array
//   metricas  → objeto de dashboard
// Cada store guarda {data, timestamp} para saber qué tan fresco es el dato.

const DB_NAME = 'CuadraPWA';
const DB_VERSION = 2;
const STORE_NAMES = ['tickets', 'tecnicos', 'perfil', 'notificaciones', 'metricas', 'sync_queue'];

let _db = null;

const openDB = () => {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      STORE_NAMES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          // sync_queue usa autoIncrement para la cola de mutaciones offline
          if (name === 'sync_queue') {
            db.createObjectStore(name, { autoIncrement: true });
          } else {
            // Todos los demás stores usan 'key' como identificador
            db.createObjectStore(name, { keyPath: 'key' });
          }
        }
      });
    };

    request.onsuccess = (event) => {
      _db = event.target.result;
      resolve(_db);
    };

    request.onerror = (event) => {
      console.error('[IDB] Error al abrir la base de datos:', event.target.error);
      reject(event.target.error);
    };
  });
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
    console.warn('[IDB] idbSet falló silenciosamente:', error);
  }
};

export const idbGet = async (storeName, key) => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

export const idbDelete = async (storeName, key) => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // silencioso
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
    const tx = db.transaction(['tickets', 'tecnicos', 'perfil', 'notificaciones', 'metricas'], 'readwrite');
    ['tickets', 'tecnicos', 'perfil', 'notificaciones', 'metricas'].forEach((name) => {
      tx.objectStore(name).clear();
    });
  } catch {
    // silencioso
  }
};