/** Build a DOM node from an HTML string (CSF3 without Lit). */
export function fromHtml(html: string): HTMLElement {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const { content } = template;
  if (content.childElementCount === 1) {
    return content.firstElementChild as HTMLElement;
  }
  const wrap = document.createElement("div");
  wrap.append(content);
  return wrap;
}
