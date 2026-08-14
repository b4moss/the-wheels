import { getPrefix } from "./prefix.js";

export function defineComponent(
  localName: string,
  ctor: CustomElementConstructor,
): void {
  const tagName = `${getPrefix()}${localName}`;
  if (customElements.get(tagName)) return;

  try {
    customElements.define(tagName, ctor);
  } catch {
    // Same constructor cannot be registered under a second tag name.
    if (customElements.get(tagName)) return;
    class PrefixedComponent extends ctor {}
    customElements.define(tagName, PrefixedComponent);
  }
}
