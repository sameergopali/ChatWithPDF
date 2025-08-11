import { RagService } from '../ragService.js';
import type { AgentRuntime, AgentConfig, ChatMessageLike } from './AgentRuntime.js'





export class QARagChain implements AgentRuntime {
    private ragService: RagService
    constructor(ragService: RagService){
        this.ragService= ragService;
    }
    async run(messages: ChatMessageLike[], _config: AgentConfig): Promise<string> {
      const lastUserMessage =messages[messages.length - 1]?.text ?? ''
      const response = this.ragService.invoke(lastUserMessage!);
      console.log("Rag service",response)
      return response

    }
  }