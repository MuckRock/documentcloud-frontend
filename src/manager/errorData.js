export function extractErrorData(data) {
  let items = [];
  if (typeof data == "string") {
    items.push({
      key: null,
      values: [data]
    });
  } else if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      items = items.concat(extractErrorData(data[i]));
    }
  } else {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (/[0-9]+/.test(`${key}`)) {
          items = items.concat(extractErrorData(data[key]));
        } else {
          items.push({
            key,
            values: data[key]
          });
        }
      }
    }
  }
  return items;
}
