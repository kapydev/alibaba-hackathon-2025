import { throwOnDev } from '@firejet-sync/shared/errors';
import { booleanFilter } from '@firejet-sync/shared/helpers';
import { ConversionConfig } from '@firejet-sync/shared/types';

export async function getJSONTrees({
  nodeIds,
  // config,
}: {
  nodeIds: string[];
  // config: ConversionConfig;
}) {
  const serializedNodes = (
    await Promise.all(
      nodeIds.map(async (nodeId) => {
        try {
          const node = await figma.getNodeByIdAsync(nodeId);
          if (!node) return undefined;
          if (!('exportAsync' in node)) {
            throwOnDev('NODE_NOT_EXPORTABLE');
            return undefined;
          }
          const nodeObj = await node.exportAsync({
            format: 'JSON_REST_V1',
            //TODO: Need to handle the missing geometry paths option somehow
            // geometry: 'paths',
          } as ExportSettingsREST);
          return nodeObj;
        } catch {
          return undefined;
        }
      }),
    )
  ).filter(booleanFilter);

  return serializedNodes;
}
