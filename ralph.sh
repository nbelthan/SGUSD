#!/bin/bash

# Ralph Wiggum Autonomous Development Loop — SageBridge
# =====================================================
# This script runs Claude Code in a continuous loop, each iteration with a fresh
# context window. It reads PROMPT.md and feeds it to Claude until all tasks are
# complete or max iterations is reached.
#
# Usage: ./ralph.sh <max_iterations> [retry_delay_min] [max_retries]
# Example: ./ralph.sh 20
# Example: ./ralph.sh 50 30 4   (50 iters, 30min retry delay, 4 retries on rate limit)
#
# 5-HOUR WINDOW FALLBACK:
# Claude usage resets every 5 hours. If short retries are exhausted the script
# automatically waits the full 5-hour window before resuming.

set -e

# Ensure claude is on PATH (installed to ~/.local/bin)
export PATH="/Users/neetabelthan/.local/bin:$PATH"

# Kill all child processes on Ctrl+C only (not on normal exit)
trap 'kill 0; exit 1' INT TERM

# Verify claude is accessible before starting
if ! command -v claude &>/dev/null; then
    echo "Error: 'claude' not found in PATH. Run 'which claude' to locate it and update PATH above."
    exit 1
fi

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check for required argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: Missing required argument${NC}"
    echo ""
    echo "Usage: $0 <max_iterations> [retry_delay_min] [max_retries]"
    echo "Example: $0 20"
    echo "Example: $0 50 30 4"
    exit 1
fi

MAX_ITERATIONS=$1
RETRY_DELAY_MIN=${2:-30}
MAX_RETRIES=${3:-4}
RETRY_DELAY_SEC=$((RETRY_DELAY_MIN * 60))
FIVE_HOUR_SEC=$((5 * 60 * 60))
CONSECUTIVE_FAILURES=0
RATE_LIMIT_HITS=0

# Verify required files exist
if [ ! -f "PROMPT.md" ]; then
    echo -e "${RED}Error: PROMPT.md not found${NC}"
    exit 1
fi

if [ ! -f "features.json" ]; then
    echo -e "${RED}Error: features.json not found${NC}"
    exit 1
fi

if [ ! -f "activity.md" ]; then
    echo -e "${YELLOW}Warning: activity.md not found, creating it...${NC}"
    cat > activity.md << 'EOF'
# SageBridge — Activity Log

## Current Status
**Last Updated:** Not started
**Tasks Completed:** 0 / 35
**Current Task:** None

---

## Session Log

<!-- Agent will append dated entries here -->
EOF
fi

mkdir -p logs

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   Ralph Wiggum Autonomous Loop${NC}"
echo -e "${BLUE}   SageBridge — SGUSD Demo${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Max iterations:    ${GREEN}$MAX_ITERATIONS${NC}"
echo -e "Retry delay:       ${GREEN}${RETRY_DELAY_MIN}min${NC}"
echo -e "Max retries:       ${GREEN}$MAX_RETRIES${NC}"
echo -e "5h window fallback:${GREEN}enabled (triggers after $MAX_RETRIES rate-limit hits)${NC}"
echo -e "Completion signal: ${GREEN}<promise>COMPLETE</promise>${NC}"
echo ""
echo -e "${YELLOW}Starting in 3 seconds... Press Ctrl+C to abort${NC}"
sleep 3
echo ""

# ─── countdown timer ──────────────────────────────────────────────────────────
countdown() {
    local total=$1
    local label=$2
    local remaining=$total
    while [ $remaining -gt 0 ]; do
        local hrs=$(( remaining / 3600 ))
        local mins=$(( (remaining % 3600) / 60 ))
        local secs=$(( remaining % 60 ))
        printf "\r  ⏳ %s — %02d:%02d:%02d remaining... " "$label" $hrs $mins $secs
        sleep 10
        remaining=$((remaining - 10))
    done
    printf "\r  ✓ %s — resuming now!                              \n" "$label"
    echo ""
}

# Main loop
for ((i=1; i<=MAX_ITERATIONS; i++)); do
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}   Iteration $i of $MAX_ITERATIONS${NC}"
    echo -e "${BLUE}   $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""

    # Show feature progress
    python3 -c "
