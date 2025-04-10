import {
  BotIcon,
  FileInputIcon,
  LucideProps,
  ShieldAlertIcon,
  UserIcon,
} from "lucide-react";
import { ToolMessage } from "../ToolMessage";

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
    desc: "For the assistant to write a response to the user. Every response to the user should start with an assistant info block.",
    propDesc: {},
    sampleProps: {},
    sampleBody:
      "To prevent .env files from being committed into the codebase, we need to update the .gitignore file.",
    data: {},
  },
  USER_TOOL_ERROR: {
    role: "user",
    desc: "Information regarding incorrect tool usage. The occurence of this indicates a previous generation produced a result that did not follow a particular rule. Take extra notice of the rule that was not followed correctly in subsequent generations",
    propDesc: {},
    sampleProps: {},
    sampleBody:
      "We tried to write to a file without first reading the contents",
    data: {},
  },
  USER_PROMPT: {
    role: "user",
    desc: "The prompt from the user",
    propDesc: {},
    sampleProps: {},
    sampleBody: `Stop commiting .env files into the codebase`,
    data: {},
  },
  USER_FIGMA_NODE_CONTENTS: {
    role: "user",
    desc: "A JSON representing a node selected in figma.",
    propDesc: {
      nodeName: "The name of the node in figma",
      nodeId: "The id of the node in figma",
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
  // Taffy in error
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
