export function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

export function trimUrl(value: string) {
  return value.trim();
}
