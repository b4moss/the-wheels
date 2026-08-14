import "@b4moss/the-wheels";

const live = document.querySelector(".ks-demo-split__live");
const first = live?.querySelector("tw-accordion");

live?.querySelector("#open-first")?.addEventListener("click", () => {
  first?.open();
});
live?.querySelector("#close-first")?.addEventListener("click", () => {
  first?.close();
});
