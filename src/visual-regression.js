import sharp from "sharp";

export function validateScenarios(source) {
  if (!source || !Array.isArray(source.scenarios) || source.scenarios.length === 0) {
    throw new Error("Scenario file needs a non-empty scenarios array");
  }
  const ids = new Set();
  return source.scenarios.map((scenario) => {
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(scenario?.id || "")) throw new Error(`Invalid scenario id: ${scenario?.id || "(missing)"}`);
    if (ids.has(scenario.id)) throw new Error(`Duplicate scenario id: ${scenario.id}`);
    ids.add(scenario.id);
    if (scenario.states != null && (typeof scenario.states !== "object" || Array.isArray(scenario.states))) {
      throw new Error(`Scenario ${scenario.id} states must be an object`);
    }
    return { id: scenario.id, name: scenario.name || scenario.id, states: scenario.states || {} };
  });
}

export async function compareImages(actual, baseline, options = {}) {
  const threshold = Math.max(0, Math.min(255, Number(options.threshold ?? 0)));
  const actualImage = sharp(actual).ensureAlpha();
  const baselineImage = sharp(baseline).ensureAlpha();
  const [actualRaw, baselineRaw] = await Promise.all([
    actualImage.raw().toBuffer({ resolveWithObject: true }),
    baselineImage.raw().toBuffer({ resolveWithObject: true }),
  ]);
  const dimensionsMatch = actualRaw.info.width === baselineRaw.info.width && actualRaw.info.height === baselineRaw.info.height;
  if (!dimensionsMatch) {
    return {
      report: {
        kind: "visual-diff", passed: false, dimensions_match: false,
        actual: { width: actualRaw.info.width, height: actualRaw.info.height },
        baseline: { width: baselineRaw.info.width, height: baselineRaw.info.height },
        changed_pixels: null, changed_ratio: 1, bounds: null, threshold,
      },
      diff: await sharp({ create: { width: actualRaw.info.width, height: actualRaw.info.height, channels: 4, background: "#ff00ffff" } }).png().toBuffer(),
    };
  }

  const { width, height, channels } = actualRaw.info;
  const pixels = width * height;
  const diffData = Buffer.alloc(actualRaw.data.length);
  let changed = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let pixel = 0; pixel < pixels; pixel++) {
    const offset = pixel * channels;
    let delta = 0;
    for (let channel = 0; channel < 4; channel++) delta = Math.max(delta, Math.abs(actualRaw.data[offset + channel] - baselineRaw.data[offset + channel]));
    if (delta > threshold) {
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      changed++;
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      diffData[offset] = 255; diffData[offset + 1] = 0; diffData[offset + 2] = 64; diffData[offset + 3] = 255;
    } else {
      const gray = Math.round((actualRaw.data[offset] + actualRaw.data[offset + 1] + actualRaw.data[offset + 2]) / 3);
      diffData[offset] = gray; diffData[offset + 1] = gray; diffData[offset + 2] = gray; diffData[offset + 3] = 80;
    }
  }
  const changedRatio = changed / pixels;
  const maxRatio = Math.max(0, Number(options.maxRatio ?? 0));
  return {
    report: {
      kind: "visual-diff", passed: changedRatio <= maxRatio, dimensions_match: true,
      actual: { width, height }, baseline: { width, height }, changed_pixels: changed,
      total_pixels: pixels, changed_ratio: changedRatio, max_ratio: maxRatio,
      bounds: changed ? { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null,
      threshold,
    },
    diff: await sharp(diffData, { raw: { width, height, channels } }).png().toBuffer(),
  };
}
