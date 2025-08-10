export type AgentRuntimeKind = 'mock' | 'langchain' | 'langgraph'

export interface MCPServerConfig {
  name: string
  command?: string
  args?: string[]
  transport?: 'stdio' | 'http'
  baseUrl?: string
  env?: Record<string, string>
}

export interface AgentConfig {
  runtime: AgentRuntimeKind
  provider?: 'openai' | 'anthropic' | 'ollama' | 'custom'
  apiKey?: string
  baseUrl?: string
  model?: string
  temperature?: number
  maxTokens?: number
  mcpServers?: MCPServerConfig[]
}

export interface ChatMessageLike {
  text: string
  sender: 'user' | 'ai'
}

export interface AgentRuntime {
  run(messages: ChatMessageLike[], config: AgentConfig): Promise<string>
}


