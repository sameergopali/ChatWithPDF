export type AgentRuntimeKind = 'mock' | 'dev' | 'qarag'


export interface AgentConfig {
  runtime: AgentRuntimeKind
  provider?: 'openai' | 'anthropic' | 'ollama' | 'custom'
  apiKey?: string
  baseUrl?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatMessageLike {
  text: string
  sender: 'user' | 'ai'
}

export interface AgentRuntime {
  run(messages: ChatMessageLike[], config: AgentConfig): Promise<string>
}


