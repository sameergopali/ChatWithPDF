import type { AgentRuntimeKind, AgentConfig } from './agents/AgentRuntime.js'
import { MockAgent } from './agents/MockAgent.js'
import { LangChainAgent } from './agents/LangChainAgent.js'
import { LangGraphAgent } from './agents/LangGraphAgent.js'

export interface AIConfig extends Omit<AgentConfig, 'runtime'> {
    runtime?: AgentRuntimeKind;
}

function readEnvConfig(): AIConfig {
    const runtime = (process.env.AI_RUNTIME as AgentRuntimeKind) || 'mock'
    const provider = (process.env.AI_PROVIDER as AgentConfig['provider']) || undefined
    const apiKey = process.env.AI_API_KEY
    const baseUrl = process.env.AI_BASE_URL
    const model = process.env.AI_MODEL
    const temperature = process.env.AI_TEMPERATURE ? Number(process.env.AI_TEMPERATURE) : undefined
    const maxTokens = process.env.AI_MAX_TOKENS ? Number(process.env.AI_MAX_TOKENS) : undefined
    const mcpServers = (() => {
        const raw = process.env.AI_MCP_SERVERS
        if (!raw) return undefined
        try { return JSON.parse(raw) } catch { return undefined }
    })()
    return { runtime, provider, apiKey, baseUrl, model, temperature, maxTokens, mcpServers }
}

export class AIService {
    private config: AIConfig

    constructor(config?: AIConfig) {
        const envConfig = readEnvConfig()
        this.config = { ...envConfig, ...(config || {}) }
    }

    private getRuntime() {
        const kind: AgentRuntimeKind = this.config.runtime ?? 'mock'
        if (kind === 'langchain') return new LangChainAgent()
        if (kind === 'langgraph') return new LangGraphAgent()
        return new MockAgent()
    }

    chatWithAI = async (messages: { text: string; sender: 'user' | 'ai' }[]): Promise<string> => {
        try {
            const runtime = this.getRuntime()
            const response = await runtime.run(messages, {
                runtime: this.config.runtime ?? 'mock',
                provider: this.config.provider,
                apiKey: this.config.apiKey,
                baseUrl: this.config.baseUrl,
                model: this.config.model,
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
                mcpServers: this.config.mcpServers,
            })
            return response
        } catch (error: any) {
            const message = error?.message || String(error)
            return `AI error: ${message}`
        }
    };
}