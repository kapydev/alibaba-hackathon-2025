export function traverse<T extends { children?: T[] }>(
  root: T,
  cb: (curNode: T) => void
) {
  cb(root);
  root.children?.forEach((child) => traverse(child, cb));
}
