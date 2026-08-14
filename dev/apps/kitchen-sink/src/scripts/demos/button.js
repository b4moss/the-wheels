import "@b4moss/the-wheels";
import checkUrl from "@b4moss/the-wheels-components/assets/check.svg?url";

const live = document.querySelector(".ks-demo-split__live");

const icon = live?.querySelector("#btn-icon");
if (icon) icon.setAttribute("src", checkUrl);

const iconRight = live?.querySelector("#btn-icon-right");
if (iconRight) iconRight.setAttribute("src", checkUrl);

live?.querySelector("#reset-btn")?.addEventListener("click", () => {
  live?.querySelector("#click-once")?.reset();
});
