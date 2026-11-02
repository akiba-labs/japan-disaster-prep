import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLES, EXAMPLE_SHARED, isIndexable, parseShared, resultPath, safeCheck, sharedQuery } from "./share";

test("share links round-trip and compute", () => {
  for (const ex of EXAMPLES) {
    const back = parseShared(new URLSearchParams(sharedQuery(ex)));
    assert.deepEqual(back, ex);
    assert.ok(isIndexable(ex));
    assert.ok(safeCheck(ex), JSON.stringify(ex));
  }
  assert.equal(resultPath(EXAMPLE_SHARED), "/r?a=2&c=2&y=1979&b=wood");
  assert.equal(safeCheck(EXAMPLES[0])!.verdict, "not_prepared");
  assert.equal(safeCheck(EXAMPLES[1])!.stockpile.water.gap, 15);
  assert.equal(safeCheck(EXAMPLES[2])!.verdict, "partly_prepared");
});

test("bad share params → null or defaults", () => {
  assert.equal(parseShared(new URLSearchParams("a=0")), null);
  assert.equal(parseShared(new URLSearchParams("a=2&b=pirate"))!.buildingType, "unknown");
  assert.equal(parseShared(new URLSearchParams("a=x"))!.adults, 1);
  assert.equal(parseShared(new URLSearchParams("y=old"))!.builtYear, null);
});
