#!/bin/bash

# ETF Nexo - Design System Validation
# Checks for hardcoded values in components

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "🔍 ETF Nexo Design System Governance Validator"
echo "================================================"
echo ""

# Function to check for violations
check_violations() {
  local pattern=$1
  local message=$2
  local paths=$3

  echo -n "Checking: $message... "

  results=$(grep -r -n "$pattern" $paths 2>/dev/null || true)

  if [ -n "$results" ]; then
    echo -e "${RED}FAILED${NC}"
    echo "$results"
    echo ""
    ((ERRORS++))
  else
    echo -e "${GREEN}PASSED${NC}"
  fi
}

# Check for hardcoded hex colors
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 Checking for hardcoded colors..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_violations "bg-\[#[0-9A-Fa-f]" "Hardcoded background colors (bg-[#...])" "components/ app/"
check_violations "text-\[#[0-9A-Fa-f]" "Hardcoded text colors (text-[#...])" "components/ app/"
check_violations "border-\[#[0-9A-Fa-f]" "Hardcoded border colors (border-[#...])" "components/ app/"
check_violations "color: ['\"]#[0-9A-Fa-f]" "Inline hex colors (color: '#...')" "components/ app/"
check_violations "backgroundColor: ['\"]#[0-9A-Fa-f]" "Inline background colors (backgroundColor: '#...')" "components/ app/"

echo ""

# Check for hardcoded font sizes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Checking for hardcoded typography..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_violations "text-\[[0-9]" "Hardcoded text sizes (text-[16px])" "components/ app/"
check_violations "fontSize: ['\"][0-9]" "Inline font sizes (fontSize: '16px')" "components/ app/"
check_violations "font-\[[0-9]" "Hardcoded font weights (font-[500])" "components/ app/"

echo ""

# Check for hardcoded spacing
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📏 Checking for hardcoded spacing..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_violations "p-\[[0-9]" "Hardcoded padding (p-[16px])" "components/ app/"
check_violations "m-\[[0-9]" "Hardcoded margin (m-[16px])" "components/ app/"
check_violations "gap-\[[0-9]" "Hardcoded gap (gap-[12px])" "components/ app/"
check_violations "padding: ['\"][0-9]" "Inline padding (padding: '16px')" "components/ app/"
check_violations "margin: ['\"][0-9]" "Inline margin (margin: '16px')" "components/ app/"

echo ""

# Summary
echo "================================================"
echo "VALIDATION SUMMARY"
echo "================================================"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Design system compliance: 100%${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Found $ERRORS violation(s)${NC}"
  echo ""
  echo "Please fix the violations above by:"
  echo "  1. Using Tailwind classes instead of hardcoded values"
  echo "  2. Using theme.config.ts for programmatic values"
  echo "  3. Referencing .claude/rules/design-governance.md"
  echo ""
  exit 1
fi
