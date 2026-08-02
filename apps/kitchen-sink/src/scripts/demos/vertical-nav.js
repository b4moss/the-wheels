import "@b4moss/the-wheels";
import menuUrl from "@b4moss/the-wheels-components/assets/menu.svg?url";

const live = document.querySelector(".ks-demo-split__live");
const icon = live?.querySelector("#nav-home-icon");
if (icon) icon.setAttribute("src", menuUrl);
