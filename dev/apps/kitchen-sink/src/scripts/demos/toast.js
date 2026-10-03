import "@b4moss/the-wheels";

const live = document.querySelector(".ks-demo-split__live");

const show = (id) => {
  live?.querySelector(`#${id}`)?.show?.();
};

live?.querySelector("#show-info")?.addEventListener("click", () => show("toast-info"));
live?.querySelector("#show-success")?.addEventListener("click", () => show("toast-success"));
live?.querySelector("#show-warning")?.addEventListener("click", () => show("toast-warning"));
live?.querySelector("#show-error")?.addEventListener("click", () => show("toast-error"));

live?.querySelector("#show-sticky")?.addEventListener("click", () => show("toast-sticky"));
live?.querySelector("#hide-sticky")?.addEventListener("click", () => {
  live?.querySelector("#toast-sticky")?.hide?.();
});

live?.querySelector("#show-stack")?.addEventListener("click", () => {
  show("toast-stack-a");
  show("toast-stack-b");
  show("toast-stack-c");
});
