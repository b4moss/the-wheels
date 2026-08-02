import "@b4moss/the-wheels";

const FRUITS = [
  { value: 1, label: "Apple", updated_at: 10 },
  { value: 2, label: "Banana", updated_at: 20 },
  { value: 3, label: "Cherry", updated_at: 30 },
  { value: 4, label: "Date", updated_at: 40 },
  { value: 5, label: "Elderberry", updated_at: 50 },
  { value: 6, label: "Fig", updated_at: 60 },
  { value: 7, label: "Grape", updated_at: 70 },
  { value: 8, label: "Honeydew", updated_at: 80 },
];

function formatValue(value) {
  if (value == null) return "(未選択)";
  if (Array.isArray(value) && value.length === 0) return "(未選択)";
  return JSON.stringify(value);
}

function syncLabel(id, valueElId) {
  const cb = document.getElementById(id);
  const out = document.getElementById(valueElId);
  if (!cb || !out) return;
  const paint = () => {
    out.textContent = `value: ${formatValue(cb.value)}`;
  };
  cb.addEventListener("change", paint);
  paint();
}

const staticCb = document.getElementById("cb-static");
if (staticCb) {
  staticCb.options = FRUITS.slice(0, 5);
  syncLabel("cb-static", "cb-static-value");
}

const asyncCb = document.getElementById("cb-async");
if (asyncCb) {
  asyncCb.loadOptions = async ({ query, page, direction }) => {
    await new Promise((r) => setTimeout(r, 120));
    const q = String(query ?? "").toLowerCase();
    const pageNum = typeof page === "number" ? page : Number(page) || 1;
    const filtered = FRUITS.filter((f) =>
      f.label.toLowerCase().includes(q),
    );
    const start = direction === "initial" ? 0 : (pageNum - 1) * 3;
    const slice = filtered.slice(start, start + 3);
    return {
      items: slice,
      hasMore: start + 3 < filtered.length,
      nextPage: pageNum + 1,
    };
  };
}

const hybridCb = document.getElementById("cb-hybrid");
if (hybridCb) {
  hybridCb.options = [
    { value: "s1", label: "（静的）Starfruit", updated_at: 5 },
    { value: "s2", label: "（静的）Strawberry", updated_at: 8 },
  ];
  hybridCb.loadOptions = async ({ query }) => {
    await new Promise((r) => setTimeout(r, 100));
    const q = String(query ?? "").toLowerCase();
    const items = FRUITS.filter((f) => f.label.toLowerCase().includes(q)).map(
      (f) => ({ ...f, label: `（取得）${f.label}` }),
    );
    return { items, hasMore: false };
  };
}
