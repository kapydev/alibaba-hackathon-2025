import { sendFrontend } from '../messaging';

export async function handleSelectTopLevelComponents() {
  const topLevelComponents: SceneNode[] = [];

  figma.currentPage.children.forEach((child) => {
    if (child.type !== 'COMPONENT' && child.type !== 'COMPONENT_SET') return;
    topLevelComponents.push(child);
  });

  figma.currentPage.selection = topLevelComponents;
  sendFrontend('topLevelComponentsSelected');
}
