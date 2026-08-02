import { describe, expect, it } from "vitest";
import {
  mergeWindowItems,
  trimWindowItems,
  type WindowItem,
} from "./window.js";

type Item = WindowItem & { label?: string; updated_at?: number };

describe("mergeWindowItems", () => {
  it("merges empty + one item (desc by updated_at)", () => {
    const result = mergeWindowItems<Item>(
      [],
      [{ value: 1, label: "a", updated_at: 10 }],
      "updated_at",
      "desc",
    );
    expect(result).toEqual([{ value: 1, label: "a", updated_at: 10 }]);
  });

  it("inserts by sort key (desc)", () => {
    const existing: Item[] = [
      { value: "a", updated_at: 20 },
      { value: "b", updated_at: 10 },
    ];
    const result = mergeWindowItems<Item>(
      existing,
      [{ value: "c", updated_at: 15 }],
      "updated_at",
      "desc",
    );
    expect(result.map((i) => i.updated_at)).toEqual([20, 15, 10]);
  });

  it("incoming same value overwrites and does not grow count", () => {
    const existing: Item[] = [
      { value: 1, label: "old", updated_at: 10 },
      { value: 2, label: "b", updated_at: 5 },
    ];
    const result = mergeWindowItems<Item>(
      existing,
      [{ value: 1, label: "new", updated_at: 10 }],
      "updated_at",
      "desc",
    );
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.value === 1)?.label).toBe("new");
  });

  it("sorts ascending when sortDirection=asc", () => {
    const result = mergeWindowItems<Item>(
      [
        { value: 1, updated_at: 20 },
        { value: 2, updated_at: 10 },
      ],
      [{ value: 3, updated_at: 15 }],
      "updated_at",
      "asc",
    );
    expect(result.map((i) => i.updated_at)).toEqual([10, 15, 20]);
  });

  it("pushes items missing sortKey to the end (no throw)", () => {
    const result = mergeWindowItems<Item>(
      [],
      [
        { value: 1, updated_at: 10 },
        { value: 2 },
        { value: 3, updated_at: 20 },
      ],
      "updated_at",
      "desc",
    );
    expect(result.map((i) => i.value)).toEqual([3, 1, 2]);
  });

  it("empty incoming re-sorts existing without throw", () => {
    const existing: Item[] = [
      { value: 1, updated_at: 5 },
      { value: 2, updated_at: 15 },
    ];
    const result = mergeWindowItems<Item>(existing, [], "updated_at", "desc");
    expect(result.map((i) => i.value)).toEqual([2, 1]);
  });
});

describe("trimWindowItems", () => {
  it("trims from start when overflowing (down-load default)", () => {
    const items = [
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
    ];
    const result = trimWindowItems(items, 3, "start");
    expect(result.map((i) => i.value)).toEqual([2, 3, 4]);
  });

  it("keeps all when under maxItems", () => {
    const items = [{ value: 1 }, { value: 2 }];
    expect(trimWindowItems(items, 3, "start")).toEqual(items);
  });

  it("maxItems <= 0 returns empty array (no throw)", () => {
    expect(trimWindowItems([{ value: 1 }], 0, "start")).toEqual([]);
    expect(trimWindowItems([{ value: 1 }], -2, "start")).toEqual([]);
  });
});
