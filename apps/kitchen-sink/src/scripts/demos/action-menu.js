import "@b4moss/the-wheels";
import checkUrl from "@b4moss/the-wheels-components/assets/check.svg?url";

const live = document.querySelector(".ks-demo-split__live");
const swap = live?.querySelector("#src-swap");
if (swap) swap.setAttribute("src", checkUrl);
