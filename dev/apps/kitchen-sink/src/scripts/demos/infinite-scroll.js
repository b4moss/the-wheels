import "@b4moss/the-wheels";

const el = document.getElementById("is-demo");
if (el) {
  let seq = 100;
  el.autoLoad = false;
  el.loadItems = async ({ direction, page }) => {
    await new Promise((r) => setTimeout(r, 80));
    const pageNum = typeof page === "number" ? page : Number(page) || 1;
    const base =
      direction === "up" ? seq + 50 + pageNum * 10 : seq - pageNum * 10;
    const items = Array.from({ length: 5 }, (_, i) => {
      const n = base - i;
      return {
        value: `item-${direction}-${pageNum}-${i}`,
        label: `#${n} (${direction} p${pageNum})`,
        updated_at: n,
      };
    });
    return {
      items,
      hasMore: pageNum < 4,
      nextPage: pageNum + 1,
    };
  };
  el.refresh();
}
