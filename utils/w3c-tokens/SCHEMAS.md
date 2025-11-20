# Schema Variants

This package includes two schema variants for different use cases:

## Strict Schema (`w3c-schema-strict.json`)

**Default schema** - Strict DTCG 1.0 (2025.10) compliance.

- ✅ **Standard types only**: 13 DTCG 1.0 standard types
- ✅ **Structured values required**: DTCG 1.0 structured format (colorSpace + components, value + unit, etc.)
- ✅ **No custom types**: Only standard types allowed
- ✅ **Best for**: Generic validation, tooling, interoperability

**Token Types:**
- `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `border`, `transition`, `shadow`, `gradient`, `typography`, `strokeStyle`

**Example:**
```json
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [1, 0, 0]
      }
    }
  }
}
```

## Permissive Schema (`w3c-schema-permissive.json`)

**Extended schema** - DTCG 1.0 (2025.10) with custom extensions.

- ✅ **Custom types included**: 22 types total (13 standard + 9 custom)
- ✅ **Flexible values**: Supports both string formats (`#hex`, `16px`) and structured formats
- ✅ **Custom extensions**: Includes opacity, spacing, radius, elevation, motion, layout, interaction, string, keyframes
- ✅ **Best for**: Repository-specific validation, legacy token migration, custom design systems

**Token Types:**
- Standard: `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `border`, `transition`, `shadow`, `gradient`, `typography`, `strokeStyle`
- Custom: `opacity`, `spacing`, `radius`, `elevation`, `motion`, `layout`, `interaction`, `string`, `keyframes`

**Example:**
```json
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#ff0000"  // String format allowed
    }
  },
  "opacity": {
    "50": {
      "$type": "opacity",
      "$value": 0.5
    }
  }
}
```

## Usage

### Default (Strict)
```typescript
import { validateDesignTokens, setDefaultSchema } from './w3c-validator';
import schema from './w3c-schema-strict.json';

setDefaultSchema(schema);
const result = validateDesignTokens(tokens);
```

### Permissive
```typescript
import { validateDesignTokens, setDefaultSchema } from './w3c-validator';
import schema from './w3c-schema-permissive.json';

setDefaultSchema(schema);
const result = validateDesignTokens(tokens);
```

### CLI (Strict - Default)
```bash
node w3c-validator.mjs tokens.json
```

### CLI (Permissive)
```bash
W3C_SCHEMA=w3c-schema-permissive.json node w3c-validator.mjs tokens.json
```

## Which Should I Use?

- **Use Strict** if:
  - You want maximum interoperability
  - You're building a generic tool
  - You want to enforce DTCG 1.0 compliance
  - You're starting a new project

- **Use Permissive** if:
  - You have existing tokens with custom types
  - You need to support legacy string formats
  - You're migrating gradually to DTCG 1.0
  - You have repository-specific requirements

## Migration Path

If you're using the permissive schema and want to migrate to strict:

1. Convert string colors to structured:
   ```json
   // Permissive
   "$value": "#ff0000"
   
   // Strict
   "$value": {
     "colorSpace": "srgb",
     "components": [1, 0, 0]
   }
   ```

2. Convert string dimensions to structured:
   ```json
   // Permissive
   "$value": "16px"
   
   // Strict
   "$value": {
     "value": 16,
     "unit": "px"
   }
   ```

3. Map custom types to standard:
   - `opacity` → `number`
   - `borderRadius` → `dimension`
   - `borderWidth` → `dimension`
   - `borderStyle` → `strokeStyle`

