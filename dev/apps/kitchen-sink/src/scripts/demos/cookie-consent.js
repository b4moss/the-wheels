import "@b4moss/the-wheels";

const STORAGE_KEY = "tw-cookie-consent";

/** @type {HTMLElement & {
 *   setServiceConsent?: (id: string, allowed: boolean) => void;
 *   getServiceConsent?: (id: string) => boolean | undefined;
 *   getAllServiceConsents?: () => Record<string, boolean>;
 * }} */
const host = document.getElementById("cookie-demo");
const resetBtn = document.getElementById("cookie-reset");
const applyBtn = document.getElementById("cookie-storage-apply");
const statusEl = document.getElementById("cookie-storage-status");
/** @type {HTMLTextAreaElement | null} */
const editor = document.getElementById("cookie-storage-json");
const serviceInputs = [
  ...document.querySelectorAll("[data-cookie-service]"),
].filter((el) => el instanceof HTMLInputElement);

let syncingFromStorage = false;
let editorDirty = false;

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function formatStorageJson(raw) {
  if (raw == null || raw === "") return "";
  try {
    return `${JSON.stringify(JSON.parse(raw), null, 2)}\n`;
  } catch {
    return raw;
  }
}

function refreshEditorFromStorage({ force = false } = {}) {
  if (!editor) return;
  if (editorDirty && !force) return;
  const next = formatStorageJson(readRaw());
  if (editor.value !== next) {
    editor.value = next;
  }
  editorDirty = false;
}

function syncCheckboxesFromHost() {
  if (!host?.getServiceConsent) return;
  syncingFromStorage = true;
  for (const input of serviceInputs) {
    const id = input.dataset.cookieService;
    if (!id) continue;
    const value = host.getServiceConsent(id);
    input.checked = value === true;
    input.indeterminate = value === undefined;
  }
  syncingFromStorage = false;
}

function refreshAll({ forceEditor = false } = {}) {
  refreshEditorFromStorage({ force: forceEditor });
  syncCheckboxesFromHost();
}

resetBtn?.addEventListener("click", () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  location.reload();
});

for (const input of serviceInputs) {
  input.addEventListener("change", () => {
    if (syncingFromStorage || !host?.setServiceConsent) return;
    const id = input.dataset.cookieService;
    if (!id) return;
    host.setServiceConsent(id, input.checked);
    input.indeterminate = false;
    editorDirty = false;
    refreshEditorFromStorage({ force: true });
    // Confirm via API (also exercises getAllServiceConsents).
    if (host.getAllServiceConsents) {
      const all = host.getAllServiceConsents();
      setStatus(`services: ${JSON.stringify(all)}`);
    }
  });
}

host?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (
    target.closest("[data-tw-cookie-accept-all]") ||
    target.closest("[data-tw-cookie-settings]")
  ) {
    queueMicrotask(() => {
      editorDirty = false;
      refreshAll({ forceEditor: true });
      setStatus("バナー操作を storage に反映しました");
    });
  }
});

editor?.addEventListener("input", () => {
  editorDirty = true;
  setStatus("未適用の編集があります");
});

applyBtn?.addEventListener("click", () => {
  if (!editor) return;
  let parsed;
  try {
    parsed = JSON.parse(editor.value);
  } catch {
    setStatus("JSON が不正です");
    return;
  }
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    setStatus("オブジェクト JSON を指定してください");
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    setStatus("localStorage への書き込みに失敗しました");
    return;
  }

  // TwCookieConsent re-reads storage when `storage-key` changes (avoids reconnect,
  // which would drop projected banner slot content).
  if (host) {
    const tmpKey = `${STORAGE_KEY}__ks_apply`;
    host.setAttribute("storage-key", tmpKey);
    try {
      localStorage.removeItem(tmpKey);
    } catch {
      // ignore
    }
    host.setAttribute("storage-key", STORAGE_KEY);
  }

  editorDirty = false;
  refreshAll({ forceEditor: true });
  setStatus("Apply 済み（storage → コンポーネント再同期）");
});

// Initial paint after WC connectedCallback writes pending state.
queueMicrotask(() => {
  refreshAll({ forceEditor: true });
  setStatus("");
});

// Same-tab writes from other scripts won't fire `storage`; still listen for other tabs.
window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY) return;
  editorDirty = false;
  refreshAll({ forceEditor: true });
  setStatus("他タブの storage 変更を反映しました");
});
