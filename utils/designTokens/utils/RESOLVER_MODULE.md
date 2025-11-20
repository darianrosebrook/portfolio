# Design Tokens Resolver Module Implementation

This directory contains the implementation of the W3C Design Tokens Community Group (DTCG) Resolver Module 2025.10 specification.

## Overview

The Resolver Module provides a standardized way to manage design tokens across multiple contexts (themes, platforms, brands, etc.) while avoiding combinatorial explosion. It follows the [official specification](https://www.designtokens.org/tr/2025.10/resolver/).

## Files

- `resolver-module.ts` - Core Resolver class implementing the specification
- `resolver-integration.ts` - Integration layer for backward compatibility
- `resolver.schema.json` - JSON schema for validating resolver documents
- `resolver.example.json` - Example resolver document structure

## Key Features

### 1. Sets

Collections of design tokens that can be referenced and reused:

```json
{
  "sets": {
    "foundation": {
      "sources": [
        { "$ref": "core/color.tokens.json" },
        { "$ref": "core/typography.tokens.json" }
      ]
    }
  }
}
```

### 2. Modifiers

Define contexts for different values (themes, platforms, etc.):

```json
{
  "modifiers": {
    "theme": {
      "contexts": {
        "light": {
          "sources": [{ "$ref": "#/sets/foundation" }]
        },
        "dark": {
          "sources": [
            { "$ref": "#/sets/foundation" },
            { "$ref": "theme/dark.tokens.json" }
          ]
        }
      }
    }
  }
}
```

### 3. Resolution Order

Defines the order in which sets and modifiers are applied:

```json
{
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/modifiers/theme" }
  ]
}
```

## Usage

### Basic Usage

```typescript
import { Resolver, loadResolverDocument } from './resolver-module';

// Load resolver document
const doc = loadResolverDocument('./resolver.json');

// Create resolver instance
const resolver = new Resolver(doc, {
  basePath: './tokens',
  onWarn: (d) => console.warn(d.message),
  onError: (d) => console.error(d.message),
});

// Resolve tokens for specific input
const result = resolver.resolve({
  theme: 'dark',
  brand: 'brandA',
});

// Access resolved tokens
console.log(result.tokens);
```

### Integration with Existing Code

The integration layer provides backward compatibility:

```typescript
import { resolveWithResolverModule } from './resolver-integration';

// Try to use resolver module, fall back to legacy if not available
const tokens = resolveWithResolverModule(
  legacyTokens,
  config,
  './resolver.json'
);
```

## Migration Path

### Step 1: Create Resolver Document

Create a `resolver.json` file following the example structure:

```json
{
  "version": "2025-10-01",
  "sets": {
    "foundation": {
      "sources": [{ "$ref": "core/color.tokens.json" }]
    }
  },
  "modifiers": {
    "theme": {
      "contexts": {
        "light": { "sources": [{ "$ref": "#/sets/foundation" }] },
        "dark": { "sources": [{ "$ref": "#/sets/foundation" }] }
      }
    }
  },
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/modifiers/theme" }
  ]
}
```

### Step 2: Update Generators

Update token generators to use the resolver module:

```typescript
import { createResolver } from './resolver-integration';

const resolver = createResolver('./resolver.json', config);
if (resolver) {
  const result = resolver.resolve({ theme: 'dark' });
  // Use result.tokens
}
```

### Step 3: Gradual Migration

You can migrate gradually:

- Keep existing token files working
- Create resolver documents for new contexts
- Update generators to prefer resolver module when available
- Migrate existing contexts over time

## Reference Syntax

The resolver module supports JSON Pointer syntax for references:

- `#/sets/foundation` - Reference to a set in the same document
- `#/modifiers/theme` - Reference to a modifier in the same document
- `core/color.tokens.json` - Reference to an external file
- `#/$defs/colors` - Reference to bundled definitions

## Benefits

1. **Standardized**: Follows W3C specification for interoperability
2. **Composable**: Sets can be reused across multiple contexts
3. **Maintainable**: Clear separation of concerns (sets vs modifiers)
4. **Extensible**: Easy to add new contexts without duplication
5. **Tool-Compatible**: Works with any DTCG 1.0 compliant tooling

## Compliance

This implementation follows the DTCG 1.0 Resolver Module specification:

- ✅ Input validation
- ✅ Resolution ordering
- ✅ Set and modifier resolution
- ✅ JSON Pointer reference support
- ✅ Alias resolution
- ✅ Conflict resolution (later values override earlier ones)
- ✅ Error handling and diagnostics

## See Also

- [Resolver Module Specification](https://www.designtokens.org/tr/2025.10/resolver/)
- [Format Module Specification](https://www.designtokens.org/tr/2025.10/format/)
- [Design Tokens Schema](./designTokens.schema.json)
