export function expandDotFields(data) {
  const out = {};

  for (const [key, value] of Object.entries(data || {})) {
    if (!key.includes(".")) {
      out[key] = value;
      continue;
    }

    const parts = key.split(".");
    let cur = out;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) {
        cur[p] = value;
      } else {
        cur[p] ??= {};
        cur = cur[p];
      }
    }
  }

  return out;
}
