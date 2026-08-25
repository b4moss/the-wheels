const el = document.querySelector("tw-pagination");
const label = document.getElementById("pagination-page-label");
el?.addEventListener("tw-change", (event) => {
  if (label) label.textContent = `page: ${event.detail.page}`;
});
