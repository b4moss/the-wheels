import { getEventName } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";

export type FilePondRejectReason = "max-files" | "max-size" | "accept";

export type FilePondFileEntry = {
  file: File;
  previewUrl: string | null;
};

function parsePositiveIntOrNone(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.trunc(n);
}

function parseMaxSize(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.trunc(n);
}

/** Returns true if `type` matches an accept token (MIME or image/* style). */
export function matchesAccept(type: string, accept: string): boolean {
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const mime = (type || "").toLowerCase();
  for (const token of tokens) {
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1); // e.g. "image/"
      if (mime.startsWith(prefix)) return true;
    } else if (token === mime) {
      return true;
    } else if (token.startsWith(".")) {
      // extension tokens are not matched against File.type in this minimal impl
      continue;
    }
  }
  return false;
}

function isImageMime(type: string): boolean {
  return type.toLowerCase().startsWith("image/");
}

export class TwFilePond extends HTMLElement {
  static observedAttributes = ["max-files", "max-size", "accept"];

  #entries: FilePondFileEntry[] = [];
  #input: HTMLInputElement | null = null;
  #list: HTMLElement | null = null;
  #dropzone: HTMLElement | null = null;
  #initialized = false;

  #onInputChange = (): void => {
    const files = Array.from(this.#input?.files ?? []);
    if (this.#input) this.#input.value = "";
    this.#ingest(files);
  };

  #onDropzoneClick = (): void => {
    this.#input?.click();
  };

  #onDragOver = (event: DragEvent): void => {
    event.preventDefault();
  };

  #onDrop = (event: DragEvent): void => {
    event.preventDefault();
    const dt = event.dataTransfer;
    if (!dt) return;
    const files: File[] = [];
    if (dt.items && dt.items.length > 0) {
      for (const item of Array.from(dt.items)) {
        if (item.kind !== "file") continue;
        const entry = (
          item as DataTransferItem & {
            webkitGetAsEntry?: () => { isDirectory?: boolean } | null;
          }
        ).webkitGetAsEntry?.();
        if (entry?.isDirectory) continue;
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length === 0) {
      files.push(...Array.from(dt.files ?? []));
    }
    this.#ingest(files);
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "file-pond");
    this.#ensureStructure();
    this.#syncInputAccept();
    this.#renderList();
    this.#input?.addEventListener("change", this.#onInputChange);
    this.#dropzone?.addEventListener("click", this.#onDropzoneClick);
    this.#dropzone?.addEventListener("dragover", this.#onDragOver);
    this.#dropzone?.addEventListener("drop", this.#onDrop);
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#input?.removeEventListener("change", this.#onInputChange);
    this.#dropzone?.removeEventListener("click", this.#onDropzoneClick);
    this.#dropzone?.removeEventListener("dragover", this.#onDragOver);
    this.#dropzone?.removeEventListener("drop", this.#onDrop);
    this.#revokeAll();
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized && !this.isConnected) return;
    if (name === "accept") this.#syncInputAccept();
  }

  get files(): File[] {
    return this.#entries.map((e) => e.file);
  }

  removeAt(index: number): void {
    if (!Number.isFinite(index)) return;
    const i = Math.trunc(index);
    if (i < 0 || i >= this.#entries.length) return;
    const [removed] = this.#entries.splice(i, 1);
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    this.#renderList();
    if (removed) {
      this.dispatchEvent(
        new CustomEvent(getEventName("remove"), {
          bubbles: true,
          detail: { file: removed.file },
        }),
      );
    }
  }

  clear(): void {
    const prev = [...this.#entries];
    this.#revokeAll();
    this.#entries = [];
    this.#renderList();
    for (const entry of prev) {
      this.dispatchEvent(
        new CustomEvent(getEventName("remove"), {
          bubbles: true,
          detail: { file: entry.file },
        }),
      );
    }
  }

  #ensureStructure(): void {
    if (this.#dropzone && this.#input && this.#list) return;

    const dropzone = document.createElement("div");
    dropzone.className = "file-pond-dropzone";
    dropzone.textContent = "ファイルを選択またはドロップ";

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.hidden = true;
    input.className = "file-pond-input";

    const list = document.createElement("ul");
    list.className = "file-pond-list";

    this.append(dropzone, input, list);
    this.#dropzone = dropzone;
    this.#input = input;
    this.#list = list;
  }

  #syncInputAccept(): void {
    if (!this.#input) return;
    const accept = this.getAttribute("accept");
    if (accept != null && accept.trim() !== "") {
      this.#input.accept = accept;
    } else {
      this.#input.removeAttribute("accept");
    }
  }

  #ingest(files: File[]): void {
    if (files.length === 0) return;
    const maxFiles = parsePositiveIntOrNone(this.getAttribute("max-files"));
    const maxSize = parseMaxSize(this.getAttribute("max-size"));
    const accept = this.getAttribute("accept")?.trim() ?? "";

    for (const file of files) {
      if (maxFiles != null && this.#entries.length >= maxFiles) {
        this.#reject(file, "max-files");
        continue;
      }
      if (maxSize != null && file.size > maxSize) {
        this.#reject(file, "max-size");
        continue;
      }
      if (accept !== "" && !matchesAccept(file.type, accept)) {
        this.#reject(file, "accept");
        continue;
      }

      const previewUrl = isImageMime(file.type)
        ? URL.createObjectURL(file)
        : null;
      this.#entries.push({ file, previewUrl });
      this.dispatchEvent(
        new CustomEvent(getEventName("add"), {
          bubbles: true,
          detail: { file },
        }),
      );
    }
    this.#renderList();
  }

  #reject(file: File, reason: FilePondRejectReason): void {
    this.dispatchEvent(
      new CustomEvent(getEventName("reject"), {
        bubbles: true,
        detail: { file, reason },
      }),
    );
  }

  #revokeAll(): void {
    for (const entry of this.#entries) {
      if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
    }
  }

  #renderList(): void {
    if (!this.#list) return;
    this.#list.replaceChildren();
    this.#entries.forEach((entry, index) => {
      const li = document.createElement("li");
      li.className = "file-pond-item";

      if (entry.previewUrl) {
        const img = document.createElement("img");
        img.className = "file-pond-thumb";
        img.src = entry.previewUrl;
        img.alt = entry.file.name;
        li.append(img);
      } else {
        const meta = document.createElement("div");
        meta.className = "file-pond-meta";
        meta.textContent = `${entry.file.name} (${entry.file.size} bytes)`;
        li.append(meta);
      }

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "file-pond-remove";
      remove.textContent = "削除";
      remove.addEventListener("click", () => this.removeAt(index));
      li.append(remove);

      this.#list!.append(li);
    });
  }
}

defineComponent("file-pond", TwFilePond);
