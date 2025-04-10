import { handleGetSelectedIds } from '../handleGetSelectedIds';
import { getSerializedFigmaNode } from '../getSerializedFigmaNode';
import { deserializeRawTree } from './deserialize';

export async function handleGenerateAndDeserialize() {
  const selectedNodes = handleGetSelectedIds();
  if (selectedNodes.length !== 1) {
    throw new Error('Select only one node to convert!');
  }

  const rawTree = await getSerializedFigmaNode();

  handleDeserialize(rawTree);
}

/**Converts a tree to scene nodes */
export async function handleDeserialize(serializedTree: {
  engineOne: null;
  engineTwo: string;
}) {
  const figmaNodes: SceneNode[] = await deserializeRawTree(
    serializedTree.engineTwo,
  );

  const newPage = figma.createPage();
  newPage.name = 'NEW PAGE';
  newPage.insertChild(0, figmaNodes[0]);
}
