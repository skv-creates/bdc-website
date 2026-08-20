#!/usr/bin/env node
/**
 * OpenNext merges into `.open-next` instead of guaranteeing a clean output
 * directory. A staging build therefore leaves its Storybook assets behind for
 * a later production build unless we remove the generated bundle first.
 *
 * Both deploy commands call this before building so the upload manifest can
 * contain only assets produced for the environment being deployed.
 */
import { rmSync } from "node:fs";
import { resolve } from "node:path";

rmSync(resolve(import.meta.dirname, "..", ".open-next"), {
  recursive: true,
  force: true,
});
