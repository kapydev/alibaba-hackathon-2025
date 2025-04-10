import { logger } from '../../code';

export const deserializeRawTree = async (
  rawTree: string,
): Promise<SceneNode[]> => {
  //TODO: copmare deserialized and serialized to see if there are any differences
  const obj = JSON.parse(rawTree);
  try {
    const deserialized = await deserializeCustomSceneNode(obj[0]);
    if (!deserialized) {
      throw new Error('NULL RETURNED');
    }
    return [deserialized];
  } catch (e: any) {
    logger.error(e.message);
    return Promise.reject(e);
  }
};
// --------------------------------- COPIED CODE ------------------------------------------- //

export const FONT_NAME_STYLES = [
  'Thin',
  'ExtraLight',
  'Light',
  'Regular',
  'Medium',
  'SemiBold',
  'Bold',
  'ExtraBold',
  'Black',
];

export const LAYOUT_MODE_NONE_PROPS = new Set([
  'primaryAxisSizingMode',
  'counterAxisSizingMode',
  'layoutWrap',
  'primaryAxisAlignItems',
  'counterAxisAlignItems',
  'counterAxisAlignContent',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'itemSpacing',
  'counterAxisSpacing',
  'itemReverseZIndex',
  'strokesIncludedInLayout',
]);

export const SKIP_AUTO_PROPS = new Set([
  'type',
  'parent',
  'children',
  'removed',
  '_fonts',
  'autoRename',
  'overflowDirection',
  'width',
  'height',
  'absoluteTransform',
  'vectorPaths',
  'x',
  'y',
  'rotation',
  'scaleFactor',
  'mainComponent',
  'masterComponent',
  'backgrounds',
  'backgroundStyleId',
  'horizontalPadding',
  'verticalPadding',
  'fillGeometry',
  'strokeGeometry',
  'reactions', // gab added
]);
/**
 * Properties to skip deserializing for groups an boolean ops.
 */

export const SKIP_GROUP_PROPS = new Set([
  'relativeTransform',
  'x',
  'y',
  'rotation',
  'scaleFactor',
]);
/**
 * Properties to skip deserializing for nodes inside a component instance
 */

export const SKIP_IN_INSTANCE_PROPS = new Set([
  'relativeTransform',
  'x',
  'y',
  'rotation',
  'scaleFactor',
  'constraints',
  'vectorNetwork',
  'constrainProportions',
  'isMask',
  'numberOfFixedChildren',
  'booleanOperation',
]);

export const FACTORIES: { [key: string]: () => SceneNode } = {
  RECTANGLE: figma.createRectangle,
  LINE: figma.createLine,
  ELLIPSE: figma.createEllipse,
  POLYGON: figma.createPolygon,
  STAR: figma.createStar,
  VECTOR: figma.createVector,
  TEXT: figma.createText,
  FRAME: figma.createFrame,
  COMPONENT_SET: figma.createFrame,
  INSTANCE: figma.createFrame,
  COMPONENT: figma.createComponent,
  SLICE: figma.createSlice,
};
type BooleanOpFactory = typeof figma.exclude;

export const BOOLEAN_OP_FACTORIES: {
  [key: string]: BooleanOpFactory;
} = {
  UNION: figma.union,
  EXCLUDE: figma.exclude,
  INTERSECT: figma.intersect,
  SUBTRACT: figma.subtract,
};
/**
 * Parses out the main Node ID from a node ID. For nodes outside a component,
 * this is just the node ID. For nodes inside a component, this turns IDs like:
 *
 *     I4:1229;0:5435
 *
 * into:
 *
 *     0:5435
 */

export function mainNodeId(id: string): string {
  return id.replace(/^.*;/, '');
}
/**
 * Create a real Figma node from an object produced by `serializeNode`.
 *
 * @param obj A previously serialized node, i.e. something that `serializeNode` returned.
 * @returns A new node, or null if nothing could be deserialized.
 */

// export async function deserializeNode(obj: any): Promise<SceneNode | null> {
//   // Load all referenced fonts and import all referenced components in parallel
//   await Promise.all([
//     ...[...gatherFonts(obj)]
//       .map((f) => JSON.parse(f))
//       .map((font) => figma.loadFontAsync(font)),
//     ...[...gatherComponentKeys(obj)].map((key) =>
//       figma.importComponentByKeyAsync(key).catch(() => {}),
//     ),
//   ]);

