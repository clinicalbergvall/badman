# Clean Cloak - Complete Setup G

Your backend has been successfully created with all the necessary files and dependencies installed.



```
backend/
├── models/
│   ├── User.js              # User authentication model
│   ├── Booking.js           # Booking management model
│   └── CleanerProfile.js    # Cleaner profile model
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── bookings.js          # Booking management endpoints
│   ├── cleaners.js          # Cleaner profile endpoints
│   └── users.js             # User profile endpoints
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── server.js                # Main Express server
├── package.json             # Dependencies
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # Backend documentation
```

## 🚀 Next Steps to Run the Backend

### Step 1: Install MongoDB

**Option A: Local MongoDB (Recommended for development)**
1. Download MongoDB from: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`


1. Go to: https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection strin

1. Navigate to backend folder:
```bash
cd backend
```

2. Copy the example environment file:
```bash
copy .env.example .env
```

3. Edit `.env` file with your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clean-cloak
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

 Change `JWT_SECRET` to a random secure string!



**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on: **http://localhost:5000**



Open your browser or use curl:
```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Clean Cloak API is running",
  "timestamp": "2025-11-12T..."
}
```

## 📡 API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/rating` - Rate booking
- `DELETE /api/bookings/:id` - Cancel booking

### Cleaners
- `POST /api/cleaners/profile` - Create cleaner profile
- `GET /api/cleaners/profile` - Get own profile
- `PUT /api/cleaners/profile` - Update profile
- `GET /api/cleaners` - Get all cleaners
- `GET /api/cleaners/:id` - Get single cleaner

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🔐 Authentication Flow

1. **Register:** `POST /api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0712345678",
  "password": "password123",
  "role": "client"
}
```

2. **Login:** `POST /api/auth/login`
```json
{
  "phone": "0712345678",
  "password": "password123"
}
```

3. **Use Token:** Include in headers for protected routes
```
Authorization: Bearer <your-token-here>
```

## 🛠️ Testing with Postman

1. Download Postman: https://www.postman.com/downloads/
2. Import the API endpoints
3. Test registration and login
4. Use the token for protected routes

## 📱 Frontend Integration (Next Step)

To connect your React frontend to this backend:

1. Create an API service file
2. Update authentication to use real API
3. Replace localStorage with API calls
4. Add token management

## 🔧 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check MONGODB_URI in .env file
- For Atlas, check your IP whitelist

**Port Already in Use:**
- Change PORT in .env file
- Or stop the process using port 5000

**Dependencies Error:**
- Run `npm install` again in backend folder

## 📚 Additional Resources

- Express.js Docs: https://expressjs.com/
- MongoDB Docs: https://docs.mongodb.com/
- JWT: https://jwt.io/
- Mongoose: https://mongoosejs.com/

## 🎉 You're Ready!

Your backend is fully set up and ready to run. Just:
1. Install MongoDB
2. Create .env file
3. Run `npm run dev`
4. Start building! 🚀
