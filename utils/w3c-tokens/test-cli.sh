#!/bin/bash

# Test the CLI validator with various scenarios

echo "🧪 Testing W3C Design Tokens Validator CLI"
echo "=========================================="
echo ""

# Create test files
cat > /tmp/test-valid.json << 'EOF'
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.2, 0.4, 0.8]
      }
    }
  }
}
EOF

cat > /tmp/test-invalid-colorspace.json << 'EOF'
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": {
        "colorSpace": "invalid-space",
        "components": [1, 0, 0]
      }
    }
  }
}
EOF

cat > /tmp/test-invalid-unit.json << 'EOF'
{
  "spacing": {
    "small": {
      "$type": "dimension",
      "$value": {
        "value": 8,
        "unit": "em"
      }
    }
  }
}
EOF

cat > /tmp/test-circular.json << 'EOF'
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": "{color.primary}"
    }
  }
}
EOF

# Test valid file
echo "1. Testing valid tokens:"
node w3c-validator.mjs /tmp/test-valid.json
VALID_EXIT=$?

echo ""
echo "2. Testing invalid colorSpace:"
node w3c-validator.mjs /tmp/test-invalid-colorspace.json
INVALID_COLORSPACE_EXIT=$?

echo ""
echo "3. Testing invalid dimension unit:"
node w3c-validator.mjs /tmp/test-invalid-unit.json
INVALID_UNIT_EXIT=$?

echo ""
echo "4. Testing circular reference:"
node w3c-validator.mjs /tmp/test-circular.json
CIRCULAR_EXIT=$?

echo ""
echo "=========================================="
echo "Test Summary:"
echo "  Valid tokens: $([ $VALID_EXIT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "  Invalid colorSpace: $([ $INVALID_COLORSPACE_EXIT -ne 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "  Invalid unit: $([ $INVALID_UNIT_EXIT -ne 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "  Circular reference: $([ $CIRCULAR_EXIT -ne 0 ] && echo '✅ PASS' || echo '❌ FAIL')"

# Cleanup
rm -f /tmp/test-*.json

# Exit with error if any test failed
if [ $VALID_EXIT -ne 0 ] || [ $INVALID_COLORSPACE_EXIT -eq 0 ] || [ $INVALID_UNIT_EXIT -eq 0 ] || [ $CIRCULAR_EXIT -eq 0 ]; then
  exit 1
fi

exit 0

