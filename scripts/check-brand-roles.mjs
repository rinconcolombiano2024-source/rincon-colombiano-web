import assert from "node:assert/strict";
import { canUploadBrand, canPublishBrand, canRetireBrand } from "../src/lib/admin/brand-permissions.ts";

// Regression: authenticated is not equivalent to authorized.
// Only expected roles can invoke actions using a service_role client.
for (const role of ["owner", "editor", "publisher"]) {
  const expected = {
    owner: [true, true, true],
    editor: [true, false, false],
    publisher: [false, true, true],
  }[role];

  assert.deepEqual(
    [canUploadBrand(role), canPublishBrand(role), canRetireBrand(role)],
    expected,
    `Unexpected privileged brand actions for ${role}`,
  );
}

// Runtime checks are defensive even if a caller bypasses TS.
for (const role of ["anonymous", "reader", "", null]) {
  assert.equal(canUploadBrand(role), false);
  assert.equal(canPublishBrand(role), false);
  assert.equal(canRetireBrand(role), false);
}

console.log("PASS: least-privilege brand roles (owner / editor / publisher)");
