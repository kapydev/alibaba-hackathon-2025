import { UserComponentExtended } from '@firejet-sync/shared/types';
import { compDataToSceneNode } from '../shared/compDataToSceneNode';
import { booleanFilter } from '@firejet-sync/shared/helpers';

interface CreateComponentLibrary {
  library: UserComponentExtended[];
  libraryName: string;
}

export async function handleCreateComponentLibrary(
  data: CreateComponentLibrary,
) {
  const sceneNodes = (
    await Promise.all(
      data.library.map((compData) => compDataToSceneNode(compData)),
    )
  ).filter(booleanFilter);

  const container = figma.createFrame();
  container.layoutMode = 'VERTICAL';
  container.itemSpacing = 16;
  container.name = data.libraryName;
  container.fills = [];
  container.clipsContent = false;
  container.layoutSizingHorizontal = 'HUG';
  container.layoutSizingVertical = 'HUG';
  sceneNodes.forEach((sceneNode) => container.appendChild(sceneNode));

  figma.currentPage.appendChild(container);

  return container;
}

export async function handleCreateComponentLibraryAndSampleInstances(
  data: CreateComponentLibrary,
) {
  const componentSetContainer = await handleCreateComponentLibrary(data);

  const instances = componentSetContainer.children
    .map((child) => {
      if (child.type === 'COMPONENT') {
        return child.createInstance();
      } else if (child.type === 'COMPONENT_SET') {
        const childComponent = child.children.find(
          (furtherChild) => furtherChild.type === 'COMPONENT',
        );
        if (childComponent?.type === 'COMPONENT') {
          return childComponent.createInstance();
        }
      }
      return undefined;
    })
    .filter(booleanFilter);

  const sampleInstanceContainer = figma.createFrame();
  sampleInstanceContainer.layoutMode = 'VERTICAL';
  sampleInstanceContainer.itemSpacing = 16;
  sampleInstanceContainer.name = data.libraryName;
  sampleInstanceContainer.fills = [];
  sampleInstanceContainer.clipsContent = false;
  sampleInstanceContainer.layoutSizingHorizontal = 'HUG';
  sampleInstanceContainer.layoutSizingVertical = 'HUG';
  instances.forEach((sceneNode) =>
    sampleInstanceContainer.appendChild(sceneNode),
  );

  const container = figma.createFrame();
  container.layoutMode = 'HORIZONTAL';
  container.itemSpacing = 64;
  container.name = data.libraryName;
  container.fills = [];
  container.clipsContent = false;
  container.layoutSizingHorizontal = 'HUG';
  container.layoutSizingVertical = 'HUG';
  [sampleInstanceContainer, componentSetContainer].forEach((sceneNode) =>
    container.appendChild(sceneNode),
  );

  figma.currentPage.appendChild(container);

  return container;
}
