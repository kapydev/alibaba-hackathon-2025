import {
  BotIcon,
  FileInputIcon,
  LucideProps,
  ShieldAlertIcon,
  UserIcon,
} from "lucide-react";
import { ToolMessage } from "../ToolMessage";
import { sendMidEnd } from "../../api/sendMidEnd";

import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
export type MessageIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

export type ToolType = keyof typeof TOOL_TEMPLATES;

export type Tools = {
  [K in ToolType]: {
    body: (typeof TOOL_TEMPLATES)[K]["sampleBody"];
    props:
      | Record<keyof (typeof TOOL_TEMPLATES)[K]["propDesc"], string>
      | undefined;
  };
};

/**returns undefined or a string to pass back to llm to scold it to do better */
type ToolRuleResult = string | undefined;

//TODO: ToolRules need to be moved to render templates for type inference
/**Used to enforce certain formats for the LLM output and to hint it in the right direction if it messes up */
export interface ToolRule {
  /**Description passed to LLM regarding tool usage. */
  description: string;
  /**Checks to be done for the tool. Always just check the latest message, REGARDLESS of type*/
  check: (messagesWithoutErrors: ToolMessage[]) => ToolRuleResult;
}

export interface ToolTemplate {
  DISABLED?: true;
  role: "assistant" | "user";
  desc: string;
  sampleBody: string;
  propDesc: Record<string, string>;
  sampleProps: Record<string, string>;
  /**Used for storing additional data in a particular message, for example the contents at the time of parsing */
  data: object;
}

export const TOOL_TEMPLATES = {
  ASSISTANT_INFO: {
    role: "assistant",
    desc: "For the assistant to write a response to the user. If refering to a specific item on the page, end the assistant info, annotate the specific item, then continue the assistant info.",
    propDesc: {},
    sampleProps: {},
    sampleBody: `
    There are a few issues with the design, for example the colors of buttons do not contrast enough with the background, which may cause users to drop off. I will annotate your design to highlight these problems
    (then END_ASSISTANT_INFO and run ASSISTANT_ANNOTATE)
    >>>>>OR<<<<<
    To fix the problem of buttons blending with the page, we need to identify the color of all the poorly colored buttons. We should avoid updating the color of buttons which only have outlines, because even though have the same background, they stand out via their outline. Then, for each of these buttons with the bad color rgba(W,X,Y,Z), update their color to match the main primary color rgba(W,X,Y,Z).`,
    data: {},
  },
  ASSISTANT_CHANGE_COLOR: {
    role: "assistant",
    desc: "Change the background color of a figma node or text by id",
    propDesc: {
      nodeId: "nodeId",
      r: "red",
      g: "green",
      b: "blue",
      a: "alpha",
    },
    sampleProps: {
      nodeId: "123456789",
      r: "0.5",
      g: "0.7",
      b: "0.9",
      a: "1.0",
    },
    sampleBody: "",
    data: {},
  },
  ASSISTANT_DRAW_HEATMAP: {
    role: "assistant",
    desc: "Draw a heatmap visualization around a Figma node to highlight areas of interest or attention. The heatmap consists of three concentric ellipses with different colors (red, yellow, green) representing different levels of intensity.",
    propDesc: {
      nodeId: "ID of the node to center the heatmap on",
      xRadius: "Horizontal radius of the inner circle (in pixels)",
      yRadius: "Vertical radius of the inner circle (in pixels)",
      spreadRadius: "Additional radius for the outer circles (in pixels)",
    },
    sampleProps: {
      nodeId: "1:58",
      xRadius: "200",
      yRadius: "100",
      spreadRadius: "30",
    },
    sampleBody: "",
    data: {},
  },
  ASSISTANT_ANNOTATE: {
    role: "assistant",
    desc: "Write a comment on a particular nodeId. Use this when the user asks for feedback so that you can comment directly on how the design should be improved. Consider using emojis in your comments to differentiate them and make them stand out.",
    propDesc: {
      nodeId: "nodeId",
      comment: "comment",
    },
    sampleProps: {
      nodeId: "1:58",
      comment:
        "This button does not constrast well with the background, consider changing its color",
    },
    sampleBody: "",
    data: {},
  },
  USER_TOOL_ERROR: {
    role: "user",
    desc: "Information regarding incorrect tool usage. The occurence of this indicates a previous generation produced a result that did not follow a particular rule. Take extra notice of the rule that was not followed correctly in subsequent generations",
    propDesc: {},
    sampleProps: {},
    sampleBody: "You cannot change the color of a node that does not exist",
    data: {},
  },
  USER_PROMPT: {
    role: "user",
    desc: "The prompt from the user",
    propDesc: {},
    sampleProps: {},
    sampleBody: `How can I improve my figma design?`,
    data: {},
  },
  USER_FIGMA_NODE_CONTENTS: {
    role: "user",
    desc: "A JSON representing a node selected in figma.",
    propDesc: {
      nodeName: "Node Name",
      nodeId: "Node ID",
    },
    sampleProps: {
      nodeName: "Landing-Desktop",
      nodeId: "133:221",
    },
    sampleBody: `TODO`,
    data: {},
  },
} satisfies Record<string, ToolTemplate>;

