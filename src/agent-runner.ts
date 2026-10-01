// import "dotenv/config";
// import { Client } from "@modelcontextprotocol/sdk/client/index.js";
// import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
// import { Anthropic } from "@anthropic-ai/sdk";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// async function runMultiServerQA() {
//   console.log("🚀 Initializing Enterprise Multi-Server Agent Mesh...");
//   const anthropic = new Anthropic();

//   const isWindows = process.platform === "win32";
//   const command = isWindows ? "npx.cmd" : "npx";

//   // ==========================================
//   // 1. CONNECT SERVER A: Custom Enterprise MCP
//   // ==========================================
//   const enterpriseTransport = new StdioClientTransport({
//     command: command,
//     args: ["tsx", path.resolve(__dirname, "index.ts")]
//   });
//   const enterpriseClient = new Client({ name: "enterprise-client", version: "1.0.0" }, { capabilities: {} });
//   await enterpriseClient.connect(enterpriseTransport);
//   console.log("📡 Mesh Node 1 Connected: Enterprise Data Server");


//     // ==========================================
//   // 2. CONNECT SERVER B: Standard Playwright MCP
//   // ==========================================
//   const authStateFile = path.resolve(__dirname, "../.auth/session-state.json");
  
//   const playwrightTransport = new StdioClientTransport({
//     command: command,
//     // FIX: Pass the pre-authenticated storage file directly into the MCP engine wrapper parameters
//     args: [
//       "-y", 
//       "@playwright/mcp@latest",
//       "--storage-state", authStateFile
//     ] 
//   });
  
//   const playwrightClient = new Client({ name: "playwright-client", version: "1.0.0" }, { capabilities: {} });
//   await playwrightClient.connect(playwrightTransport);
//   console.log("📡 Mesh Node 2 Connected: Playwright Browser Server (Authenticated Mode active)");


//   // ==========================================
//   // 3. COMBINE SCHEMAS INTO A UNIFIED REGISTRY
//   // ==========================================
//   const enterpriseTools = await enterpriseClient.listTools();
//   const playwrightTools = await playwrightClient.listTools();

//   const toolRegistry = new Map<string, { client: Client; schema: any }>();

//   enterpriseTools.tools.forEach(t => toolRegistry.set(t.name, { client: enterpriseClient, schema: t }));
//   playwrightTools.tools.forEach(t => toolRegistry.set(t.name, { client: playwrightClient, schema: t }));

//   console.log(`🗃️ Combined Registry Compiled: Exposing ${toolRegistry.size} total tools to Agent.`);

//   const formattedTools = Array.from(toolRegistry.values()).map(item => ({
//     name: item.schema.name,
//     description: item.schema.description,
//     input_schema: item.schema.inputSchema as any
//   }));

// //   // ==========================================
// //   // 4. DEFINE THE END-TO-END CRITERIA
// //   // ==========================================
// //   const systemPrompt = `You are a Principal Lead Autonomous Test Architect. 
// //   You have access to a rich multi-server mesh of internal business data tools and live browser automation tools.
// //   Your execution cycle is strict:
// //   1. Generate test data or users using internal tools if required.
// //   2. Launch browser environments, navigate pages, and execute verification loops.
// //   3. Work sequentially. If a tool returns a data payload, feed those properties directly into your next tool choices.
// //   4. Once you have fully completed the requested task, summarize your steps and state that your testing mission is complete.`;

// //   const conversationHistory: any[] = [
// //     { 
// //       role: "user", 
// //       content: "Mission: Generate a premium test user for the US-EAST region. Once generated, open a browser instance using your automation tools, navigate to 'https://example.com', and capture a snapshot to prove your execution frame works." 
// //     }
// //   ];

//   // ==========================================
//   // 4. DEFINE THE LOCAL SANDBOX CRITERIA
//   // ==========================================
//   const systemPrompt = `You are a Principal Lead Autonomous Test Architect. 
//   You have access to a multi-server mesh combining an internal data generator and a live browser automation engine.
//   Your execution cycle is strict:
//   1. Generate clean test data or users using internal tools if required.
//   2. Launch browser environments, navigate pages, and execute verification loops.
//   3. Work sequentially. If a tool returns data, feed those properties directly into your next actions.
//   4. Once you have fully completed the requested task, summarize your steps and state that your testing mission is complete.`;

//   // TARGETING YOUR LOCAL QA GYM:
//   const conversationHistory: any[] = [
//     { 
//       role: "user", 
//       content: "Mission: First, generate a premium test user for the US-EAST region using your internal tools. Second, launch a browser context and navigate to your local QA Gym app at 'http://localhost:5173'. Locate the Wire Transfer module, input a transaction amount of '250', execute the transfer, and verify the resulting account balance changes cleanly." 
//     }
//   ];


