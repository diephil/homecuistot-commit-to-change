# HomeCuistot — New Onboarding Flow Specification

## Overview

The onboarding is a **guided simulation**. Users learn by participating in Sarah's story.

**Total time:** ~2 minutes
**Structure:** 7 scenes telling Sarah's story, with 2 interactive moments where the user participates.
**Data persistence:** None. All state is client-side demo data. No user data persisted during this flow.

---

## Scene 1: The Problem

**Type:** Static screen
**Purpose:** Establish pain point. Sarah knows how to cook, but uncertainty about ingredients leads to takeout.

**Content:**

```
5:47pm. Office.

Sarah's hungry. She doesn't feel like scrolling
through Uber Eats again.

She knows how to cook. Carbonara, stir fry,
a couple of other dishes she's made a hundred times.
She's not looking for new recipes or inspiration.

The problem: she has no idea what's actually
in her fridge right now.

Can she make carbonara tonight? Or does she
need to stop at the store? For what exactly?

This uncertainty is enough to make her give up
and order pad thai for the third time this week.

She opens HomeCuistot instead.
```

**CTA:** `[ Continue → ]`

---

## Scene 2: Inventory + Recipe Status

**Type:** Static screen
**Purpose:** Show Sarah's inventory AND why carbonara isn't cookable. Make the connection between inventory and recipe status explicit.

**Content:**

```
SARAH'S KITCHEN
───────────────────────────────────

TRACKED INGREDIENTS
• Pasta (plenty)
• Bacon (some)
• Rice (some)
• Butter (enough)
• Milk (low)
• Parmesan (critical)
• Egg (critical)

STAPLES (always available)
• Salt • Black pepper • Olive oil
───────────────────────────────────

TONIGHT'S OPTIONS

┌──────────────────────────────────┐
│ 🥓 Pasta Carbonara               │
│                                  │
│   ✓ Pasta                        │
│   ✓ Bacon                        │
│   ✗ Eggs ← missing               │
│   ✗ Parmesan ← missing           │
│   ✓ Black pepper (staple)        │
│   ✓ Salt (staple)                │
│                                  │
│   ░░░░░░░░░░░░ NOT READY         │
└──────────────────────────────────┘

Sarah wants carbonara, but she's missing eggs and parmesan. She's also running low on milk.
```

**CTA:** `[ Continue → ]`

---

## Scene 3: The Decision

**Type:** Static screen (narrative transition)
**Purpose:** Bridge to the voice input scene. Sarah takes action.

**Content:**

```
She stops at the store on her way home.

Grabs what's missing (eggs and parmesan) plus a few other things.
```

**CTA:** `[ Continue → ]`

---

## Scene 4: The Voice Moment + Inventory Update

**Type:** Interactive — USER PARTICIPATES
**Purpose:** User speaks as Sarah. Voice input updates inventory in real-time. Scene only advances when required items (eggs + parmesan) are detected.

### Initial State

```
6:30pm. Home.

Partner: "What'd you get?"

SARAH'S KITCHEN
───────────────────────────────────

TRACKED INGREDIENTS
• Pasta (plenty)
• Bacon (some)
• Rice (some)
• Butter (enough)
• Milk (low)
• Parmesan (critical)
• Egg (critical)

STAPLES (always available)
• Salt • Black pepper • Olive oil
───────────────────────────────────

Help Sarah add what she bought.
Tap and say:

"I bought parmesan, eggs, and a milk"

        ┌───────────────┐
        │      🎤       │
        │  Tap to speak │
        └───────────────┘

        [ Continue → ]
        (disabled)
```

### After Voice Input (inventory updates in real-time)

```
6:30pm. Home.

Partner: "What'd you get?"


SARAH'S KITCHEN
───────────────────────────────────

TRACKED INGREDIENTS
• Pasta (plenty)
• Bacon (some)
• Rice (some)
• Butter (enough)
• Milk (low)
• Parmesan (plenty)
• Egg (plenty)
• Milk (plenty)

STAPLES (always available)
• Salt • Black pepper • Olive oil
───────────────────────────────────

        ┌───────────────┐
        │      🎤       │
        │   Add more    │
        └───────────────┘

        [ Continue → ]
        (enabled ✓)
```

