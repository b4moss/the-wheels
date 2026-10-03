import "@b4moss/the-wheels";

const live = document.querySelector(".ks-demo-split__live");

const bind = (pagerId, labelId) => {
  const el = live?.querySelector(`#${pagerId}`);
  const label = live?.querySelector(`#${labelId}`);
  el?.addEventListener("tw-change", (event) => {
    if (label) label.textContent = `page: ${event.detail.page}`;
  });
};

bind("pager-first", "pagination-first-label");
bind("pager-middle", "pagination-middle-label");
bind("pager-last", "pagination-last-label");
