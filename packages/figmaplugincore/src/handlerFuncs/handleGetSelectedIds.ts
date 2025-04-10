export function handleGetSelectedIds() {
  return figma.currentPage.selection.map((node) => node.id);
}