//   // ==========================================
//   // 5. THE RECURSIVE AGENT EXECUTION LOOP
//   // ==========================================
//   let activeLoop = true;
//   let executionDepth = 0;
//   const maxDepth = 10;

//   while (activeLoop && executionDepth < maxDepth) {
//     executionDepth++;
//     console.log(`\n🤖 [Loop Iteration #${executionDepth}] Consulting Agent...`);

//     const response = await anthropic.messages.create({
//       model: "claude-sonnet-5",
//       max_tokens: 1500,
//       system: systemPrompt,
//       messages: conversationHistory,
//       tools: formattedTools
//     });

//     // Capture the model's response into history
//     conversationHistory.push({ role: "assistant", content: response.content });

//     if (response.stop_reason === "tool_use") {
//       const toolCall = response.content.find(c => c.type === "tool_use") as any;
      
//       if (toolCall) {
//         console.log(`🎯 Agent selected: [${toolCall.name}]`);
//         console.log(`📦 Properties:`, JSON.stringify(toolCall.input, null, 2));

//         const toolTarget = toolRegistry.get(toolCall.name);
//         if (!toolTarget) {
//           throw new Error(`Execution error: Tool ${toolCall.name} vanished from the runtime registry map.`);
//         }

//         console.log(`⚙️ Routing payload directly to appropriate server pipe...`);
//         const toolResult = await toolTarget.client.callTool({
//           name: toolCall.name,
//           arguments: toolCall.input
//         });

//         // FIX: Extract output into a clean string layout 
//         let rawText = "";
//         if (toolResult.content && Array.isArray(toolResult.content)) {
//           rawText = toolResult.content.map((c: any) => c.text || JSON.stringify(c)).join("\n");
//         } else {
//           rawText = JSON.stringify(toolResult);
//         }

//         console.log(`📊 Server Return Payload Processed.`);

//         // FIX: Format the user feedback message cleanly according to Anthropic's strict type rules
//         conversationHistory.push({
//           role: "user",
//           content: [
//             {
//               type: "tool_result",
//               tool_use_id: toolCall.id,
//               content: rawText
//             }
//           ]
//         });
//       }
//     } else {
//       const textBlock = response.content.find(c => c.type === "text") as any;
//       console.log("\n🏁 [Mission Accomplished] Agent Execution Report:");
//       console.log("--------------------------------------------------");
//       console.log(textBlock ? textBlock.text : "Execution loop finalized without a text summary.");
//       console.log("--------------------------------------------------");
//       activeLoop = false;
//     }
//   }

//   // ==========================================
//   // 6. PIPELINE CLEANUP
//   // ==========================================
//   await enterpriseClient.close();
//   await playwrightClient.close();
//   console.log("\n🛑 All multi-server mesh connections closed cleanly. Execution complete.");
//   process.exit(0);
// }

// runMultiServerQA().catch((err) => {
//   console.error("❌ Agent Mesh Pipeline Crashed:", err);
//   process.exit(1);
// });



import "dotenv/config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Anthropic } from "@anthropic-ai/sdk";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMultiServerQA() {
  console.log("🚀 Initializing Enterprise Multi-Server Agent Mesh...");
  const anthropic = new Anthropic();

  const isWindows = process.platform === "win32";
  const command = isWindows ? "npx.cmd" : "npx";

  // ==========================================
  // 1. CONNECT SERVER A: Custom Enterprise MCP
  // ==========================================
  const enterpriseTransport = new StdioClientTransport({
    command: command,
    args: ["tsx", path.resolve(__dirname, "index.ts")]
  });
  const enterpriseClient = new Client({ name: "enterprise-client", version: "1.0.0" }, { capabilities: {} });
  await enterpriseClient.connect(enterpriseTransport);
  console.log("📡 Mesh Node 1 Connected: Enterprise Data Server");

  // ==========================================
  // 2. CONNECT SERVER B: Standard Playwright MCP
  // ==========================================
  const playwrightTransport = new StdioClientTransport({
    command: command,
    args: ["-y", "@playwright/mcp@latest"]
  });
  const playwrightClient = new Client({ name: "playwright-client", version: "1.0.0" }, { capabilities: {} });
  await playwrightClient.connect(playwrightTransport);
  console.log("📡 Mesh Node 2 Connected: Playwright Browser Server");

  // ==========================================
  // 3. COMBINE SCHEMAS INTO A UNIFIED REGISTRY
  // ==========================================
  const enterpriseTools = await enterpriseClient.listTools();
  const playwrightTools = await playwrightClient.listTools();

  const toolRegistry = new Map<string, { client: Client; schema: any }>();

  enterpriseTools.tools.forEach(t => toolRegistry.set(t.name, { client: enterpriseClient, schema: t }));
  playwrightTools.tools.forEach(t => toolRegistry.set(t.name, { client: playwrightClient, schema: t }));

  console.log(`🗃️ Combined Registry Compiled: Exposing ${toolRegistry.size} total tools to Agent.`);

  const formattedTools = Array.from(toolRegistry.values()).map(item => ({
    name: item.schema.name,
    description: item.schema.description,
    input_schema: item.schema.inputSchema as any
  }));

  // ==========================================
  // 4. DEFINE THE LOCAL SANDBOX CRITERIA
  // ==========================================
  const systemPrompt = `You are a Principal Lead Autonomous Test Architect. 
  CRITICAL RULE: You must interact with the application ONLY by filling out inputs and clicking buttons like a real user. 
  You are STRICTLY FORBIDDEN from using browser_evaluate to manually alter element styles, remove hidden classes, or force DOM layouts open. 
  If an authentication barrier is present, input credentials and click the login button. Wait for the page state to shift naturally.`;