export const NON_RENDERED_TOOLS: ToolType[] = [
  "USER_FIGMA_NODE_CONTENTS",
  "USER_TOOL_ERROR",
  "ASSISTANT_CHANGE_COLOR",
];

type ToolAction<ToolName extends ToolType> = (
  message: ToolMessage<ToolName>
) => void;

export type ToolActionMeta<ToolName extends ToolType> = {
  name: string;
  action: ToolAction<ToolName>;
  /**For a keyboard shortcut Ctrl+T, or Ctrl+1+T for an older
   * message for example, just put 't' as the shortcut - it
   * will be concatenated to the end */
  shortcutEnd: string;
};
export type ToolRenderTemplate<ToolName extends ToolType> = {
  Icon: MessageIcon;
  title: (message: ToolMessage<ToolName>) => React.ReactNode;
  body: (message: ToolMessage<ToolName>) => React.ReactNode;
  content: (message: ToolMessage<ToolName>) => string; // THIS IS FOR SHOWING MARKDOWN BUT ITS QUITE BUGGY. FIX AND USE THIS IN THE UI NEXT TIME
  onRemove?: ToolAction<ToolName>;
  onFocus?: ToolAction<ToolName>;
  actions?: ToolActionMeta<ToolName>[];
  rules: ToolRule[];
};
export const TOOL_RENDER_TEMPLATES: {
  [ToolName in ToolType]: ToolRenderTemplate<ToolName>;
} = {
  // What user said
  USER_PROMPT: {
    Icon: UserIcon,
    title: () => "You",
    body: (data) => data.body,
    content: (data) => data.contents,
    rules: [],
  },
  // What Taffy said
  ASSISTANT_INFO: {
    Icon: BotIcon,
    title: () => "Taffy",
    body: (data) => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          hr: ({ node, ...props }) => (
            <hr
              style={{ marginTop: "12px", marginBottom: "12px" }}
              {...props}
            />
          ),
          pre: ({ node, ...props }) => (
            <pre
              {...props}
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                backgroundColor: "black",
                color: "white",
              }}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc ml-6 my-4"
              style={{ marginBottom: "12px" }}
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ul
              className="list-decimal ml-6 my-4"
              style={{ marginBottom: "12px" }}
              {...props}
            />
          ),
        }}
      >
        {data.body}
      </ReactMarkdown>
    ),

    content: (data) => data.contents,
    rules: [],
  },
  ASSISTANT_CHANGE_COLOR: {
    Icon: BotIcon,
    title: () => "Change color",
    content: (data) => data.body,
    body: (data) => {
      if (data.props === undefined) return "";
      const { nodeId, r, g, b, a } = data.props;
      return `${nodeId} : rgba(${r}, ${g}, ${b}, ${a})`;
    },
    rules: [],
    onFocus: (data) => {
      if (!data.props) return;
      sendMidEnd("handleChangeColor", data.props);
    },
  },
  ASSISTANT_DRAW_HEATMAP: {
    Icon: BotIcon,
    title: () => "Draw Heatmap",
    content: (data) => data.body,
    body: (data) => {
      if (data.props === undefined) return "";
      const { nodeId, xRadius, yRadius, spreadRadius } = data.props;
      return `${nodeId} : Heatmap with inner radius (${xRadius}x${yRadius}) and spread ${spreadRadius}`;
    },
    rules: [],
    onFocus: (data) => {
      if (!data.props) return;
      sendMidEnd("handleDrawHeatmap", {
        nodeId: data.props.nodeId,
        xRadius: Number(data.props.xRadius),
        yRadius: Number(data.props.yRadius),
        spreadRadius: Number(data.props.spreadRadius)
      });
    },
  },
  ASSISTANT_ANNOTATE: {
    Icon: BotIcon,
    title: () => "Change color",
    content: (data) => data.body,
    body: (data) => {
      if (data.props === undefined) return "";
      const { nodeId, comment } = data.props;
      return `${nodeId} : ${comment}`;
    },
    rules: [],
    onFocus: (data) => {
      if (!data.props) return;
      sendMidEnd("handleAnnotateNode", data.props);
    },
  },
  USER_TOOL_ERROR: {
    Icon: ShieldAlertIcon,
    title: () => "Tool error",
    body: (data) => data.body,
    content: (data) => data.contents,
    rules: [],
  },
  // Figma node contents
  USER_FIGMA_NODE_CONTENTS: {
    Icon: FileInputIcon,
    title: () => "Figma Node Added",
    body: (data) => {
      if (!data.props) return;
      return data.props.nodeName;
    },
    content: (data) => data.props?.nodeName ?? "",
    rules: [],
  },
};
