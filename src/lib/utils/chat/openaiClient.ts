import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1"
});

export default openai;
