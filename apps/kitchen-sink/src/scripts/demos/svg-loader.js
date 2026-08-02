import "@b4moss/the-wheels";
import checkUrl from "@b4moss/the-wheels-components/assets/check.svg?url";
import chevronUrl from "@b4moss/the-wheels-components/assets/chevron.svg?url";
import menuUrl from "@b4moss/the-wheels-components/assets/menu.svg?url";

const live = document.querySelector(".ks-demo-split__live");

live?.querySelector("#icon-check")?.setAttribute("src", checkUrl);
live?.querySelector("#icon-chevron")?.setAttribute("src", chevronUrl);
live?.querySelector("#icon-chevron-rot")?.setAttribute("src", chevronUrl);
live?.querySelector("#icon-menu")?.setAttribute("src", menuUrl);
