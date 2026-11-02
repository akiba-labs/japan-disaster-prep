import assert from "node:assert/strict";
import test from "node:test";
import { DISCLAIMER, RuleInputError, checkPrep, parseYear } from "./prep";

test("family of 4, 7 days, 1979 wooden house", () => {
  const r = checkPrep({ adults: 2, children: 2, builtYear: 1979, buildingType: "wood" });
  assert.equal(r.days, 7);
  assert.equal(r.stockpile.water.target, 84);
  assert.equal(r.stockpile.water.minimum3Days, 36);
  assert.equal(r.stockpile.water.bottles2L, 42);
  assert.equal(r.stockpile.meals.target, 84);
  assert.equal(r.stockpile.toiletUses.target, 140); // 防災庁: 4人 × 5回 × 7日 = 140
  assert.equal(r.building.era, "old_standard");
  assert.equal(r.verdict, "not_prepared");
  assert.equal(r.doneCount, 0);
  assert.equal(r.request.length, 5);
  assert.ok(r.summary.includes("耐震診断"));
  assert.equal(r.disclaimer, DISCLAIMER);
  assert.equal(r.rulesAsOf, "2026-11-02");
});

test("toilet uses: 1 person × 7 days = 35", () => {
  assert.equal(checkPrep({}).stockpile.toiletUses.target, 35);
  assert.equal(checkPrep({ days: 3 }).stockpile.water.target, 9);
});

test("gaps from what you have", () => {
  const r = checkPrep({ adults: 1, haveWaterLiters: 10, haveMeals: 30, haveToiletUses: 0 });
  assert.equal(r.stockpile.water.gap, 11);
  assert.equal(r.stockpile.meals.gap, 0);
  assert.equal(r.stockpile.toiletUses.gap, 35);
  assert.equal(r.request[1].status, "partial");
  const full = checkPrep({ adults: 1, haveWaterLiters: 21, haveMeals: 21, haveToiletUses: 35 });
  assert.equal(full.request[1].status, "done");
  assert.equal(full.request[1].todo.length, 0);
});

test("infants count for water, not meals or toilets", () => {
  const r = checkPrep({ adults: 2, infants: 1, days: 3 });
  assert.equal(r.stockpile.water.target, 27);
  assert.equal(r.stockpile.meals.target, 18);
  assert.equal(r.stockpile.toiletUses.target, 30);
  assert.ok(r.stockpile.alsoStock.some((s) => s.includes("液体ミルク")));
});

test("pets: 7 days food and water, minimum 5", () => {
  const r = checkPrep({ cats: 1, days: 3 });
  assert.equal(r.stockpile.pets?.foodAndWaterDays, 7);
  assert.equal(r.stockpile.pets?.minimumDays, 5);
  assert.equal(checkPrep({}).stockpile.pets, null);
});

test("building eras", () => {
  assert.equal(checkPrep({ permitDate: "1981-05-31" }).building.era, "old_standard");
  assert.equal(checkPrep({ permitDate: "1981-06-01" }).building.era, "new_standard");
  assert.equal(checkPrep({ permitDate: "1999-01-10", buildingType: "wood" }).building.era, "new_pre2000_wood");
  assert.equal(checkPrep({ permitDate: "2000-06-01", buildingType: "wood" }).building.era, "new_standard");
  assert.equal(checkPrep({ builtYear: 1981 }).building.era, "likely_old");
  assert.equal(checkPrep({ builtYear: "昭和56年" }).building.era, "likely_old");
  assert.equal(checkPrep({ builtYear: "H7", buildingType: "wood" }).building.era, "new_pre2000_wood");
  assert.equal(checkPrep({ builtYear: 1995, buildingType: "non_wood" }).building.era, "new_standard");
  assert.equal(checkPrep({}).building.era, "unknown");
  const rent = checkPrep({ builtYear: 1975, tenure: "rent" });
  assert.ok(rent.building.action.includes("landlord"));
});

test("wareki years", () => {
  assert.equal(parseYear("昭和54年"), 1979);
  assert.equal(parseYear("S56"), 1981);
  assert.equal(parseYear("平成元年"), 1989);
  assert.equal(parseYear("H12"), 2000);
  assert.equal(parseYear("令和2"), 2020);
  assert.equal(parseYear("１９８０"), 1980);
  assert.throws(() => parseYear("old"), RuleInputError);
});

test("all done → well_prepared", () => {
  const r = checkPrep({ adults: 1, days: 3, haveWaterLiters: 9, haveMeals: 9, haveToiletUses: 15, builtYear: 2010, furnitureFixed: true, hazardMapChecked: true, evacuationRouteChecked: true, goBagReady: true, drillJoined: true });
  assert.equal(r.verdict, "well_prepared");
  assert.equal(r.doneCount, 5);
  assert.ok(r.request.every((i) => i.todo.length === 0));
});

test("seismicDone makes an old house ok", () => {
  const r = checkPrep({ builtYear: 1970, seismicDone: true, furnitureFixed: true });
  assert.equal(r.request[0].status, "done");
});

test("bad input", () => {
  assert.throws(() => checkPrep({ adults: 0 }), RuleInputError);
  assert.throws(() => checkPrep({ adults: 1.5 }), RuleInputError);
  assert.throws(() => checkPrep({ days: 0 }), RuleInputError);
  assert.throws(() => checkPrep({ days: 31 }), RuleInputError);
  assert.throws(() => checkPrep({ permitDate: "1981-02-30" }), RuleInputError);
  assert.throws(() => checkPrep({ builtYear: 1700 }), RuleInputError);
  assert.throws(() => checkPrep({ haveWaterLiters: -1 }), RuleInputError);
});
