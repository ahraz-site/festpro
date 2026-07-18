import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: { title: "FestPro Public API", version: "1.0.0", description: "Enterprise festival management REST API" },
    servers: [{ url: "/api/v1", description: "Production" }],
    security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        ApiKeyAuth: { type: "apiKey", in: "header", name: "Authorization", description: "Format: Bearer fp_<key>" },
      },
      schemas: {
        Error: { type: "object", properties: { error: { type: "string" } } },
        Pagination: { type: "object", properties: { page: { type: "integer" }, limit: { type: "integer" }, total: { type: "integer" }, data: { type: "array", items: { type: "object" } } } },
        Festival: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, description: { type: "string" }, start_date: { type: "string", format: "date" }, end_date: { type: "string", format: "date" }, status: { type: "string" }, venue: { type: "string" }, organization_id: { type: "string" } } },
        Participant: { type: "object", properties: { id: { type: "string" }, festival_id: { type: "string" }, first_name: { type: "string" }, last_name: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string" }, status: { type: "string" }, category: { type: "string" } } },
        Competition: { type: "object", properties: { id: { type: "string" }, festival_id: { type: "string" }, name: { type: "string" }, category: { type: "string" }, status: { type: "string" }, max_participants: { type: "integer" } } },
        WebhookEndpoint: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, url: { type: "string", format: "uri" }, events: { type: "array", items: { type: "string" } }, is_active: { type: "boolean" }, secret: { type: "string" } } },
        ApiKey: { type: "object", properties: { id: { type: "string" }, key_name: { type: "string" }, key_prefix: { type: "string" }, permissions: { type: "array", items: { type: "string" } }, status: { type: "string" }, created_at: { type: "string", format: "date-time" } } },
      },
    },
    paths: {
      "/auth": {
        get: { summary: "Verify authentication", security: [{ ApiKeyAuth: [] }], responses: { "200": { description: "Auth status" } } },
        post: { summary: "Get OAuth token", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { grant_type: { type: "string", enum: ["authorization_code", "client_credentials", "refresh_token"] }, client_id: { type: "string" }, client_secret: { type: "string" }, code: { type: "string" }, refresh_token: { type: "string" } } } } } }, responses: { "200": { description: "Token response" } } },
      },
      "/organizations": {
        get: { summary: "Get current organization", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { "200": { description: "Organization data" } } },
        put: { summary: "Update organization", security: [{ ApiKeyAuth: [] }], responses: { "200": { description: "Updated organization" } } },
      },
      "/festivals": {
        get: { summary: "List festivals", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }, { name: "search", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }, { name: "sort", in: "query", schema: { type: "string" } }, { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } }], responses: { "200": { description: "Paginated festivals", content: { "application/json": { schema: { $ref: "#/components/schemas/Pagination" } } } } } },
        post: { summary: "Create festival", security: [{ ApiKeyAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Festival" } } } }, responses: { "201": { description: "Created festival" } } },
      },
      "/festivals/{id}": {
        get: { summary: "Get festival by ID", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Festival data" }, "404": { description: "Not found" } } },
        put: { summary: "Update festival", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated festival" } } },
        delete: { summary: "Delete festival", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Success" } } },
      },
      "/participants": {
        get: { summary: "List participants", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", required: true, schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }, { name: "search", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated participants" } } },
        post: { summary: "Create participant", security: [{ ApiKeyAuth: [] }], responses: { "201": { description: "Created participant" } } },
      },
      "/competitions": {
        get: { summary: "List competitions", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", required: true, schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }, { name: "category", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated competitions" } } },
      },
      "/schedules": {
        get: { summary: "List schedules", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", required: true, schema: { type: "string" } }, { name: "date", in: "query", schema: { type: "string" } }, { name: "stage_id", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated schedules" } } },
      },
      "/judges": {
        get: { summary: "List judges", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", required: true, schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated judges" } } },
      },
      "/results": {
        get: { summary: "List results", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", schema: { type: "string" } }, { name: "competition_id", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated results" } } },
      },
      "/certificates": {
        get: { summary: "List certificates", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", schema: { type: "string" } }, { name: "type", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated certificates" } } },
      },
      "/announcements": {
        get: { summary: "List announcements", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated announcements" } } },
      },
      "/gallery": {
        get: { summary: "List gallery items", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated gallery items" } } },
      },
      "/reports": {
        get: { summary: "Generate reports", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "type", in: "query", schema: { type: "string", enum: ["summary", "financial", "participants", "competitions"] } }, { name: "festival_id", in: "query", schema: { type: "string" } }, { name: "start_date", in: "query", schema: { type: "string", format: "date" } }, { name: "end_date", in: "query", schema: { type: "string", format: "date" } }], responses: { "200": { description: "Report data" } } },
      },
      "/inventory": {
        get: { summary: "List inventory", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", schema: { type: "string" } }, { name: "category", in: "query", schema: { type: "string" } }, { name: "search", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated inventory" } } },
      },
      "/finance": {
        get: { summary: "List transactions", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", schema: { type: "string" } }, { name: "category", in: "query", schema: { type: "string" } }, { name: "start_date", in: "query", schema: { type: "string" } }, { name: "end_date", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated transactions" } } },
        post: { summary: "Create transaction", security: [{ ApiKeyAuth: [] }], responses: { "201": { description: "Created transaction" } } },
      },
      "/crm": {
        get: { summary: "List CRM contacts", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "festival_id", in: "query", schema: { type: "string" } }, { name: "type", in: "query", schema: { type: "string" } }, { name: "search", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Paginated contacts" } } },
        post: { summary: "Create CRM contact", security: [{ ApiKeyAuth: [] }], responses: { "201": { description: "Created contact" } } },
      },
      "/integrations": {
        get: { summary: "List integrations", security: [{ ApiKeyAuth: [] }], parameters: [{ name: "type", in: "query", schema: { type: "string", enum: ["connections", "providers"] } }], responses: { "200": { description: "Integration data" } } },
        post: { summary: "Create integration connection", security: [{ ApiKeyAuth: [] }], responses: { "201": { description: "Created connection" } } },
      },
      "/webhooks": {
        get: { summary: "List webhook endpoints", security: [{ ApiKeyAuth: [] }], responses: { "200": { description: "Webhook endpoints" } } },
        post: { summary: "Create webhook endpoint", security: [{ ApiKeyAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/WebhookEndpoint" } } } }, responses: { "201": { description: "Created webhook" } } },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication & OAuth 2.1" },
      { name: "Organizations", description: "Organization management" },
      { name: "Festivals", description: "Festival CRUD" },
      { name: "Participants", description: "Participant management" },
      { name: "Competitions", description: "Competition management" },
      { name: "Schedules", description: "Schedule management" },
      { name: "Judges", description: "Judge management" },
      { name: "Results", description: "Result publishing" },
      { name: "Certificates", description: "Certificate generation" },
      { name: "Finance", description: "Financial transactions" },
      { name: "CRM", description: "Contact management" },
      { name: "Integrations", description: "Third-party integrations" },
      { name: "Webhooks", description: "Webhook endpoints" },
    ],
  })
}
