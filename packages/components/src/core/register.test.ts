import { beforeEach, describe, expect, it } from "vitest";
import { getPrefix, setPrefix } from "./prefix.js";
import { defineComponent } from "./register.js";

describe("defineComponent", () => {
  beforeEach(() => {
    setPrefix("tw-");
  });

  it("registers ctor under getPrefix() + localName", () => {
    const localName = `btn-${crypto.randomUUID().slice(0, 8)}`;
    class TestButton extends HTMLElement {}
    defineComponent(localName, TestButton);
    expect(customElements.get(`${getPrefix()}${localName}`)).toBe(TestButton);
  });

  it("registers under a custom prefix", () => {
    setPrefix("app");
    const localName = `spin-${crypto.randomUUID().slice(0, 8)}`;
    class TestSpinner extends HTMLElement {}
    defineComponent(localName, TestSpinner);
    expect(customElements.get(`app-${localName}`)).toBe(TestSpinner);
  });

  it("is a no-op when the same tag is already registered", () => {
    const localName = `dup-${crypto.randomUUID().slice(0, 8)}`;
    class First extends HTMLElement {}
    class Second extends HTMLElement {}
    defineComponent(localName, First);
    expect(() => defineComponent(localName, Second)).not.toThrow();
    expect(customElements.get(`tw-${localName}`)).toBe(First);
  });

  it("does not overwrite a tag registered with another constructor", () => {
    const localName = `ext-${crypto.randomUUID().slice(0, 8)}`;
    const tag = `tw-${localName}`;
    class External extends HTMLElement {}
    class Ours extends HTMLElement {}
    customElements.define(tag, External);
    expect(() => defineComponent(localName, Ours)).not.toThrow();
    expect(customElements.get(tag)).toBe(External);
  });
});
