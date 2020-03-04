export function extractErrorData(data, topLevel = true) {
  let items = [];
  if (typeof data == "string") {
    items.push(
      topLevel
        ? {
            key: null,
            values: [data]
          }
        : data
    );
  } else if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      items = topLevel
        ? items.concat([
            { key: null, values: extractErrorData(data[i], false) }
          ])
        : items.concat(extractErrorData(data[i], false));
    }
  } else {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (/[0-9]+/.test(`${key}`)) {
          items = items.concat(extractErrorData(data[key], false));
        } else {
          items.push({
            key,
            values: extractErrorData(data[key], false)
          });
        }
      }
    }
  }
  return items;
}
