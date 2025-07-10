#!/usr/bin/env sh
set -e

# Start frontend
serve -s frontend/build -l 3000 &
FRONT_PID=$!
echo "Frontend (serve) started → PID $FRONT_PID"

# Start backend
node server.mjs &
BACK_PID=$!
echo "Backend  (node)  started → PID $BACK_PID"

# Graceful shutdown
terminate() {
  echo "Received stop signal – shutting down…"
  kill $BACK_PID $FRONT_PID
  wait $BACK_PID
  wait $FRONT_PID
  echo "All processes stopped."
  exit 0
}
trap terminate INT TERM

# Wait for any process to exit
while kill -0 $FRONT_PID $BACK_PID 2>/dev/null; do
  sleep 1
done

echo "A process exited; stopping the other…"
terminate
