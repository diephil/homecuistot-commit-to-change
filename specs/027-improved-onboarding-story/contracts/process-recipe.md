# Contract: POST /api/onboarding/process-recipe

## Change Summary

Add optional `additionalTags` field to request body. No response changes.

## Request Body

```json
{
  "audioBase64": "base64string...",       // optional, voice input
  "text": "my carbonara recipe...",       // optional, text input
  "trackedRecipes": [                     // existing recipes in session
    {
      "id": "uuid",
      "name": "Recipe Name",
      "description": "optional",
      "ingredients": [
        { "id": "uuid", "name": "Pasta", "type": "anchor" }
      ]
    }
  ],
  "additionalTags": ["onboarding-story-scene2"]  // NEW: optional, for Opik traces
}
```

**Validation**: Either `audioBase64` or `text` must be provided. `additionalTags` is optional string array.

## Response (unchanged)

```json
{
  "recipes": [
    {
      "id": "uuid",
      "name": "Sarah's Pasta Carbonara",
      "description": "...",
      "ingredients": [
        { "id": "uuid", "name": "Egg", "type": "anchor" },
        { "id": "uuid", "name": "Parmesan", "type": "anchor" },
        { "id": "uuid", "name": "Pasta", "type": "anchor" },
        { "id": "uuid", "name": "Bacon", "type": "anchor" }
      ]
    }
  ],
  "transcribedText": "I can cook my family's...",
  "assistantResponse": "I've added your carbonara recipe...",
  "noChangesDetected": false
}
```

## Error Responses

- `400`: Invalid request body
- `401`: Unauthorized (no session)
- `500`: Processing error
