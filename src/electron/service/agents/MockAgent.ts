import type { AgentRuntime, AgentConfig, ChatMessageLike } from './AgentRuntime.js'

export class MockAgent implements AgentRuntime {
  async run(messages: ChatMessageLike[], _config: AgentConfig): Promise<string> {
    console.log("called with", messages)
    const last = messages[messages.length - 1]?.text ?? ''
    return `Mock response to: ${last}`
  }
}


