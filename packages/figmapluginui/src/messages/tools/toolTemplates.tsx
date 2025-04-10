import {
  BotIcon,
  FileInputIcon,
  LucideProps,
  ShieldAlertIcon,
  UserIcon,
  WaypointsIcon,
} from "lucide-react";
import { ToolMessage } from "../ToolMessage";
import { sendMidEnd } from "../../api/sendMidEnd";

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

/**
 * Prompt Engineering Guidelines:
 * CoT - Ask LLM to explain thought process step by step for better outputs
 * Citations - By asking LLM for citation, we can run a bullshit detector using regex
 * Prefer positives - Instead of saying `DO NOT DO XXX`, which places a focus on XXX cos that's how attention models work, say `DO YYY`. Negatives are okay from time to time but if you can put both you might as well
 * Avoid controlling termination behaviour - the models can't control themselves if you ask them `STOP GENERATING AFTER YYY`. Use stop sequences instead, or if you use xml tags, with rules, they can recognise that as a reason to stop
 * Common terminology - Instead of using uncommon terminology like 'planning block' and 'fence blocks', stick to what is common for the LLM to have a better understanding of the rules, like 'thinking blocks' and 'xml tags'
 *
 * Prompt Engineering Ideas:
 * Switch from fence blocks to XML tags <taffythinking> for example
 * Make language positive instead of negative
 * Fail fallback to repeat prompt if output is not parsable
 * Rename planning block to thinking block
 * Add more files in folder to context automatically
 * Add diagnositcs to context automatically
 * Add typescript types to context automatically - To what depth?
 * Add token limit registrar to context adder
 * Explicitly state indentation for replace block flow
 * Fix assistant read file
 * Rule follower - make sure LLM output follows rules at every step otherwise restart prompting
 */

export const TOOL_TEMPLATES = {
  //ASSISTANT TOOLS
  ASSISTANT_INFO: {
    role: "assistant",
    desc: "For the assistant to write a response to the user.",
    propDesc: {},
    sampleProps: {},
    sampleBody:
      "To fix the problem of buttons blending with the page, we need to identify the color of all the poorly colored buttons. Then, for each of these buttons, update their color to match the main primary color. Finally, to ensure the text on these buttons remain readable, the color of the texts need to be updated as well.",
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
  USER_PROMPT: {
    Icon: UserIcon,
    title: () => "You",
    body: (data) => data.body,
    content: (data) => data.contents,
    rules: [],
  },
  ASSISTANT_INFO: {
    Icon: BotIcon,
    title: () => "Taffy",
    body: (data) => data.body,
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
      console.log("HANDLING CHANGE COLOR", data.props);
      if (!data.props) return;
      sendMidEnd("handleChangeColor", data.props);
    },
  },
  USER_TOOL_ERROR: {
    Icon: ShieldAlertIcon,
    title: () => "Tool error",
    body: (data) => data.body,
    content: (data) => data.contents,
    rules: [],
  },
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