//   // Actually deserialize
//   return await deserializeCustomSceneNode(obj);
// }
/**
 * Gather all fonts referenced in the given serialized object
 */
function gatherFonts(obj: any): Set<string> {
  const fonts = new Set<string>();

  if ('_fonts' in obj) {
    for (const f of obj._fonts.map((f: any) => JSON.stringify(f))) {
      fonts.add(f);
    }
  }

  if ('children' in obj) {
    for (const child of obj.children) {
      for (const f of gatherFonts(child)) {
        fonts.add(f);
      }
    }
  }

  return new Set(fonts);
}
/**
 * Gather all component keys referenced in the serialized object.
 */
function gatherComponentKeys(obj: any): Set<string> {
  const keys = new Set<string>();

  if ('_componentKey' in obj) {
    keys.add(obj._componentKey);
  }

  if ('children' in obj) {
    for (const child of obj.children) {
      for (const f of gatherComponentKeys(child)) {
        keys.add(f);
      }
    }
  }

  return keys;
}
// inner deserialization function, called recursively

export async function deserializeCustomSceneNode(
  //TODO: Strong types
  obj: any,
  parent?: SceneNode,
): Promise<SceneNode | null> {
  const { type } = obj;
  const factory = FACTORIES[type];

  if (factory !== undefined) {
    // most common node types
    const node: SceneNode = factory();
    setProperties(node, obj);
    if ('children' in node) {
      const children = await deserializeCustomSceneNodeChildren(obj);
      for (const c of children) {
        node.appendChild(c);
      }
    }
    return node;
  } else if (type === 'GROUP' || type === 'BOOLEAN_OPERATION') {
    // special handling for groups + booleans, which is currently very clumsy, inaccurate, and
    // slow
    const factory =
      type === 'BOOLEAN_OPERATION'
        ? BOOLEAN_OP_FACTORIES[(obj as any).booleanOperation]
        : figma.group;

    // the following approach produces more accurate results but 10x slower for some reason... here,
    // we start the group off with a throwaway node, and then append its actual children one by one,
    // and later remove the throwaway node.
    // let r = figma.createRectangle();
    // const node: GroupNode = factory([r], figma.currentPage);
    // for (let c of deserializedChildren) {
    //   node.appendChild(c);
    // }
    // r.remove();
    const node = factory(
      await deserializeCustomSceneNodeChildren(obj),
      figma.currentPage,
    );
    setProperties(node, obj);
    return node;
  } else if (type === 'INSTANCE') {
    // deserialize an instance node
    let mainComponent: ComponentNode;
    try {
      mainComponent = await figma.importComponentByKeyAsync(obj._componentKey);
    } catch (e) {
      logger.warn(`Couldn't instantiate an instance of ${obj._componentKey}`);
      return null;
    }

    const node: InstanceNode = mainComponent.createInstance();
    deserializeInstanceOverrides(obj, node, false);
    return node;
  } else {
    logger.warn(
      `Couldn't instantiate a node of type ${type}, ${JSON.stringify(obj)}`,
    );
    return null;
  }
}
/**
 * Loads all relevant fonts within the StyledTextSegments when there is more than 1 font used.
 * @param obj the object representing the node
 */

async function loadFontsFromStyledTextSegments(obj: any) {
  await Promise.all(
    obj.styledTextSegments.map((textSegment: any) =>
      figma.loadFontAsync(textSegment.fontName),
    ),
  );
}
/**
 * sets all the relevant StyledTextSegments. Figma as of now only has a getter method for StyledTextSegment, but does not expose a
 * setter method. The current workaround is to set the individual range properties.
 * Ref: https://www.figma.com/plugin-docs/api/properties/TextNode-getstyledtextsegments
 *
 * @param obj the array of StyledTextSegments
 * @param node TextNode to work on
 */
function setRangeTextSegments(obj: any[], node: TextNode) {
  obj.forEach((item) => {
    node.setRangeFontName(item.start, item.end, item.fontName);
    node.setRangeFontSize(item.start, item.end, item.fontSize);
    node.setRangeTextDecoration(item.start, item.end, item.textDecoration);
    if (item.hyperLink)
      node.setRangeHyperlink(item.start, item.end, item.hyperLink);
    node.setRangeLineHeight(item.start, item.end, item.lineHeight);
    node.setRangeLetterSpacing(item.start, item.end, item.letterSpacing);
    node.setRangeFills(item.start, item.end, item.fills);
  });
}
/**
 * Deserializes the given object's children in parallel
 */

