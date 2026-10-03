import "@b4moss/the-wheels";

const live = document.querySelector(".ks-demo-split__live");
const tabs = live?.querySelector("#tabs-controlled");

live?.querySelector("#select-js")?.addEventListener("click", () => {
  tabs?.select(0);
});
live?.querySelector("#select-ts")?.addEventListener("click", () => {
  tabs?.select(1);
});

const changing = live?.querySelector("#tabs-change");
const label = live?.querySelector("#tabs-change-label");
changing?.addEventListener("tw-change", (event) => {
  if (label) label.textContent = `selectedIndex: ${event.detail.selectedIndex}`;
});
