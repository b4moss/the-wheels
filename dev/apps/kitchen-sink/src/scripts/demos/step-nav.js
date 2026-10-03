import "@b4moss/the-wheels";

const live = document.querySelector(".ks-demo-split__live");
const nav = live?.querySelector("#step-nav-api");

live?.querySelector("#step-to-0")?.addEventListener("click", () => {
  nav?.setCurrent(0);
});
live?.querySelector("#step-to-1")?.addEventListener("click", () => {
  nav?.setCurrent(1);
});
live?.querySelector("#step-to-2")?.addEventListener("click", () => {
  nav?.setCurrent(2);
});
