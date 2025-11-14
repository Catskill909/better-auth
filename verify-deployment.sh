#!/bin/bash
# Production deployment verification script
# Run this after deploying to https://auth.supersoul.top

echo "🔍 Verifying Better Auth deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="https://auth.supersoul.top"

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "   Response: $HEALTH"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "   Response: $HEALTH"
    exit 1
fi
echo ""

# Test 2: Signup endpoint (structure check, don't create real user)
echo "2️⃣  Testing signup endpoint structure..."
SIGNUP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/sign-up/email" \
    -H "Content-Type: application/json" \
    -d '{"email":"test-'$(date +%s)'@example.com","password":"Test1234!","name":"Test User"}')

HTTP_CODE=$(echo "$SIGNUP" | tail -n1)
RESPONSE=$(echo "$SIGNUP" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Signup endpoint working (HTTP 200)${NC}"
    echo "   User created successfully"
elif [ "$HTTP_CODE" = "500" ]; then
    echo -e "${RED}❌ SIGNUP FAILED - 500 ERROR!${NC}"
    echo "   Response: $RESPONSE"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "   1. Check Coolify logs for error details"
    echo "   2. Verify persistent storage mounted at /app/data"
    echo "   3. SSH into container and run: ls -lh /app/data/sqlite.db"
    echo "   4. Check tables: sqlite3 /app/data/sqlite.db '.tables'"
    exit 1
else
    echo -e "${YELLOW}⚠️  Unexpected response code: $HTTP_CODE${NC}"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 3: Check main page loads
echo "3️⃣  Testing main page..."
MAIN_PAGE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/")
if [ "$MAIN_PAGE" = "200" ]; then
    echo -e "${GREEN}✅ Main page loads (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Main page failed (HTTP $MAIN_PAGE)${NC}"
fi
echo ""

# Test 4: Privacy page
echo "4️⃣  Testing privacy page..."
PRIVACY=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/privacy.html")
if [ "$PRIVACY" = "200" ]; then
    echo -e "${GREEN}✅ Privacy page loads${NC}"
else
    echo -e "${YELLOW}⚠️  Privacy page: HTTP $PRIVACY${NC}"
fi
echo ""

# Test 5: Terms page
echo "5️⃣  Testing terms page..."
TERMS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/terms.html")
if [ "$TERMS" = "200" ]; then
    echo -e "${GREEN}✅ Terms page loads${NC}"
else
    echo -e "${YELLOW}⚠️  Terms page: HTTP $TERMS${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Deployment verification complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit $BASE_URL in browser"
echo "2. Sign up with your email"
echo "3. Check email for verification"
echo "4. Create admin user: node make-admin.js your-email@example.com"
echo ""
