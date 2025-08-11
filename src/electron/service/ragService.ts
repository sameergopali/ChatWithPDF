import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import path from "path";
import fs from "fs/promises";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import {START,END,MessagesAnnotation,Annotation,StateGraph,MemorySaver} from "@langchain/langgraph";
import { ToolNode,toolsCondition } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage,SystemMessage, ToolMessage} from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate } from "@langchain/core/prompts";

export class RagService{

    private app: any;
    private vectorStore: FaissStore | null = null;
    private llm: any; // assign your LLM instance in constructor or init
    private embedding: any;

    constructor() {
        this.llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature:0
          });
        this.embedding =new GoogleGenerativeAIEmbeddings({
            model: "embedding-001",
            taskType: TaskType.RETRIEVAL_DOCUMENT,
            title: "docs"
          
          });
    }



    private async  loadAndSplitPDF(pdfPath: string) {
        const loader = new PDFLoader(pdfPath,{splitPages:false});
        const docs = await loader.load();
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 40000,      // size (in characters) of each chunk
          chunkOverlap: 200,    // overlap between chunks to preserve context
        });
        return await splitter.splitDocuments(docs);
    }
   
    
    public async init(pdfPath: string) {
        const docs = await this.loadAndSplitPDF(pdfPath);
        this.vectorStore = await this.getFaissStore(pdfPath, docs);
        this.app = await this.buildGraph();
        console.log("init completed");
    }

    private async getFaissStore(
        pdfPath: string,
        docs: Document<Record<string, any>>[],
    ) {
        const baseName = path.basename(pdfPath, path.extname(pdfPath));
        const faissFile = `${baseName}.faiss_index`;
    
        try {
          await fs.access(faissFile);
          console.log(`Loaded existing FAISS index from ${faissFile}`);
          return await FaissStore.load(faissFile, this.embedding!);
        } catch {
          if (!docs || docs.length === 0) {
            throw new Error("No documents provided to build FAISS index.");
          }
          console.log(`Creating new FAISS index and saving to ${faissFile}`);
          const faissStore = await FaissStore.fromDocuments(docs, this.embedding!);
          await faissStore.save(faissFile);
          return faissStore;
        }
    }
    
    private async buildGraph() {
        const retrieveSchema = z.object({ query: z.string() });
        const retrieve = tool(
          async ({ query }) => {
            const retrievedDocs = await this.vectorStore!.similaritySearch(query);
            const serialized = retrievedDocs
              .map(doc => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
              .join("\n");
            return [serialized, retrievedDocs];
          },
          {
            name: "retrieve",
            description: "Retrieve information or content related to a query.",
            schema: retrieveSchema,
            responseFormat: "content_and_artifact",
          }
        );
    
        const queryOrRespond = async (state: typeof MessagesAnnotation.State) => {
          const systemMessage = new SystemMessage(
            "You are a helpful assistant who answers questions. " +
              "If you don't have context for the query, use the retrieval tool. " +
              "Do not ask the user for additional info."
          );
    
          const conversationMessages = state.messages.filter(
            m => m instanceof HumanMessage || (m instanceof AIMessage && m.tool_calls?.length === 0)
          );
    
          const prompt = [systemMessage, ...conversationMessages];
          console.log(prompt)
          const llmWithTools = this.llm.bindTools([retrieve]);
          const response = await llmWithTools.invoke(prompt);
          return { messages: [response] };
        };
    
        const tools = new ToolNode([retrieve]);
    
        const generate = async (state: typeof MessagesAnnotation.State) => {
          const recentToolMessages: ToolMessage[] = [];
          for (let i = state.messages.length - 1; i >= 0; i--) {
            const msg = state.messages[i];
            if (msg instanceof ToolMessage) {
              recentToolMessages.push(msg);
            } else {
              break;
            }
          }
    
          const docsContent = recentToolMessages.reverse().map(m => m.content).join("\n");
          const systemMessage = new SystemMessage(
            "You are an assistant for question-answering tasks. Use the content to answer.\n\n" +
              docsContent
          );
          const conversationMessages = state.messages.filter(
            m => m instanceof HumanMessage || (m instanceof AIMessage && m.tool_calls?.length === 0)
          );
    
          const prompt = [systemMessage, ...conversationMessages];
          const response = await this.llm.invoke(prompt);
          return { messages: [response] };
        };
    
        const graphBuilder = new StateGraph(MessagesAnnotation)
          .addNode("queryOrRespond", queryOrRespond)
          .addNode("tools", tools)
          .addNode("generate", generate)
          .addEdge("__start__", "queryOrRespond")
          .addConditionalEdges("queryOrRespond", toolsCondition, {
            __end__: "__end__",
            tools: "tools",
          })
          .addEdge("tools", "generate")
          .addEdge("generate", "__end__");
        const memory = new MemorySaver();
        return graphBuilder.compile({ checkpointer: memory });
    }

    public async invoke(msg: string){
        const config = { configurable: { thread_id: "thread-1" } };
        const response = await this.app.invoke({messages: msg},config );
        const lastMessage = response.messages[response.messages.length - 1];
        return lastMessage.content;
    }
}