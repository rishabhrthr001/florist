````
🌸 Mangalam — Luxury Florist Web Platform

Mangalam is a full-stack e-commerce platform for premium floral arrangements and gifting experiences.
It supports curated bouquets, custom bouquet builders, real-time admin order tracking, seasonal collections, and personalized gifting — built with scalability and performance in mind.

✨ Features
🛍 Customer Experience
Browse products by category
Seasonal highlights & hot picks
Custom bouquet builder
Gift orders with custom messages
Shopping cart with live price updates
Checkout flow with COD / Online options
Order history with real-time status updates
Responsive luxury UI

🧑‍💼 Admin Dashboard
Secure admin authentication
Real-time incoming orders (Socket.IO)
Order status management
Product & category management
Seasonal / Hot Picks curation
Customer listing
Messages panel
Analytics dashboard (extendable)

⚡ Real-Time Updates
New orders instantly appear in admin panel
Order status updates push to customers live

Socket rooms for:
admin
user:<id>

🏗 Tech Stack
Frontend
React + TypeScript
Tailwind CSS
Framer Motion
Axios
Socket.IO Client
React Router
Zustand / Context API
Lucide Icons

Backend
Node.js + Express
MongoDB + Mongoose
JWT Authentication
Socket.IO
Cloudinary (images)
Multer
Slugify
dotenv


🚀 Getting Started
1️⃣ Clone Repository
```
git clone https://github.com/yourusername/mangalam.git
cd mangalam
```

🔧 Backend Setup
```
cd backend
npm install
```


Run backend:
```
npm run dev
```

🎨 Frontend Setup
```
cd frontend
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:3000
```

🔌 Socket.IO Flow
Server Rooms
Role Room
Admin admin
User user:<id>
Events

new-order
order-updated


Supports hybrid carts:
Normal products
Custom arrangements
🔐 Authentication
JWT stored in localStorage
Axios interceptor adds token
Protected admin routes
Role-based middleware


🧪 Development Notes

Tailwind responsive luxury UI
Animations via Framer Motion
Socket connections authenticated via JWT
Optimized order ID generation with counters
MongoDB indexed fields for performance

👑 Author

Rishabh Rathore
Full-Stack / Web3 Developer

````
