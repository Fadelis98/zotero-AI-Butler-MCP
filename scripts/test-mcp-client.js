#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * MCP Service Test Client
 *
 * This script demonstrates how to interact with the Zotero AI Butler MCP service.
 * It sends JSON-RPC requests to test all available tools.
 *
 * Usage:
 *   node test-mcp-client.js <itemKey>
 *
 * Example:
 *   node test-mcp-client.js ABCD1234
 */

const http = require("http");

const MCP_HOST = "localhost";
const MCP_PORT = 23337;

/**
 * Send a JSON-RPC request to the MCP service
 */
function sendRequest(method, params) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: Date.now(),
    });

    const options = {
      hostname: MCP_HOST,
      port: MCP_PORT,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(`RPC Error: ${response.error.message}`));
          } else {
            resolve(response.result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * Test all MCP service tools
 */
async function testMCPService(itemKey) {
  console.log("=".repeat(60));
  console.log("MCP Service Test Client");
  console.log("=".repeat(60));
  console.log(`Testing with item key: ${itemKey}\n`);

  try {
    // Test 1: Get PDF content
    console.log("1. Testing get_pdf_content...");
    try {
      const pdfResult = await sendRequest("get_pdf_content", { itemKey });
      console.log(
        `   ✓ Success! PDF content length: ${pdfResult.length} characters`,
      );
      console.log(`   Preview: ${pdfResult.content.substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}\n`);
    }

    // Test 2: Get AI summary
    console.log("2. Testing get_ai_summary...");
    try {
      const summaryResult = await sendRequest("get_ai_summary", { itemKey });
      if (summaryResult.hasNote) {
        console.log(`   ✓ AI summary found!`);
        console.log(`   Note key: ${summaryResult.noteKey}`);
        console.log(`   Last modified: ${summaryResult.dateModified}`);
        console.log(
          `   Content preview: ${summaryResult.content.substring(0, 100)}...\n`,
        );
      } else {
        console.log(`   ℹ No AI summary note found for this item\n`);
      }
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}\n`);
    }

    // Test 3: Update AI summary (append mode)
    console.log("3. Testing update_ai_summary (append mode)...");
    try {
      const testContent =
        "<h3>Test Note</h3><p>This is a test note created by the MCP test client at " +
        new Date().toISOString() +
        "</p>";
      const updateResult = await sendRequest("update_ai_summary", {
        itemKey,
        content: testContent,
        mode: "append",
      });
      console.log(`   ✓ Success!`);
      console.log(`   Note key: ${updateResult.noteKey}`);
      console.log(`   Mode: ${updateResult.mode}`);
      console.log(`   Is new note: ${updateResult.isNewNote}`);
      console.log(`   Last modified: ${updateResult.dateModified}\n`);
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}\n`);
    }

    // Test 4: Verify the update by getting the summary again
    console.log("4. Verifying the update...");
    try {
      const verifyResult = await sendRequest("get_ai_summary", { itemKey });
      if (verifyResult.hasNote) {
        console.log(`   ✓ AI summary verified!`);
        console.log(
          `   Content length: ${verifyResult.content.length} characters\n`,
        );
      }
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}\n`);
    }

    // Test 5: Optional - Test delete (commented out by default)
    // Uncomment the following block if you want to test deletion
    /*
    console.log('5. Testing delete_ai_summary...');
    try {
      const deleteResult = await sendRequest('delete_ai_summary', { itemKey });
      if (deleteResult.deleted) {
        console.log(`   ✓ AI summary deleted!`);
        console.log(`   Deleted note key: ${deleteResult.noteKey}\n`);
      } else {
        console.log(`   ℹ ${deleteResult.message}\n`);
      }
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}\n`);
    }
    */

    console.log("=".repeat(60));
    console.log("All tests completed!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node test-mcp-client.js <itemKey>");
  console.error("Example: node test-mcp-client.js ABCD1234");
  console.error("\nTo find an item key in Zotero:");
  console.error("1. Right-click on an item");
  console.error('2. Select "Copy Item Key" or look at the item\'s URI');
  process.exit(1);
}

const itemKey = args[0];
testMCPService(itemKey);
