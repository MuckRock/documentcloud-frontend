function addValue(collectedData, key, value) {
  for (let i = 0; i < collectedData.length; i++) {
    const { key: existingKey, values } = collectedData[i];
    if (key == existingKey) {
      collectedData[i].values = [...values, value];
      return;
    }
  }

  collectedData.push({ key, values: [value] });
}

export function extractErrorData(data, key = null, collectedData = []) {
  if (typeof data == "string") {
    addValue(collectedData, key, data);
  } else if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      extractErrorData(data[i], key, collectedData);
    }
  } else {
    // Object-like
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        extractErrorData(data[key], key, collectedData);
      }
    }
  }

  return collectedData;
}
