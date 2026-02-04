# Contract: POST /api/onboarding/story/process-input

**Change type**: Response schema extension

## Request (unchanged)

```json
{
  "audioBase64": "string (optional, base64 audio)",
  "text": "string (optional, text input)",
  "currentIngredients": ["string"]
}
```

One of `audioBase64` or `text` required.

## Response (MODIFIED)

### Before
```json
{
  "add": ["egg", "parmesan"],
  "rm": ["milk"],
  "transcribedText": "I bought some eggs and parmesan",
  "unrecognized": ["dragon fruit"]
}
```

### After
```json
{
  "add": [
    { "name": "egg", "quantityLevel": 2 },
    { "name": "parmesan", "quantityLevel": 3 }
  ],
  "rm": ["milk"],
  "transcribedText": "I bought some eggs and parmesan",
  "unrecognized": ["dragon fruit"]
}
```

## quantityLevel Mapping

| Value | Word | Trigger Phrases |
|-------|------|-----------------|
| 3 | plenty | "a lot", "plenty", "tons", no modifier (default) |
| 2 | some | "some", "a few", "several", "enough" |
| 1 | low | "a little", "not much", "running low" |
| 0 | out | N/A — handled by `rm` array |

## Opik Trace Enhancement

When `unrecognized` array is non-empty, trace update must include:
- **Tag**: `"unrecognized_items"` appended to existing tags
- **Metadata**: `{ unrecognized: ["dragon fruit", ...] }`
