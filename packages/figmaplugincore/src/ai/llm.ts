import OpenAI from "openai";

export const openai = new OpenAI({
  // If the environment variable is not configured, replace the following line with your API key: apiKey: "sk-xxx",
  apiKey: process.env.ALIBABA_MODEL_STUDIO_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
});
