import { handleGetAllAssets, serializeFigmaNodes } from '@firejet/firejet-js';
import { sendFrontend } from '../messaging';
import { TestCase } from '@firejet-sync/shared/types';

export async function handleDownloadSingleTestCase(
  nodes: SceneNode[],
  meta: {
    name: string;
    id: string;
  },
) {
  const usedSizes = new Set<number>();

  nodes.forEach((n) => {
    if (!n.absoluteBoundingBox) throw new Error('NO_BOUNDING_BOX');

    // FIXME: this is not a very good bound to have. The test cases should ideally have a metadata file which contains additional information
    if (usedSizes.has(n.absoluteBoundingBox.width))
      throw new Error(`REPEATED_SIZE ${n.absoluteBoundingBox.width}`);
  });

  // Sort by ascending order of width to guarantee that the test runner loads the images in the same way
  nodes.sort(
    (a, b) => a.absoluteBoundingBox!.width - b.absoluteBoundingBox!.width,
  );

  const serializedNodes = await serializeFigmaNodes(nodes);

  const targetImages = Object.fromEntries(
    await Promise.all(
      nodes.map(async (node) => {
        return [
          String(Math.round(node.absoluteBoundingBox!.width)),
          await node.exportAsync({ format: 'PNG', useAbsoluteBounds: true }),
        ] as const;
      }),
    ),
  );

  const assets = await handleGetAllAssets({
    nodeIds: nodes.map((node) => node.id),
  });

  const testCase = {
    ...meta,
    expected: targetImages,
    testCase: serializedNodes,
    assets,
  } satisfies TestCase;

  sendFrontend('handleTestCase', testCase);
}

export async function handleDownloadTestCases() {
  const testCases = figma.currentPage.selection;
  sendFrontend('handleTestCaseCount', { count: testCases.length });

  for (const selection of testCases) {
    const meta = {
      name: cleanName(selection.name),
      id: cleanName(selection.id),
    };

    if (selection.type === 'SECTION') {
      await handleDownloadSingleTestCase([...selection.children], meta);
    } else {
      await handleDownloadSingleTestCase([selection], meta);
    }
  }
}

function cleanName(name: string): string {
  return name
    .replaceAll('/', '-')
    .replaceAll('\\', '-')
    .replaceAll(':', '-')
    .replaceAll('|', '-')
    .replaceAll('<', '-')
    .replaceAll('>', '-')
    .replaceAll('*', '-')
    .replaceAll('?', '-');
}
