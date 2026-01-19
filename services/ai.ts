import { ChatMessage } from '../types';
import { GoogleGenAI, Content } from "@google/genai";

const SYSTEM_PROMPT = `
你是一个 ESA LaunchPad AI 助手，是阿里云 ESA (边缘安全加速) 方面的专家。
你的目标是帮助用户将前端应用部署到 ESA Pages 并编写边缘函数 (Edge Functions)。

来自 ESA 手册的关键知识：
1. ESA 支持用于静态/SPA 托管的 "Pages" 和用于动态逻辑的 "边缘函数 (Edge Functions)"。
2. 配置最好通过根目录下的 'esa.jsonc' 文件进行管理。
3. 'esa.jsonc' 字段：name (名称), entry (函数入口路径), installCommand (安装命令), buildCommand (构建命令), assets (目录, notFoundStrategy)。
4. 对于单页应用 (React/Vue)，'notFoundStrategy' 必须设置为 'singlePageApplication'。
5. Edge KV：用于边缘存储。构造函数：'new EdgeKV({namespace: "ns"})'。API：get, put, delete (均为异步)。
6. 部署流程：导入 GitHub 仓库 -> ESA 控制台 -> 边缘函数与 Pages -> 创建。
7. 如果存在 'esa.jsonc'，控制台会自动填充配置。

请用中文回复，保持简洁、专业并乐于助人。始终建议使用 'esa.jsonc' 进行版本控制。
`;

export const sendMessageToAI = async (messages: ChatMessage[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Convert messages to Gemini Content format
    const history: Content[] = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return "抱歉，没有接收到消息。";

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      history: history
    });

    const response = await chat.sendMessage({ message: lastMessage.content });

    return response.text || "抱歉，我没有生成任何内容。";

  } catch (error) {
    console.error("AI API Error:", error);
    return "抱歉，我现在无法连接到 ESA AI 大脑 (Gemini)。请检查 API Key 或稍后重试。";
  }
};