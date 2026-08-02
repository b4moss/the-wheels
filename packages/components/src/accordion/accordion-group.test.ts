import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  closeAccordionsByGroup,
  ensureAccordionGroupDelegation,
  openAccordionsByGroup,
} from "./accordion-group.js";

class FakeAccordion extends HTMLElement {
  open(): void {
    this.setAttribute("open", "");
    const details = this.querySelector("details");
    if (details) details.open = true;
  }

  close(): void {
    this.removeAttribute("open");
    const details = this.querySelector("details");
    if (details) details.open = false;
  }

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "accordion");
    if (!this.querySelector("details")) {
      const details = document.createElement("details");
      this.append(details);
    }
  }
}

function mountAccordion(groupId?: string): FakeAccordion {
  const node = document.createElement("fake-accordion") as FakeAccordion;
  if (groupId != null) node.setAttribute("data-tw-accordion-group", groupId);
  document.body.append(node);
  return node;
}

describe("accordion group helpers", () => {
  beforeEach(() => {
    if (!customElements.get("fake-accordion")) {
      customElements.define("fake-accordion", FakeAccordion);
    }
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  describe("openAccordionsByGroup / closeAccordionsByGroup", () => {
    it("opens all accordions with the same groupId", () => {
      const a = mountAccordion("faq");
      const b = mountAccordion("faq");
      openAccordionsByGroup("faq");
      expect(a.hasAttribute("open")).toBe(true);
      expect(b.hasAttribute("open")).toBe(true);
      expect(a.querySelector("details")?.open).toBe(true);
      expect(b.querySelector("details")?.open).toBe(true);
    });

    it("closes all accordions with the same groupId", () => {
      const a = mountAccordion("faq");
      const b = mountAccordion("faq");
      a.open();
      b.open();
      closeAccordionsByGroup("faq");
      expect(a.hasAttribute("open")).toBe(false);
      expect(b.hasAttribute("open")).toBe(false);
      expect(a.querySelector("details")?.open).toBe(false);
      expect(b.querySelector("details")?.open).toBe(false);
    });

    it("includes disjoint (non-adjacent) hosts in the same group", () => {
      const a = mountAccordion("faq");
      const spacer = document.createElement("div");
      spacer.append(document.createElement("span"));
      document.body.append(spacer);
      const b = mountAccordion("faq");

      openAccordionsByGroup("faq");
      expect(a.hasAttribute("open")).toBe(true);
      expect(b.hasAttribute("open")).toBe(true);
    });

    it("does nothing for a missing groupId (no throw)", () => {
      const a = mountAccordion("faq");
      expect(() => openAccordionsByGroup("missing")).not.toThrow();
      expect(() => closeAccordionsByGroup("missing")).not.toThrow();
      expect(a.hasAttribute("open")).toBe(false);
    });

    it("does nothing for an empty groupId (no throw)", () => {
      const a = mountAccordion("faq");
      expect(() => openAccordionsByGroup("")).not.toThrow();
      expect(() => closeAccordionsByGroup("")).not.toThrow();
      expect(a.hasAttribute("open")).toBe(false);
    });
  });

  describe("ensureAccordionGroupDelegation", () => {
    it("opens the matching group when an open button is clicked", () => {
      const a = mountAccordion("faq");
      const b = mountAccordion("faq");
      ensureAccordionGroupDelegation();

      const btn = document.createElement("button");
      btn.setAttribute("data-tw-accordion-open", "faq");
      document.body.append(btn);
      btn.click();

      expect(a.hasAttribute("open")).toBe(true);
      expect(b.hasAttribute("open")).toBe(true);
    });

    it("closes the matching group when a close button is clicked", () => {
      const a = mountAccordion("faq");
      const b = mountAccordion("faq");
      a.open();
      b.open();
      ensureAccordionGroupDelegation();

      const btn = document.createElement("button");
      btn.setAttribute("data-tw-accordion-close", "faq");
      document.body.append(btn);
      btn.click();

      expect(a.hasAttribute("open")).toBe(false);
      expect(b.hasAttribute("open")).toBe(false);
    });

    it("does not double-fire when ensure is called twice", () => {
      const a = mountAccordion("faq");
      const openSpy = vi.spyOn(a, "open");
      ensureAccordionGroupDelegation();
      ensureAccordionGroupDelegation();

      const btn = document.createElement("button");
      btn.setAttribute("data-tw-accordion-open", "faq");
      document.body.append(btn);
      btn.click();

      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(a.hasAttribute("open")).toBe(true);
    });

    it("ignores clicks without open/close attributes", () => {
      const a = mountAccordion("faq");
      ensureAccordionGroupDelegation();

      const btn = document.createElement("button");
      document.body.append(btn);
      btn.click();

      expect(a.hasAttribute("open")).toBe(false);
    });

    it("does nothing when the button group has no matching accordion", () => {
      const a = mountAccordion("faq");
      ensureAccordionGroupDelegation();

      const btn = document.createElement("button");
      btn.setAttribute("data-tw-accordion-open", "other");
      document.body.append(btn);
      expect(() => btn.click()).not.toThrow();
      expect(a.hasAttribute("open")).toBe(false);
    });
  });
});