import json
d = json.load(open('features.json'))
total = len(d['features'])
done = sum(1 for f in d['features'] if f['done'])
pct = int(done/total*100) if total > 0 else 0
bar = '█' * (pct // 5) + '░' * (20 - pct // 5)
print(f'  [{bar}] {done}/{total} features ({pct}%)')
" 2>/dev/null || true

    echo ""
    echo -e "${YELLOW}Running Claude...${NC}"
    echo ""

    # Capture to variable — tee/pipe causes claude to exit silently (non-TTY detection).
    LOGFILE="logs/iteration_${i}.log"

    # Start heartbeat in background (prints a dot every 30s so terminal looks alive)
    ( trap '' INT; while true; do sleep 30; printf "."; done ) &
    HEARTBEAT_PID=$!

    set +e
    result=$(claude -p "$(cat PROMPT.md)" --output-format text 2>&1)
    EXIT_CODE=$?
    set -e

    # Stop heartbeat (no wait — avoids hang on Ctrl+C)
    kill $HEARTBEAT_PID 2>/dev/null || true
    echo ""  # newline after dots

    echo "$result"
    echo "$result" > "$LOGFILE"
    echo ""

    if [ -z "$result" ]; then
        echo -e "${RED}✗ Claude produced no output (exit code: $EXIT_CODE).${NC}"
        echo -e "${RED}  Check: claude --version and authentication.${NC}"
    fi

    # ── Completion check ──────────────────────────────────────────────────────
    if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
        echo ""
        echo -e "${GREEN}======================================${NC}"
        echo -e "${GREEN}     ALL TASKS COMPLETE!${NC}"
        echo -e "${GREEN}======================================${NC}"
        echo ""
        echo -e "Finished after ${GREEN}$i${NC} iteration(s)"
        echo ""
        echo "Next steps:"
        echo "  1. Review the completed work in your project"
        echo "  2. Check activity.md for the full build log"
        echo "  3. Run npm run build to verify final state"
        echo "  4. Deploy the Sagecoin contract to Base Sepolia if not already done"
        echo "  5. Set NEXT_PUBLIC_SAGECOIN_ADDRESS in .env.local"
        echo ""
        exit 0
    fi

    # Save to temp for debugging
    echo "$result" > "/tmp/ralph_last_output.txt"

    # ── Rate limit detection (two-stage) ─────────────────────────────────────
    is_rate_limited=false

    # Stage 1: Exact CLI rate-limit phrases
    if echo "$result" | grep -qiE "You've hit your limit|hit your limit.*resets|resets [0-9]+.*(am|pm)|usage limit reached|Max usage reached|billing limit|You have reached your|currently at capacity|overloaded_error"; then
        is_rate_limited=true
    fi

    # Stage 2: Broader patterns on non-code lines only
    if [ "$is_rate_limited" = false ]; then
        if echo "$result" | grep -viE '^\s{4,}|^\s*#|^\s*"|^\s*'"'"'|def |class |import |print\(|return |if .*:|except|raise|logging\.|\.get\(|\.post\(|\.json|headers|response|retry|sleep|async |await |```' | grep -qiE "rate.?limit.*(error|exceeded|hit|reached|wait)|too many requests|quota.*(exceeded|reached)|Request was throttled|APIStatusError.*rate"; then
            is_rate_limited=true
        fi
    fi

    if [ "$is_rate_limited" = true ]; then
        CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
        RATE_LIMIT_HITS=$((RATE_LIMIT_HITS + 1))
        echo -e "${RED}🚫 Rate limit detected (attempt $CONSECUTIVE_FAILURES / $MAX_RETRIES)${NC}"

        # ── 5-HOUR WINDOW FALLBACK ────────────────────────────────────────────
        if [ $CONSECUTIVE_FAILURES -ge $MAX_RETRIES ]; then
            echo ""
            echo -e "${CYAN}══════════════════════════════════════════${NC}"
            echo -e "${CYAN}  5-HOUR WINDOW FALLBACK TRIGGERED${NC}"
            echo -e "${CYAN}  Short retries ($MAX_RETRIES) exhausted.${NC}"
            echo -e "${CYAN}  Waiting 5 hours for quota window reset.${NC}"
            echo -e "${CYAN}══════════════════════════════════════════${NC}"
            echo ""
            echo -e "  Rate limit hits so far: ${YELLOW}$RATE_LIMIT_HITS${NC}"
            echo -e "  Window started at:      ${YELLOW}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
            echo -e "  Expected resume at:     ${YELLOW}$(date -v+5H '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date --date='+5 hours' '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo 'in 5 hours')${NC}"
            echo ""
            countdown $FIVE_HOUR_SEC "5-hour window"
            CONSECUTIVE_FAILURES=0
            i=$((i - 1))
            continue
        fi

        # Short retry
        echo -e "${YELLOW}⏸  Waiting ${RETRY_DELAY_MIN} minutes for rate limit to ease...${NC}"
        countdown $RETRY_DELAY_SEC "${RETRY_DELAY_MIN}-min retry"
        i=$((i - 1))
        continue
    fi

    # ── Non-rate-limit failure ────────────────────────────────────────────────
    if [ $EXIT_CODE -ne 0 ]; then
        # Short output with limit-like keywords → likely undetected rate limit
        word_count=$(echo "$result" | wc -w)
        if [ "$word_count" -lt 30 ] && echo "$result" | grep -qiE "limit|resets|capacity|hit.*your"; then
            echo -e "${YELLOW}⚠ Possible undetected rate limit (short output). Treating as rate limit.${NC}"
            CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
            RATE_LIMIT_HITS=$((RATE_LIMIT_HITS + 1))
            if [ $CONSECUTIVE_FAILURES -ge $MAX_RETRIES ]; then
                echo -e "${CYAN}  5-HOUR WINDOW FALLBACK TRIGGERED${NC}"
                countdown $FIVE_HOUR_SEC "5-hour window"
                CONSECUTIVE_FAILURES=0
            else
                echo -e "${YELLOW}⏸  Waiting ${RETRY_DELAY_MIN} minutes...${NC}"
                countdown $RETRY_DELAY_SEC "${RETRY_DELAY_MIN}-min retry"
            fi
            i=$((i - 1))
            continue
        fi

        CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
        echo -e "${YELLOW}⚠ Non-rate-limit failure (consecutive: $CONSECUTIVE_FAILURES)${NC}"

        if [ $CONSECUTIVE_FAILURES -ge 5 ]; then
            echo -e "${RED}5 consecutive non-rate-limit failures. Stopping. Check logs/.${NC}"
            break
        fi
        sleep 10
    else
        CONSECUTIVE_FAILURES=0
    fi

    echo ""
    echo -e "${YELLOW}--- End of iteration $i ---${NC}"
    echo ""

    sleep 2
done

echo ""
echo -e "${RED}======================================${NC}"
echo -e "${RED}     MAX ITERATIONS REACHED${NC}"
echo -e "${RED}======================================${NC}"
echo ""
echo -e "Reached max iterations (${RED}$MAX_ITERATIONS${NC}) without completion."
echo ""
echo "Options:"
echo "  1. Run again with more iterations: ./ralph.sh 50"
echo "  2. Check activity.md to see current progress"
echo "  3. Check features.json to see remaining tasks"
echo ""
exit 1
