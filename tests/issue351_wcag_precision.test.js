import test from "node:test";
import assert from "node:assert/strict";
import { checkWcag, getContrastRatio } from "../scripts/wcag_check.js";

function oracleLum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function oracleRatio(fg, bg) {
  const l1 = oracleLum(fg), l2 = oracleLum(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

test("caso #070707/#777777 reprova passAA e valid usando razão exata", () => {
  const res = checkWcag({ fg: "#070707", bg: "#777777" });
  const ratio = getContrastRatio("#070707", "#777777");
  const expectedRatio = oracleRatio("#070707", "#777777");

  assert.equal(ratio, expectedRatio);
  assert.ok(ratio < 4.5);
  assert.equal(res.contrast.ratio, expectedRatio);
  assert.equal(res.contrast.passAA, false);
  assert.equal(res.contrast.passLarge, true);
  assert.equal(res.valid, false);
});

test("oraculo sRGB independente nos limites 4.5 e 3.0 e preservacao de 21 e 1", () => {
  assert.equal(getContrastRatio("#000000", "#ffffff"), 21);
  assert.equal(oracleRatio("#000000", "#ffffff"), 21);
  assert.equal(getContrastRatio("#ffffff", "#ffffff"), 1);
  assert.equal(oracleRatio("#ffffff", "#ffffff"), 1);

  const r45Below = oracleRatio("#070707", "#777777");
  const r45Above = oracleRatio("#060606", "#777777");
  assert.ok(r45Below < 4.5 && r45Below >= 4.49);
  assert.ok(r45Above >= 4.5);
  assert.equal(checkWcag({ fg: "#070707", bg: "#777777" }).contrast.passAA, false);
  assert.equal(checkWcag({ fg: "#060606", bg: "#777777" }).contrast.passAA, true);

  const r30Below = oracleRatio("#2e2f2f", "#777777");
  const r30Above = oracleRatio("#2e2e2e", "#777777");
  assert.ok(r30Below < 3.0 && r30Below >= 2.99);
  assert.ok(r30Above >= 3.0);
  assert.equal(checkWcag({ fg: "#2e2f2f", bg: "#777777" }).contrast.passLarge, false);
  assert.equal(checkWcag({ fg: "#2e2e2e", bg: "#777777" }).contrast.passLarge, true);
});
