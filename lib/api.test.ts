import assert from "node:assert/strict";
import test from "node:test";
import { apiHandler, openapiDoc, preflight } from "./agent-api";
import { API_DISCLAIMER, API_INFO, ENDPOINTS, EXAMPLE_GET, PUBLIC_URL } from "./api";

const e = ENDPOINTS.check;
const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, example: `${PUBLIC_URL}${e.example}` });

test(`GET ${EXAMPLE_GET} → 84 L water, 140 toilet uses, old standard`, async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${EXAMPLE_GET}`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  const body = await res.json();
  assert.equal(body.disclaimer, API_DISCLAIMER);
  assert.equal(body.verdict, "not_prepared");
  assert.equal(body.stockpile.water.target, 84);
  assert.equal(body.stockpile.toiletUses.target, 140);
  assert.equal(body.building.era, "old_standard");
  assert.equal(body.rulesAsOf, "2026-11-02");
  assert.ok(body.sources.length >= 8);
});

test("POST JSON body matches GET", async () => {
  const url = new URL(`${PUBLIC_URL}${EXAMPLE_GET}`);
  const post = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(url.searchParams)) }));
  const get = await handler(new Request(url));
  assert.equal(post.status, 200);
  assert.deepEqual(await post.json(), await get.json());
});

test("aliases, Japanese values and JSON types", async () => {
  const b = await (await handler(new Request(`${PUBLIC_URL}${e.path}?people=3&year=${encodeURIComponent("昭和55年")}&structure=${encodeURIComponent("マンション")}&home=${encodeURIComponent("賃貸")}&furniture=yes`))).json();
  assert.equal(b.household.persons, 3);
  assert.equal(b.building.buildingType, "non_wood");
  assert.equal(b.building.tenure, "rent");
  assert.equal(b.building.era, "old_standard");
  assert.equal(b.request[0].status, "partial");
  const p = await (await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adults: 1, days: 3, haveWaterLiters: 9, haveMeals: 9, haveToiletUses: 15, builtYear: 2012, furnitureFixed: true, hazardMap: true, route: true, goBag: true, drill: true }) }))).json();
  assert.equal(p.verdict, "well_prepared");
});

test("bad inputs → 400 with example", async () => {
  for (const q of ["adults=0", "adults=lots", "days=0", "days=45", "builtYear=old", "permitDate=1981-13-01", "buildingType=castle", "tenure=squat", "furnitureFixed=maybe", "haveWaterLiters=-3"]) {
    const res = await handler(new Request(`${PUBLIC_URL}${e.path}?${q}`));
    assert.equal(res.status, 400, q);
    const body = await res.json();
    assert.equal(body.disclaimer, API_DISCLAIMER);
    assert.ok(body.example);
  }
});

test("malformed JSON body → 400", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{nope" }));
  assert.equal(res.status, 400);
});

test("non-object JSON body ([], string, number, null) → 400 with a clear error", async () => {
  for (const body of ["[]", '"x"', "1", "null"]) {
    const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body }));
    assert.equal(res.status, 400, body);
    const j = await res.json();
    assert.match(j.error, /Body must be a JSON object/);
  }
});

test("OPTIONS preflight is CORS open", () => {
  const res = preflight();
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("OpenAPI lists /api/check GET and POST", () => {
  const spec = openapiDoc(API_INFO, PUBLIC_URL, [e]) as { openapi: string; paths: Record<string, { get: { parameters: { name: string }[] }; post: unknown }> };
  assert.ok(spec.openapi.startsWith("3."));
  assert.ok(spec.paths["/api/check"]?.post);
  assert.ok(spec.paths["/api/check"].get.parameters.find((p) => p.name === "builtYear"));
});
