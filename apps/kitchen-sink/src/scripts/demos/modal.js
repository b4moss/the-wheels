import "@b4moss/the-wheels";

const live = document.querySelector(".ks-demo-split__live");
const modal = live?.querySelector("#demo-modal");

live?.querySelector("#open-modal")?.addEventListener("click", () => {
  modal?.showModal();
});
