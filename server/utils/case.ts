export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj instanceof Date) return obj;
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
    }
    return result;
  }
  return obj;
}

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj instanceof Date) return obj;
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = toSnakeCase(obj[key]);
    }
    return result;
  }
  return obj;
}
