import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEventName, getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { matchesAccept, TwFilePond } from "./tw-file-pond.js";

function tag(): string {
  return `${getPrefix()}file-pond`;
}

function file(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

async function mount(attrs: Record<string, string> = {}): Promise<TwFilePond> {
  const el = document.createElement(tag()) as TwFilePond;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.append(el);
  await Promise.resolve();
  return el;
}

function setInputFiles(el: TwFilePond, files: File[]): void {
  const input = el.querySelector(".file-pond-input") as HTMLInputElement;
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  input.files = dt.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("matchesAccept", () => {
  it("matches exact and wildcard MIME", () => {
    expect(matchesAccept("image/png", "image/png")).toBe(true);
    expect(matchesAccept("image/jpeg", "image/*")).toBe(true);
    expect(matchesAccept("text/plain", "image/png")).toBe(false);
    expect(matchesAccept("text/plain", "")).toBe(true);
  });
});

describe("TwFilePond", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("file-pond", TwFilePond);
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it("sets data-tw-component", async () => {
    const el = await mount();
    expect(el.getAttribute("data-tw-component")).toBe("file-pond");
  });

  it("adds files from input and emits add", async () => {
    const el = await mount();
    const spy = vi.fn();
    el.addEventListener(getEventName("add"), spy);
    setInputFiles(el, [file("a.txt", "text/plain", 4)]);
    expect(el.files.length).toBe(1);
    expect(el.files[0]!.name).toBe("a.txt");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("empty selection does nothing", async () => {
    const el = await mount();
    const add = vi.fn();
    const reject = vi.fn();
    el.addEventListener(getEventName("add"), add);
    el.addEventListener(getEventName("reject"), reject);
    setInputFiles(el, []);
    expect(el.files.length).toBe(0);
    expect(add).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
  });

  it("enforces max-files", async () => {
    const el = await mount({ "max-files": "1" });
    const reject = vi.fn();
    el.addEventListener(getEventName("reject"), reject);
    setInputFiles(el, [
      file("a.txt", "text/plain", 1),
      file("b.txt", "text/plain", 1),
    ]);
    expect(el.files.length).toBe(1);
    expect(reject).toHaveBeenCalled();
    expect(reject.mock.calls[0]![0].detail.reason).toBe("max-files");
  });

  it("enforces max-size", async () => {
    const el = await mount({ "max-size": "10" });
    const reject = vi.fn();
    el.addEventListener(getEventName("reject"), reject);
    setInputFiles(el, [file("big.bin", "application/octet-stream", 20)]);
    expect(el.files.length).toBe(0);
    expect(reject.mock.calls[0]![0].detail.reason).toBe("max-size");
  });

  it("enforces accept", async () => {
    const el = await mount({ accept: "image/png" });
    const reject = vi.fn();
    el.addEventListener(getEventName("reject"), reject);
    setInputFiles(el, [file("a.txt", "text/plain", 1)]);
    expect(el.files.length).toBe(0);
    expect(reject.mock.calls[0]![0].detail.reason).toBe("accept");
  });

  it("shows image thumb and text meta for non-images", async () => {
    const el = await mount();
    setInputFiles(el, [
      file("pic.png", "image/png", 8),
      file("doc.txt", "text/plain", 3),
    ]);
    expect(el.querySelector(".file-pond-thumb")).not.toBeNull();
    expect(el.querySelector(".file-pond-meta")?.textContent).toContain("doc.txt");
  });

  it("removeAt and clear emit remove and update files", async () => {
    const el = await mount();
    setInputFiles(el, [
      file("a.txt", "text/plain", 1),
      file("b.txt", "text/plain", 1),
    ]);
    const remove = vi.fn();
    el.addEventListener(getEventName("remove"), remove);
    el.removeAt(0);
    expect(el.files.length).toBe(1);
    expect(el.files[0]!.name).toBe("b.txt");
    expect(remove).toHaveBeenCalled();
    el.clear();
    expect(el.files.length).toBe(0);
  });

  it("out-of-range removeAt is a no-op", async () => {
    const el = await mount();
    setInputFiles(el, [file("a.txt", "text/plain", 1)]);
    el.removeAt(3);
    expect(el.files.length).toBe(1);
  });

  it("accepts drop of files", async () => {
    const el = await mount();
    const zone = el.querySelector(".file-pond-dropzone") as HTMLElement;
    const f = file("d.txt", "text/plain", 2);
    const dt = {
      files: [f] as unknown as FileList,
      items: [] as unknown as DataTransferItemList,
    } as DataTransfer;
    const event = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: dt });
    zone.dispatchEvent(event);
    expect(el.files.length).toBe(1);
  });

  it("follows setPrefix for events", async () => {
    setPrefix("app-");
    defineComponent("file-pond", TwFilePond);
    const el = document.createElement("app-file-pond") as TwFilePond;
    document.body.append(el);
    await Promise.resolve();
    const spy = vi.fn();
    el.addEventListener("app-add", spy);
    setInputFiles(el, [file("a.txt", "text/plain", 1)]);
    expect(spy).toHaveBeenCalled();
  });
});