### Voice Input Handling

- Transcribe user's speech
- Extract items via LLM (reuse existing ingredient extractor agent)
- Update inventory display immediately as items are extracted
- Required items for progression: **eggs AND parmesan**
- Optional items: anything else user adds (accepted, displayed)

### Button States

- `[ Continue → ]` disabled until eggs AND parmesan are both in inventory
- Mic button label changes to "Add more" after first successful input
- User can do multiple voice passes

### Edge Cases

| Scenario                       | Handling                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| User says something unrelated  | Items extracted (if any), inventory updates, Continue stays disabled if missing eggs/parmesan |
| User says only eggs            | Inventory updates with eggs, Continue stays disabled, user can add more                       |
| User says only parmesan        | Inventory updates with parmesan, Continue stays disabled, user can add more                   |
| User says both eggs + parmesan | Inventory updates, Continue becomes enabled                                                   |
| User is silent for 5s          | Show hint: "Try saying: I bought parmesan, eggs, and a cheesecake"                            |
| Extraction fails               | Show error, let user retry                                                                    |
| Mic permission denied          | Show text input fallback                                                                      |

### Success Criteria

Inventory contains both eggs AND parmesan → `[ Continue → ]` enabled → proceeds to Scene 5.

---

## Scene 5: The Payoff + Cook Action

**Type:** Interactive — USER PARTICIPATES
**Purpose:** User sees the recipe card turn green. They tap to mark it cooked.

**Content:**

```
┌──────────────────────────────────┐
│ 🥓 Pasta Carbonara               │
│   ████████████████████ READY     │
│                                  │
│   ✓ Pasta                        │
│   ✓ Bacon                        │
│   ✓ Eggs ← just added            │
│   ✓ Parmesan ← just added        │
│   ✓ Black pepper (staple)        │
│   ✓ Salt (staple)                │
└──────────────────────────────────┘

"We have everything for carbonara—let me cook it!"

Help Sarah log that she made it.

        ┌───────────────────┐
        │   I made this ✓   │
        └───────────────────┘
```

**Interaction:** User taps "I made this" → triggers Scene 6

---

## Scene 6: Inventory Auto-Update Modal

**Type:** Fake modal (non-interactive content, dismiss button only)
**Purpose:** Show how inventory auto-decrements when a recipe is marked cooked. Reinforce that staples are not tracked.

**Content:**

```
┌─────────────────────────────────────┐
│                                     │
│   Pasta Carbonara — cooked!         │
│                                     │
│   USED                              │
│   • Eggs (plenty → some)            │
│   • Parmesan (plenty → some)        │
│   • Bacon (some → low)              │
│   • Pasta (plenty → some)           │
│                                     │
│   NOT TRACKED (staples)             │
│   • Black pepper                    │
│   • Salt                            │
│                                     │
│   ─────────────────────────────     │
│   Staples never run out.            │
│   No need to track them.            │
│   ─────────────────────────────     │
│                                     │
│           [ Got it ✓ ]              │
│                                     │
└─────────────────────────────────────┘
```

**CTA:** `[ Got it ✓ ]` → proceeds to Scene 7

---

## Scene 7: The Wrap-Up (Manifesto)

**Type:** Static screen
**Purpose:** Deliver core product message. Differentiate from recipe apps.

**Content:**

```
That's HomeCuistot.

Sarah didn't scroll through hundreds of recipes.

She didn't watch a 10-minute video to learn something new.

She didn't end up ordering takeout because she couldn't decide.

───────────────────────────────────

She already knew how to make carbonara.

She just needed to know she could make it tonight.

───────────────────────────────────

HomeCuistot isn't a recipe app.
It's your inventory clerk.

You bring the skills.
We track the ingredients.

Let's commit to change and cook more!
```

