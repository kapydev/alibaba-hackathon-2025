/**Use this function instead of the default getFigmaNodeById because figma has some weird internal edgecase with our custom ids */
export function getFigmaNodeById(id: string | undefined): BaseNode | null {
    if (id === undefined) return null;
    let relevantNode: BaseNode | null = null!;
  
    try {
      relevantNode = figma.getNodeById(id) as SceneNode;
    } catch {}
  
    return relevantNode;
  }
  