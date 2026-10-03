import "@b4moss/the-wheels";

const live = document.querySelector(".ks-demo-split__live");
const log = live?.querySelector("#pond-event-log")?.querySelector("code");
const pond = live?.querySelector("#pond-reject");

const append = (line) => {
  if (!log) return;
  const prev = log.textContent === "（イベントログ）" ? "" : `${log.textContent}\n`;
  log.textContent = `${prev}${line}`;
};

pond?.addEventListener("tw-add", (event) => {
  append(`add: ${event.detail.file.name}`);
});
pond?.addEventListener("tw-remove", (event) => {
  append(`remove: ${event.detail.file.name}`);
});
pond?.addEventListener("tw-reject", (event) => {
  append(`reject: ${event.detail.file.name} (${event.detail.reason})`);
});