**CTA:** `[ Get started → ]` AND Tell us first what you can cook blindfolded! -> redirects to the /recipes route where the user can start managing all their recipies

---

## Flow Summary

```
Scene 1: The Problem (static)
    ↓
Scene 2: Inventory + Recipe Status (static)
    ↓
Scene 3: The Decision (static)
    ↓
Scene 4: Voice Input + Inventory Update (interactive)
    │
    │  User speaks → inventory updates in real-time
    │  Continue enabled only when eggs + parmesan detected
    ↓
Scene 5: Recipe Ready + Mark Cooked (interactive)
    │
    │  User taps "I made this"
    ↓
Scene 6: Inventory Decrement Modal (educational)
    ↓
Scene 7: Wrap-Up / Manifesto (static)
    ↓
[ Get started → ] → /recipes
```

---

## Data Model (Demo Only)

All state is client-side. No user data persisted during this flow.

```typescript
const SARAH_INVENTORY = [
  { name: "Pasta", quantity: "plenty" },
  { name: "Bacon", quantity: "some" },
  { name: "Rice", quantity: "some" },
  { name: "Butter", quantity: "enough" },
  { name: "Milk", quantity: "low" },
  { name: "Parmesan", quantity: "critical" },
  { name: "Egg", quantity: "critical" },
];

const SARAH_STAPLES = ["Salt", "Black pepper", "Olive oil"];

const CARBONARA = {
  name: "Pasta Carbonara",
  anchor_ingredients: ["Pasta", "Bacon", "Eggs", "Parmesan"],
  staples_used: ["Black pepper", "Salt"],
};

const REQUIRED_FOR_PROGRESSION = ["Eggs", "Parmesan"];
```

---

## Success Metrics

| Metric                             | Target         |
| ---------------------------------- | -------------- |
| Onboarding completion rate         | >80%           |
| Time to complete                   | <2 minutes     |
| Voice input success rate (Scene 4) | >85% first try |
| Drop-off at Scene 4 (voice)        | <15%           |

---

## Unresolved Questions

1. **What happens after "Get started" (Scene 7)?** Scene 7 redirects to `/recipes`. Does user still need to set up their own inventory separately, or is that handled within the recipes page?

2. **Auth requirement for voice API?** Scene 4 uses LLM extraction via `/api/onboarding/process-voice` which requires auth. Should unauthenticated users see this flow? Or is auth required before entering onboarding?

3. **Text fallback for Scene 4?** Current implementation has "Prefer to type instead?" when mic unavailable. Spec only mentions voice. Include text fallback?

4. **Fuzzy matching for "eggs"/"parmesan"?** How strict is required-item matching? Accept "egg", "parm", "parmesan cheese"? Current LLM normalizes to singular form.

5. **Back navigation between scenes?** Can user go back? Or forward-only linear flow?

6. **Skip option?** Can user skip the simulation entirely?

7. **Scene transitions/animations?** Current onboarding uses sliding transitions. Any preference for this flow? Fade? Slide? None?

8. **Quantity words vs numeric levels?** Demo uses "some"/"plenty"/"low" but current DB uses numeric `quantity_level` (1-5). Is this display-only mapping or new concept?

9. **New items default quantity?** When user adds eggs/parmesan via voice, they show as "plenty"/"some". What determines the quantity label for user-added items?

10. **Does this replace or precede the current onboarding?** Is this "Part 1" of a two-part flow (simulation → real setup)? Or full replacement?

11. **Where does this live in the route structure?** Same `/app/onboarding` route? New route like `/onboarding/intro`?

12. **Scene 2 + 5 recipe card component** — reuse existing `OnboardingRecipeCard` or new component matching the wireframe style?

13. **Mobile: Scene 4 voice button size/placement?** Current `VoiceTextInput` is bottom-anchored. Same pattern here?
