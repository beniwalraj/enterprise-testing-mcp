import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// 1. Initialise the MCP Server
const server = new Server(
  {
    name: "enterprise-testing-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // Telling the LLM we support tool execution
    },
  }
);

// 2. Define Tool Schemas using Zod for strict validation
const GenerateUserSchema = z.object({
  role: z.enum(["admin", "premium_user", "guest"]),
  region: z.string().default("US-EAST"),
});

const TriggerPerfSchema = z.object({
  testSuiteId: z.string(),
  virtualUsers: z.number().max(10000),
});

// 3. Register your tools so the LLM discovers them
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_enterprise_test_user",
        description: "Generates a clean test user in the internal staging database with specific roles and entitlements.",
        inputSchema: {
          type: "object",
          properties: {
            role: { type: "string", enum: ["admin", "premium_user", "guest"] },
            region: { type: "string", description: "AWS region or geographic data silo" }
          },
          required: ["role"]
        }
      },
      {
        name: "trigger_internal_perf_harness",
        description: "Triggers a legacy performance test runner execution and returns the run ID.",
        inputSchema: {
          type: "object",
          properties: {
            testSuiteId: { type: "string" },
            virtualUsers: { type: "number" }
          },
          required: ["testSuiteId", "virtualUsers"]
        }
      }
    ]
  };
});

// 4. Handle tool execution requests from the LLM agent
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "generate_enterprise_test_user") {
      const parsed = GenerateUserSchema.parse(args);
      
      // Simulate calling your internal enterprise database/API
      const mockUser = {
        userId: `usr_${Math.random().toString(36).substr(2, 9)}`,
        email: `test-${parsed.role}@enterprise.internal`,
        token: "JWT_SECRET_TEST_TOKEN_XYZ",
        ...parsed
      };

      return {
        content: [{ type: "text", text: JSON.stringify(mockUser, null, 2) }]
      };
    }

    if (name === "trigger_internal_perf_harness") {
      const parsed = TriggerPerfSchema.parse(args);
      
      // Simulate hitting a legacy system harness
      const runId = `perf_run_${Date.now()}`;
      
      return {
        content: [{ 
          type: "text", 
          text: `Successfully queued performance suite ${parsed.testSuiteId} with ${parsed.virtualUsers} VU. Run ID: ${runId}` 
        }]
      };
    }

    throw new Error(`Tool ${name} not found`);
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: error?.message || "Unknown error" }]
    };
  }
});

// 5. Boot the server using standard input/output transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Enterprise Testing MCP server running on stdio");
