import { sendFrontend } from '../messaging';

export async function getImageFromSelectedFrame() {
  //Get images of everything on page
  const selectedComponents = figma.currentPage.selection;

  const allResults = await Promise.all(
    selectedComponents.map(async (component) => {
      const result = await component.exportAsync({ format: 'PNG' });
      return {
        name: component.name,
        expectedImage: result,
        nodeId: component.id,
      };
    }),
  );
  sendFrontend('imageFromSelectedFrame', allResults);

  // return sendReply();
}

// TODO remove and fix such that you can run this in multiple places at the same time
export async function getFullDesignImageFromSelectedFrame() {
  //Get images of everything on page
  const selectedComponents = figma.currentPage.selection;

  const allResults = await Promise.all(
    selectedComponents.map(async (component) => {
      const result = await component.exportAsync({ format: 'PNG' });
      return {
        name: component.name,
        expectedImage: result,
        nodeId: component.id,
      };
    }),
  );
  sendFrontend('fullDesignImageFromSelectedFrame', allResults);

  // return sendReply();
}
