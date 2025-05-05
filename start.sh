echo "🔧 Installing frontend dependencies..."
cd socket-chat-frontend && npm install

echo "⚙️ Building React app..."
npm run build

echo "🧹 Removing old build from backend..."
rm -rf ../socket-chat-backend/build

echo "📦 Moving new build to backend..."
cp -r build ../socket-chat-backend/build

echo "🔧 Installing backend dependencies..."
cd ../socket-chat-backend && npm install

echo "🚀 Starting server..."
node server.js
