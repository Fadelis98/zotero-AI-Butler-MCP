# MCP Service Documentation

## Overview

The MCP (Model Context Protocol) service provides a JSON-RPC interface for accessing Zotero item data, including PDF content and AI-generated summaries. The service runs on `localhost:23337` and is automatically started when the Zotero AI Butler plugin is loaded.

## Features

The MCP service exposes the following tools through JSON-RPC:

### 1. get_pdf_content

Extract PDF text content from a Zotero item.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "get_pdf_content",
  "params": {
    "itemKey": "ABCD1234"
  },
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "itemKey": "ABCD1234",
    "content": "Full text content of the PDF...",
    "length": 15234
  },
  "id": 1
}
```

### 2. get_ai_summary

Get the AI-generated summary note for a Zotero item.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "get_ai_summary",
  "params": {
    "itemKey": "ABCD1234"
  },
  "id": 2
}
```

**Response (when note exists):**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "itemKey": "ABCD1234",
    "hasNote": true,
    "content": "<h2>AI Summary</h2><p>...</p>",
    "noteKey": "NOTE5678",
    "dateModified": "2026-02-08 17:00:00"
  },
  "id": 2
}
```

**Response (when no note exists):**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "itemKey": "ABCD1234",
    "hasNote": false,
    "content": null
  },
  "id": 2
}
```

### 3. update_ai_summary

Update or append to the AI summary note.

**Request (overwrite mode):**

```json
{
  "jsonrpc": "2.0",
  "method": "update_ai_summary",
  "params": {
    "itemKey": "ABCD1234",
    "content": "<h2>New Summary</h2><p>This is a new summary...</p>",
    "mode": "overwrite"
  },
  "id": 3
}
```

**Request (append mode):**

```json
{
  "jsonrpc": "2.0",
  "method": "update_ai_summary",
  "params": {
    "itemKey": "ABCD1234",
    "content": "<h3>Follow-up Question</h3><p>Additional analysis...</p>",
    "mode": "append"
  },
  "id": 4
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "itemKey": "ABCD1234",
    "noteKey": "NOTE5678",
    "mode": "overwrite",
    "isNewNote": false,
    "dateModified": "2026-02-08 17:05:00"
  },
  "id": 3
}
```

### 4. delete_ai_summary

Delete the AI summary note associated with an item.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "method": "delete_ai_summary",
  "params": {
    "itemKey": "ABCD1234"
  },
  "id": 5
}
```

**Response (when note exists and deleted):**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "itemKey": "ABCD1234",
    "deleted": true,
    "noteKey": "NOTE5678"
  },
  "id": 5
}
```

**Response (when no note exists):**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "itemKey": "ABCD1234",
    "deleted": false,
    "message": "No AI summary note found"
  },
  "id": 5
}
```

## Error Responses

When an error occurs, the service returns a JSON-RPC error response:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Item not found: ABCD1234"
  },
  "id": 1
}
```

### Common Error Codes

- `-32700`: Parse error (invalid JSON)
- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32000`: Internal error (with specific error message)

## Usage Example with cURL

```bash
# Get PDF content
curl -X POST http://localhost:23337 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "get_pdf_content",
    "params": {"itemKey": "ABCD1234"},
    "id": 1
  }'

# Get AI summary
curl -X POST http://localhost:23337 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "get_ai_summary",
    "params": {"itemKey": "ABCD1234"},
    "id": 2
  }'

# Update AI summary (append mode)
curl -X POST http://localhost:23337 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "update_ai_summary",
    "params": {
      "itemKey": "ABCD1234",
      "content": "<p>Additional notes...</p>",
      "mode": "append"
    },
    "id": 3
  }'

# Delete AI summary
curl -X POST http://localhost:23337 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "delete_ai_summary",
    "params": {"itemKey": "ABCD1234"},
    "id": 4
  }'
```

## Finding Item Keys

To find the item key for a Zotero item:

1. Right-click on the item in Zotero
2. Select "Copy Item Key" or look at the item's URI
3. The key is the alphanumeric string after the last slash (e.g., `ABCD1234`)

Alternatively, you can use Zotero's JavaScript API:

```javascript
// In Zotero's Run JavaScript window
const items = ZoteroPane.getSelectedItems();
items[0].key; // Returns the item key
```

## Technical Details

- **Protocol**: HTTP with JSON-RPC 2.0
- **Port**: 23337
- **Host**: localhost (127.0.0.1)
- **CORS**: Enabled with `Access-Control-Allow-Origin: *`
- **Startup**: Automatic when Zotero AI Butler plugin loads
- **Shutdown**: Automatic when Zotero closes or plugin is disabled

## Security Considerations

The MCP service is only accessible from localhost (127.0.0.1) and cannot be reached from external networks. This ensures that only applications running on the same machine can access your Zotero data through the MCP interface.
