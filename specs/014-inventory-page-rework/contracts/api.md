# API Contracts: Inventory Page Rework

**Feature**: 014-inventory-page-rework | **Date**: 2026-01-27

## Endpoints Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/inventory` | Fetch user inventory (existing) |
| POST | `/api/inventory` | Update single inventory item (existing) |
| POST | `/api/inventory/process-voice` | Process voice → inventory updates (new) |
| POST | `/api/inventory/process-text` | Process text → inventory updates (new) |
| POST | `/api/inventory/validate` | Validate ingredient names (new) |
| POST | `/api/inventory/batch` | Apply multiple inventory updates (new) |
| PATCH | `/api/inventory/[id]/toggle-staple` | Toggle pantry staple status (new) |
| DELETE | `/api/inventory/[id]` | Delete inventory item (new) |

---

## Existing Endpoints

### GET /api/inventory

Fetch all user inventory items.

**Request**: None (auth from session)

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "ingredientId": "uuid",
      "name": "tomatoes",
      "category": "vegetables",
      "quantityLevel": 2,
      "isPantryStaple": false,
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

**Response 401**: Unauthorized

---

### POST /api/inventory

Update single inventory item (existing endpoint).

**Request**:
```json
{
  "ingredientId": "uuid",
  "quantityLevel": 3
}
```

**Response 200**:
```json
{
  "success": true,
  "item": { /* InventoryDisplayItem */ }
}
```

---

## New Endpoints

### POST /api/inventory/process-voice

Process voice recording to extract inventory updates.

**Opik Tracing**: Uses `trackGemini()` with `INVENTORY_UPDATE_PROMPT` for observability.

**Request**:
```json
{
  "audioBase64": "base64-encoded-webm-audio"
}
```

**Response 200**:
```json
{
  "updates": [
    {
      "ingredientName": "tomatoes",
      "quantityLevel": 3,
      "confidence": "high"
    },
    {
      "ingredientName": "eggs",
      "quantityLevel": 0,
      "confidence": "high"
    }
  ]
}
```

**Response 400**:
```json
{
  "error": "Failed to process audio",
  "details": "No ingredients detected"
}
```

**Response 500**:
```json
{
  "error": "Processing failed",
  "details": "LLM service unavailable"
}
```

---

### POST /api/inventory/process-text

Process text input to extract inventory updates.

**Request**:
```json
{
  "text": "I just bought milk and eggs, ran out of cheese"
}
```

**Response 200**:
```json
{
  "updates": [
    {
      "ingredientName": "milk",
      "quantityLevel": 3,
      "confidence": "high"
    },
    {
      "ingredientName": "eggs",
      "quantityLevel": 3,
      "confidence": "high"
    },
    {
      "ingredientName": "cheese",
      "quantityLevel": 0,
      "confidence": "high"
    }
  ]
}
```

**Response 400**:
```json
{
  "error": "Invalid input",
  "details": "Text is required"
}
```

---

### POST /api/inventory/validate

Validate ingredient names against database.

**Request**:
```json
{
  "ingredientNames": ["tomatoes", "mystery spice", "eggs"]
}
```

**Response 200**:
```json
{
  "recognized": [
    {
      "inputName": "tomatoes",
      "matchedName": "tomato",
      "ingredientId": "uuid"
    },
    {
      "inputName": "eggs",
      "matchedName": "egg",
      "ingredientId": "uuid"
    }
  ],
  "unrecognized": ["mystery spice"]
}
```

---

### POST /api/inventory/batch

Apply multiple inventory updates in single transaction.

**Request**:
```json
{
  "updates": [
    {
      "ingredientId": "uuid",
      "quantityLevel": 3
    },
    {
      "ingredientId": "uuid",
      "quantityLevel": 0
    }
  ]
}
```

**Response 200**:
```json
{
  "success": true,
  "updatedCount": 2,
  "items": [ /* InventoryDisplayItem[] */ ]
}
```

**Response 400**:
```json
{
  "error": "Validation failed",
  "details": "Invalid quantity level for item 2"
}
```

---

### PATCH /api/inventory/[id]/toggle-staple

Toggle pantry staple status for an item.

**Request**: None (toggle current value)

**Response 200**:
```json
{
  "success": true,
  "item": {
    "id": "uuid",
    "isPantryStaple": true
  }
}
```

**Response 404**:
```json
{
  "error": "Item not found"
}
```

---

### DELETE /api/inventory/[id]

Permanently remove item from inventory.

**Request**: None

**Response 200**:
```json
{
  "success": true,
  "deletedId": "uuid"
}
```

**Response 404**:
```json
{
  "error": "Item not found"
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Not authorized (wrong user) |
| 404 | Resource not found |
| 500 | Server error / LLM failure |

---

## Authentication

All endpoints require valid Supabase session.

Headers:
```
Cookie: sb-access-token=...
Cookie: sb-refresh-token=...
```

Server extracts user ID from session via `createClient().auth.getUser()`.
