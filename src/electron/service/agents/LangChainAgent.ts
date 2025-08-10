import type { AgentRuntime, AgentConfig, ChatMessageLike } from './AgentRuntime.js'

// Lazy dynamic imports keep Electron main bundle lean if unused
async function loadLangChain() {
  const openaiMod = '@langchain/openai'
  const anthropicMod = '@langchain/anthropic'
  const runnablesMod = '@langchain/core/runnables'
  const promptsMod = '@langchain/core/prompts'
  const { ChatOpenAI } = await import(openaiMod as any)
  const { ChatAnthropic } = await import(anthropicMod as any)
  const { RunnableSequence } = await import(runnablesMod as any)
  const { ChatPromptTemplate, MessagesPlaceholder } = await import(promptsMod as any)
  return { ChatOpenAI, ChatAnthropic, RunnableSequence, ChatPromptTemplate, MessagesPlaceholder }
}

// Minimal MCP client adapter placeholder. Wire to real MCP clients as needed.
async function callMcpTools(_servers: NonNullable<AgentConfig['mcpServers']>, _query: string): Promise<string[]> {
  // Implement MCP tool calls here (e.g., Model Context Protocol over stdio/http)
  return []
}

export class LangChainAgent implements AgentRuntime {
  async run(messages: ChatMessageLike[], config: AgentConfig): Promise<string> {
    let ChatOpenAI: any, ChatAnthropic: any, RunnableSequence: any, ChatPromptTemplate: any, MessagesPlaceholder: any
    try {
      ({ ChatOpenAI, ChatAnthropic, RunnableSequence, ChatPromptTemplate, MessagesPlaceholder } = await loadLangChain())
    } catch (err: any) {
      return 'LangChain runtime not available. Install optional deps: @langchain/openai, @langchain/anthropic, @langchain/core'
    }

    const provider = config.provider ?? 'openai'
    const system = 'You are a helpful assistant focused on answering questions about user-provided PDF content.'

    const history = messages.map(m => ({ role: m.sender === 'user' ? 'user' as const : 'assistant' as const, content: m.text }))
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', system],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ])

    const input = messages[messages.length - 1]?.text ?? ''

    // Optionally call MCP tools to enrich context
    let mcpSnippets: string[] = []
    if (config.mcpServers && config.mcpServers.length > 0) {
      try {
        mcpSnippets = await callMcpTools(config.mcpServers, input)
      } catch (_err) {
        // Swallow MCP errors to keep chat resilient
      }
    }

    const model = provider === 'anthropic'
      ? new ChatAnthropic({ apiKey: config.apiKey, model: config.model ?? 'claude-3-5-sonnet-20241022', temperature: config.temperature ?? 0 })
      : new ChatOpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl, model: config.model ?? 'gpt-4o-mini', temperature: config.temperature ?? 0 })

    const chain = RunnableSequence.from([
      prompt,
      model,
    ])

    const enrichedInput = mcpSnippets.length > 0
      ? `${input}\n\nRelevant tool output:\n${mcpSnippets.join('\n---\n')}`
      : input

    const res = await chain.invoke({ history, input: enrichedInput })
    // Both providers return Message-like; normalize to string
    // @ts-ignore - .content shape varies by provider
    const content: unknown = res?.content
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
      const textPart = content.find((c: any) => typeof c?.text === 'string')
      if (textPart?.text) return textPart.text
    }
    return String(content ?? 'Sorry, I could not generate a response.')
  }
}