async function deserializeCustomSceneNodeChildren(obj: any) {
  return (
    await Promise.all(
      (obj.children ?? []).map((c: any) => deserializeCustomSceneNode(c)),
    )
  ).filter((n) => Boolean(n));
}
/**
 * Deserializes overrides on a component instance, recursively.
 *
 * @param obj The serialized node
 * @param overrideNode The node (at the top-level, a component instances)
 * @param isRoot Whether or not `overrideNode` is the root instance, or if this is a node somewhere
 *     deeper in the instance's hierarchy.
 */

async function deserializeInstanceOverrides(
  obj: any,
  overrideNode: SceneNode,
  isRoot: boolean,
): Promise<void> {
  setProperties(overrideNode, obj, isRoot);
  if ('children' in overrideNode) {
    for (const child of obj.children ?? []) {
      const childNode = overrideNode.findChild(
        (n) => mainNodeId(n.id) === child.id,
      );
      if (childNode) {
        await deserializeInstanceOverrides(child, childNode, true);
      }
    }
  }
}
/**
 * Sets the actual properties on the given node from the given serialized object, e.g.
 * text, fill colors, etc.
 */

async function setProperties(node: SceneNode, obj: any, isInInstance = false) {
  let props = Object.entries<PropertyDescriptor>(
    Object.getOwnPropertyDescriptors(Object.getPrototypeOf(node)),
  )
    .filter(([name]) => !SKIP_AUTO_PROPS.has(name))
    .sort(sortPropsForSet);
  if (isInInstance) {
    props = props.filter(([name]) => !SKIP_IN_INSTANCE_PROPS.has(name));
  }
  if (obj.type === 'GROUP' || obj.type === 'BOOLEAN_OPERATION') {
    props = props.filter(([name]) => !SKIP_GROUP_PROPS.has(name));
  }
  //Gab: added
  if (obj.layoutMode === undefined || obj.layoutMode === 'NONE') {
    props = props.filter(([name]) => !LAYOUT_MODE_NONE_PROPS.has(name));
  }
  //Gab:added
  if (obj.type === 'TEXT' && obj.styledTextSegments !== undefined) {
    await loadFontsFromStyledTextSegments(obj);
  }

  for (const [name, prop] of props) {
    if (name in obj && prop.set) {
      // special case to avoid warnings around layoutAlign=CENTER being deprecated
      if (name === 'layoutAlign' && obj[name] === 'CENTER') {
        continue;
      }
      // Gab: added case
      if (name === 'componentPropertyReferences' && obj[name] === null) {
        continue;
      }
      // set the property on the node
      if (name === 'fontName') {
        await figma.loadFontAsync(obj[name]);
      }

      try {
        prop.set.call(node, obj[name]);
      } catch (e: any) {
        logger.error('Error thrown', e.message);
        logger.info('error was thrown for the key-pair: ', name, obj[name]);
      }
    }
  }

  //Gab:added
  if (obj.type === 'TEXT' && obj.styledTextSegments !== undefined) {
    setRangeTextSegments(obj.styledTextSegments, node as TextNode);
  }

  if (
    'resizeWithoutConstraints' in node &&
    obj.width !== undefined &&
    obj.height !== undefined &&
    obj.width > 1 &&
    obj.height > 1
  ) {
    node.resizeWithoutConstraints(obj.width, obj.height);
  }
}
const PRIORITIZE_PROPERTIES = new Set([
  'fontName',
  'layoutMode', //set layoutMode before any other layout settings
]);
/**
 * Property sort comparison method for {@link setProperties} that ensures certain properties
 * are set before others.
 */
function sortPropsForSet(
  a: [string, PropertyDescriptor],
  b: [string, PropertyDescriptor],
): number {
  if (PRIORITIZE_PROPERTIES.has(a[0])) return -1;
  if (PRIORITIZE_PROPERTIES.has(b[0])) return 1;
  return a[0].localeCompare(b[0]);
}
