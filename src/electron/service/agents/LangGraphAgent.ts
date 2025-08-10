import type { AgentRuntime, AgentConfig, ChatMessageLike } from './AgentRuntime.js'

// Placeholder implementation using LangGraph runtime concepts.
// For real use, import your compiled graph and invoke with state/messages.
export class LangGraphAgent implements AgentRuntime {
  async run(messages: ChatMessageLike[], _config: AgentConfig): Promise<string> {
    const last = messages[messages.length - 1]?.text ?? ''
    // TODO: Replace with actual LangGraph compiled/app runtime invocation
    return `LangGraph agent received: ${last}`
  }
}


