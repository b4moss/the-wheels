import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./tw-avatar.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body.firstElementChild as HTMLElement;
}

describe("TwAvatar", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("sets data-tw-component", () => {
    const el = mount(`<tw-avatar name="山田"></tw-avatar>`);
    expect(el.getAttribute("data-tw-component")).toBe("avatar");
  });

  it("renders first grapheme from name", () => {
    const el = mount(`<tw-avatar name="山田"></tw-avatar>`);
    expect(el.querySelector(".avatar-initial")?.textContent).toBe("山");
  });

  it("renders emoji grapheme", () => {
    const el = mount(`<tw-avatar name="😀テスト"></tw-avatar>`);
    expect(el.querySelector(".avatar-initial")?.textContent).toBe("😀");
  });

  it("uses contrasting text color for black and white backgrounds", () => {
    const dark = mount(`<tw-avatar name="A" color="#000000"></tw-avatar>`);
    expect(
      (dark.querySelector(".avatar") as HTMLElement).style.color.toLowerCase(),
    ).toMatch(/^(#ffffff|rgb\(255,\s*255,\s*255\))$/);

    document.body.innerHTML = "";
    const light = mount(`<tw-avatar name="A" color="#ffffff"></tw-avatar>`);
    expect(
      (light.querySelector(".avatar") as HTMLElement).style.color.toLowerCase(),
    ).toMatch(/^(#000000|rgb\(0,\s*0,\s*0\))$/);
  });

  it("shows empty initial when name is missing", () => {
    const el = mount(`<tw-avatar></tw-avatar>`);
    expect(el.querySelector(".avatar-initial")?.textContent).toBe("");
  });

  it("falls back to default background for invalid color", () => {
    const el = mount(`<tw-avatar name="A" color="nope"></tw-avatar>`);
    const bg = (
      el.querySelector(".avatar") as HTMLElement
    ).style.backgroundColor.toLowerCase();
    expect(bg).toMatch(/^(#e1e1e1|rgb\(225,\s*225,\s*225\))$/);
  });

  it("renders image when image-path is set", () => {
    const el = mount(
      `<tw-avatar image-path="https://example.com/a.png" alt="User" name="A"></tw-avatar>`,
    );
    const img = el.querySelector("img.avatar-image") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("https://example.com/a.png");
    expect(img.getAttribute("alt")).toBe("User");
    expect(el.querySelector(".avatar")?.classList.contains("avatar--image")).toBe(
      true,
    );
  });

  it("falls back to initial when image errors", () => {
    const el = mount(
      `<tw-avatar image-path="https://example.com/missing.png" name="山"></tw-avatar>`,
    );
    const img = el.querySelector("img.avatar-image") as HTMLImageElement;
    img.dispatchEvent(new Event("error"));
    expect(el.querySelector(".avatar-initial")?.textContent).toBe("山");
    expect(el.querySelector("img.avatar-image")).toBeNull();
  });

  it("uses default size 40 and parses width/height", () => {
    const el = mount(`<tw-avatar name="A"></tw-avatar>`);
    const root = el.querySelector(".avatar") as HTMLElement;
    expect(root.style.width).toBe("40px");
    expect(root.style.height).toBe("40px");

    el.setAttribute("width", "64");
    el.setAttribute("height", "48");
    expect(root.style.width).toBe("64px");
    expect(root.style.height).toBe("48px");
  });

  it("falls back invalid sizes to 40", () => {
    const el = mount(
      `<tw-avatar name="A" width="-1" height="abc"></tw-avatar>`,
    );
    const root = el.querySelector(".avatar") as HTMLElement;
    expect(root.style.width).toBe("40px");
    expect(root.style.height).toBe("40px");
  });

  it("treats empty image-path as initial mode", () => {
    const el = mount(`<tw-avatar image-path="" name="山"></tw-avatar>`);
    expect(el.querySelector("img")).toBeNull();
    expect(el.querySelector(".avatar-initial")?.textContent).toBe("山");
  });
});