//   const conversationHistory: any[] = [
//     { 
//       role: "user", 
//       content: "Mission: First, generate a premium test user for the US-EAST region using your internal tools. Second, launch a browser context and navigate to your local QA Gym app at 'http://localhost:5173'. Locate the Wire Transfer module, input a transaction amount of '250', execute the transfer, and verify the resulting account balance changes cleanly." 
//     }
//   ];


  const conversationHistory: any[] = [
    { 
      role: "user", 
      content: "Mission: Launch a browser context and navigate to your local QA Gym app at 'http://localhost:5173'. You will encounter a login page. Use your browser tools to input the email 'test-user@enterprise.internal' and password 'SecretGymPass2026', then click the Sign In button. Once you have successfully bypassed the login wall and reached the authenticated dashboard dashboard, locate the Wire Transfer module, input an amount of '250', execute the transfer, and verify the resulting balance reconciles cleanly." 
    }
  ];

  // ==========================================
  // 5. THE RECURSIVE AGENT EXECUTION LOOP
  // ==========================================
  let activeLoop = true;
  let executionDepth = 0;
  const maxDepth = 12;

  while (activeLoop && executionDepth < maxDepth) {
    executionDepth++;
    console.log(`\nHN 🤖 [Loop Iteration #${executionDepth}] Consulting Agent...`);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages: conversationHistory,
      tools: formattedTools
    });

    // Save the assistant's turn directly into the history structure
    conversationHistory.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "tool_use") {
      // Find ALL tool blocks present in the response
      const toolCalls = response.content.filter(c => c.type === "tool_use") as any[];
      
      console.log(`🎯 Agent requested ${toolCalls.length} tool execution(s) in parallel.`);
      const responseResults: any[] = [];

      // Process each requested tool call concurrently or sequentially
      for (const toolCall of toolCalls) {
        console.log(`  ➡️ Executing: [${toolCall.name}] with args:`, JSON.stringify(toolCall.input));

        const toolTarget = toolRegistry.get(toolCall.name);
        if (!toolTarget) {
          throw new Error(`Execution error: Tool ${toolCall.name} vanished from the runtime registry map.`);
        }

        const toolResult = await toolTarget.client.callTool({
          name: toolCall.name,
          arguments: toolCall.input
        });

        let rawText = "";
        if (toolResult.content && Array.isArray(toolResult.content)) {
          rawText = toolResult.content.map((c: any) => c.text || JSON.stringify(c)).join("\n");
        } else {
          rawText = JSON.stringify(toolResult);
        }

        // Push formatted result matching this specific tool call ID
        responseResults.push({
          type: "tool_result",
          tool_use_id: toolCall.id,
          content: rawText
        });
      }

      // Append the complete answer collection as the very next user message block
      conversationHistory.push({
        role: "user",
        content: responseResults
      });
      console.log(`📊 All server returns safely appended back to conversation matrix.`);

    } else {
      const textBlock = response.content.find(c => c.type === "text") as any;
      console.log("\n🏁 [Mission Accomplished] Agent Execution Report:");
      console.log("--------------------------------------------------");
      console.log(textBlock ? textBlock.text : "Execution loop finalized without a text summary.");
      console.log("--------------------------------------------------");
      activeLoop = false;
    }
  }

  // ==========================================
  // 6. PIPELINE CLEANUP
  // ==========================================
  await enterpriseClient.close();
  await playwrightClient.close();
  console.log("\n🛑 All multi-server mesh connections closed cleanly. Execution complete.");
  process.exit(0);
}

runMultiServerQA().catch((err) => {
  console.error("❌ Agent Mesh Pipeline Crashed:", err);
  process.exit(1);
});
