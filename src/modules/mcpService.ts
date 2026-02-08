/**
 * ================================================================
 * MCP (Model Context Protocol) 服务模块
 * ================================================================
 *
 * 本模块实现 MCP 服务器，通过 JSON-RPC 协议暴露 Zotero 条目的 PDF 内容和 AI 总结
 *
 * 主要职责:
 * 1. 在 localhost 上启动 HTTP 服务器
 * 2. 处理 JSON-RPC 请求
 * 3. 提供访问 PDF 内容和 AI 总结的工具接口
 * 4. 管理 AI 总结的创建、更新和删除
 *
 * 暴露的工具:
 * - get_pdf_content: 获取指定条目的 PDF 文本内容
 * - get_ai_summary: 获取条目的 AI 总结笔记
 * - update_ai_summary: 更新或追加 AI 总结内容
 * - delete_ai_summary: 删除 AI 总结笔记
 *
 * @module mcpService
 * @author AI-Butler Team
 */

import { PDFExtractor } from "./pdfExtractor";
import { NoteGenerator } from "./noteGenerator";

/**
 * JSON-RPC 请求接口
 */
interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: any;
  id?: string | number | null;
}

/**
 * JSON-RPC 响应接口
 */
interface JsonRpcResponse {
  jsonrpc: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number | null;
}

/**
 * MCP 服务类
 *
 * 使用 nsIServerSocket 实现 HTTP 服务器，处理 JSON-RPC 请求
 */
export class MCPService {
  private serverSocket: any = null;
  private port: number = 23337;
  private isRunning: boolean = false;

  /**
   * 启动 MCP 服务
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      ztoolkit.log("[MCP] 服务已经在运行中");
      return;
    }

    try {
      // 创建服务器套接字
      const ServerSocket = (Components.classes as any)[
        "@mozilla.org/network/server-socket;1"
      ].createInstance(Components.interfaces.nsIServerSocket);

      // 初始化服务器
      ServerSocket.init(this.port, true, -1);
      this.serverSocket = ServerSocket;

      // 设置异步监听器
      this.serverSocket.asyncListen({
        onSocketAccepted: (
          socket: any,
          transport: any,
        ) => {
          this.handleConnection(transport);
        },
        onStopListening: (socket: any, status: any) => {
          ztoolkit.log("[MCP] 服务器停止监听:", status);
        },
      });

      this.isRunning = true;
      ztoolkit.log(`[MCP] 服务已启动，监听端口: ${this.port}`);
    } catch (error) {
      ztoolkit.log("[MCP] 启动服务失败:", error);
      throw error;
    }
  }

  /**
   * 停止 MCP 服务
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      if (this.serverSocket) {
        this.serverSocket.close();
        this.serverSocket = null;
      }
      this.isRunning = false;
      ztoolkit.log("[MCP] 服务已停止");
    } catch (error) {
      ztoolkit.log("[MCP] 停止服务失败:", error);
    }
  }

  /**
   * 处理客户端连接
   */
  private async handleConnection(transport: any): Promise<void> {
    try {
      const inputStream = transport
        .openInputStream(0, 0, 0)
        .QueryInterface(Components.interfaces.nsIInputStream);
      const outputStream = transport.openOutputStream(0, 0, 0);

      // 读取请求数据
      const scriptableInputStream = (Components.classes as any)[
        "@mozilla.org/scriptableinputstream;1"
      ].createInstance(Components.interfaces.nsIScriptableInputStream);
      scriptableInputStream.init(inputStream);

      let requestData = "";
      const available = scriptableInputStream.available();
      if (available > 0) {
        requestData = scriptableInputStream.read(available);
      }

      ztoolkit.log("[MCP] 收到请求:", requestData);

      // 解析 HTTP 请求
      const lines = requestData.split("\r\n");
      const requestLine = lines[0];
      let body = "";

      // 找到请求体
      const emptyLineIndex = lines.indexOf("");
      if (emptyLineIndex > -1) {
        body = lines.slice(emptyLineIndex + 1).join("\r\n");
      }

      // 处理 JSON-RPC 请求
      let response: JsonRpcResponse;
      if (body) {
        try {
          const jsonRpcRequest: JsonRpcRequest = JSON.parse(body);
          response = await this.handleJsonRpcRequest(jsonRpcRequest);
        } catch (error: any) {
          response = {
            jsonrpc: "2.0",
            error: {
              code: -32700,
              message: "Parse error",
              data: error.message,
            },
            id: null,
          };
        }
      } else {
        response = {
          jsonrpc: "2.0",
          error: {
            code: -32600,
            message: "Invalid Request",
          },
          id: null,
        };
      }

      // 构建 HTTP 响应
      const responseBody = JSON.stringify(response);
      const httpResponse =
        "HTTP/1.1 200 OK\r\n" +
        "Content-Type: application/json\r\n" +
        "Access-Control-Allow-Origin: *\r\n" +
        `Content-Length: ${responseBody.length}\r\n` +
        "\r\n" +
        responseBody;

      // 发送响应
      outputStream.write(httpResponse, httpResponse.length);
      outputStream.flush();
      outputStream.close();
      inputStream.close();
    } catch (error) {
      ztoolkit.log("[MCP] 处理连接失败:", error);
    }
  }

