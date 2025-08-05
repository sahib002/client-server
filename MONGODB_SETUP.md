# MongoDB Setup Instructions

## Option 1: Install MongoDB locally (Recommended)

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB following the installer instructions
3. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - Or manually: `mongod --dbpath "C:\data\db"`

## Option 2: Use MongoDB Atlas (Cloud)

1. Go to https://cloud.mongodb.com/
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace the connection string in server/index.js:
   ```javascript
   mongoose.connect("your-mongodb-atlas-connection-string", {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   });
   ```

## Create the database

The app will automatically create the `taskfast` database when you first run it.

## Test the connection

1. Start the server: `npm run dev` (in the server directory)
2. You should see: "MongoDB Connected to taskfast database"
