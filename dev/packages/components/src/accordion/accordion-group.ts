type AccordionHost = HTMLElement & {
  open?: () => void;
  close?: () => void;
};

let delegationBound = false;

function queryGroup(groupId: string): AccordionHost[] {
  if (!groupId) return [];
  const selector = `[data-tw-component="accordion"][data-tw-accordion-group="${CSS.escape(groupId)}"]`;
  return Array.from(document.querySelectorAll(selector)) as AccordionHost[];
}

export function openAccordionsByGroup(groupId: string): void {
  for (const host of queryGroup(groupId)) {
    if (typeof host.open === "function") host.open();
    else {
      host.setAttribute("open", "");
      const details = host.querySelector("details");
      if (details) details.open = true;
    }
  }
}

export function closeAccordionsByGroup(groupId: string): void {
  for (const host of queryGroup(groupId)) {
    if (typeof host.close === "function") host.close();
    else {
      host.removeAttribute("open");
      const details = host.querySelector("details");
      if (details) details.open = false;
    }
  }
}

function onDocumentClick(event: Event): void {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const openEl = target.closest("[data-tw-accordion-open]");
  if (openEl) {
    const id = openEl.getAttribute("data-tw-accordion-open");
    if (id) openAccordionsByGroup(id);
    return;
  }

  const closeEl = target.closest("[data-tw-accordion-close]");
  if (closeEl) {
    const id = closeEl.getAttribute("data-tw-accordion-close");
    if (id) closeAccordionsByGroup(id);
  }
}

export function ensureAccordionGroupDelegation(): void {
  if (delegationBound) return;
  document.addEventListener("click", onDocumentClick);
  delegationBound = true;
}