  /**
   * 处理 JSON-RPC 请求
   */
  private async handleJsonRpcRequest(
    request: JsonRpcRequest,
  ): Promise<JsonRpcResponse> {
    const { method, params, id } = request;

    try {
      let result: any;

      switch (method) {
        case "get_pdf_content":
          result = await this.getPdfContent(params);
          break;
        case "get_ai_summary":
          result = await this.getAiSummary(params);
          break;
        case "update_ai_summary":
          result = await this.updateAiSummary(params);
          break;
        case "delete_ai_summary":
          result = await this.deleteAiSummary(params);
          break;
        default:
          return {
            jsonrpc: "2.0",
            error: {
              code: -32601,
              message: "Method not found",
            },
            id,
          };
      }

      return {
        jsonrpc: "2.0",
        result,
        id,
      };
    } catch (error: any) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: error.message || "Internal error",
        },
        id,
      };
    }
  }

  /**
   * 获取 PDF 内容
   */
  private async getPdfContent(params: any): Promise<any> {
    const { itemKey } = params;

    if (!itemKey) {
      throw new Error("itemKey is required");
    }

    // 通过 itemKey 获取条目
    const item = await this.getItemByKey(itemKey);
    if (!item) {
      throw new Error(`Item not found: ${itemKey}`);
    }

    // 提取 PDF 文本
    const text = await PDFExtractor.extractTextFromItem(item);

    return {
      itemKey,
      content: text,
      length: text.length,
    };
  }

  /**
   * 获取 AI 总结
   */
  private async getAiSummary(params: any): Promise<any> {
    const { itemKey } = params;

    if (!itemKey) {
      throw new Error("itemKey is required");
    }

    // 通过 itemKey 获取条目
    const item = await this.getItemByKey(itemKey);
    if (!item) {
      throw new Error(`Item not found: ${itemKey}`);
    }

    // 查找 AI 总结笔记
    const note = await NoteGenerator["findExistingNote"](item);
    if (!note) {
      return {
        itemKey,
        hasNote: false,
        content: null,
      };
    }

    const noteHtml = (note as any).getNote?.() || "";

    return {
      itemKey,
      hasNote: true,
      content: noteHtml,
      noteKey: note.key,
      dateModified: note.dateModified,
    };
  }

  /**
   * 更新 AI 总结
   */
  private async updateAiSummary(params: any): Promise<any> {
    const { itemKey, content, mode = "overwrite" } = params;

    if (!itemKey) {
      throw new Error("itemKey is required");
    }
    if (!content) {
      throw new Error("content is required");
    }
    if (mode !== "overwrite" && mode !== "append") {
      throw new Error("mode must be 'overwrite' or 'append'");
    }

    // 通过 itemKey 获取条目
    const item = await this.getItemByKey(itemKey);
    if (!item) {
      throw new Error(`Item not found: ${itemKey}`);
    }

    // 查找或创建 AI 总结笔记
    let note = await NoteGenerator["findExistingNote"](item);
    let isNewNote = false;

    if (!note) {
      // 创建新笔记
      note = new Zotero.Item("note");
      note.parentKey = item.key;
      note.libraryID = item.libraryID;
      await note.saveTx();
      isNewNote = true;
    }

    // 更新笔记内容
    let newContent = content;
    if (mode === "append" && !isNewNote) {
      const existingContent = (note as any).getNote?.() || "";
      newContent = existingContent + "\n\n" + content;
    }

    // 设置笔记内容和标签
    (note as any).setNote(newContent);
    
    // 添加 AI-Generated 标签
    const tags = (note as any).getTags?.() || [];
    const hasTag = tags.some((t: any) => t.tag === "AI-Generated");
    if (!hasTag) {
      (note as any).addTag("AI-Generated");
    }

    await note.saveTx();

    return {
      itemKey,
      noteKey: note.key,
      mode,
      isNewNote,
      dateModified: note.dateModified,
    };
  }

  /**
   * 删除 AI 总结
   */
  private async deleteAiSummary(params: any): Promise<any> {
    const { itemKey } = params;

    if (!itemKey) {
      throw new Error("itemKey is required");
    }

    // 通过 itemKey 获取条目
    const item = await this.getItemByKey(itemKey);
    if (!item) {
      throw new Error(`Item not found: ${itemKey}`);
    }

    // 查找 AI 总结笔记
    const note = await NoteGenerator["findExistingNote"](item);
    if (!note) {
      return {
        itemKey,
        deleted: false,
        message: "No AI summary note found",
      };
    }

    // 删除笔记
    await note.eraseTx();

    return {
      itemKey,
      deleted: true,
      noteKey: note.key,
    };
  }

  /**
   * 通过 itemKey 获取条目
   */
  private async getItemByKey(itemKey: string): Promise<Zotero.Item | null> {
    try {
      // 在所有库中搜索
      const libraries = Zotero.Libraries.getAll();
      
      for (const library of libraries) {
        const item = Zotero.Items.getByLibraryAndKey(library.libraryID, itemKey);
        if (item) {
          return item;
        }
      }

      return null;
    } catch (error) {
      ztoolkit.log("[MCP] 获取条目失败:", error);
      return null;
    }
  }
}
