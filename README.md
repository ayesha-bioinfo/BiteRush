
<img width="1349" height="627" alt="image" src="https://github.com/user-attachments/assets/cf927d93-b7b5-4dfd-8954-5d3f04d11376" />


# 🍔 BiteRush — Full-Stack Food Delivery Web Application

BiteRush is a modern full-stack food delivery web application that allows users to discover restaurants, explore menus, add food items to a cart, apply promotional offers, securely create accounts, place orders, and track their order history.

The project demonstrates a complete frontend-to-backend workflow using **React, Node.js, Express.js, PostgreSQL, Neon, REST APIs, JWT authentication, and Context API**.

---

## ✨ Features

### 🏠 Modern Food Discovery
- Responsive food-delivery homepage
- Featured restaurants
- Cuisine categories
- Restaurant and dish search
- Search by restaurant, cuisine, or menu item
- Real food photography and responsive layouts

### 🍽️ Restaurant & Menu System
- Browse available restaurants
- View restaurant information
- Restaurant-specific menus
- Menu categories and food descriptions
- Delivery time, rating, and delivery-fee information
- Add menu items directly to cart

### 🛒 Shopping Cart
- Add and remove food items
- Increase or decrease quantities
- Real-time cart count
- Dynamic subtotal calculation
- Delivery and service-fee calculation
- Food images maintained through the ordering flow
- Handles switching between restaurants

### 🎟️ Offers & Promo Codes
- Active offers loaded from the backend
- Percentage discounts
- Fixed discounts
- Free-delivery promotions
- Minimum-order validation
- Copy promo-code functionality
- Promo validation during checkout

### 💳 Checkout
- Delivery information form
- Delivery method selection
- Payment preference
- Dynamic order summary
- Backend-verified pricing
- Final order creation

### 🔐 Authentication
- User registration
- Secure login
- JWT-based authentication
- Password hashing
- Persistent authentication state
- Protected user-specific routes

### 📦 Orders
- User-specific order history
- Order details
- Order totals
- Delivery information
- Order status
- Visual order progress tracker

### 🚚 Order Tracking
Orders can visually progress through:

`Confirmed → Preparing → On the Way → Delivered`

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- React Router
- Context API
- JavaScript
- CSS
- Lucide React Icons

### Backend

- Node.js
- Express.js
- REST APIs
- JWT authentication
- Password hashing

### Database

- PostgreSQL
- Neon cloud PostgreSQL

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Postman / PowerShell REST testing
- Neon SQL Editor

---

## 🏗️ Application Architecture

BiteRush follows a client-server architecture:

```text
                USER
                  │
                  ▼
            React Frontend
                  │
                  │ HTTP / Fetch
                  ▼
              REST API
                  │
                  ▼
         Node.js + Express
                  │
            Authentication
            Business Logic
                  │
                  ▼
             PostgreSQL
                  │
                  ▼
          Neon Cloud Database
```

The React frontend never communicates directly with PostgreSQL.

Instead:

```text
React
   ↓
HTTP Request
   ↓
Express REST API
   ↓
Validation / Authentication
   ↓
PostgreSQL Query
   ↓
Neon Database
   ↓
Express Response
   ↓
React UI Update
```

---

## 🔐 Authentication Workflow

BiteRush uses JWT-based authentication.

```text
User enters credentials
        ↓
React sends login request
        ↓
Express receives request
        ↓
Password is verified
        ↓
JWT token is generated
        ↓
Token returned to frontend
        ↓
Frontend stores authentication state
        ↓
Protected requests include:

Authorization: Bearer <token>
        ↓
Backend verifies token
        ↓
Authenticated user ID becomes available
```

This allows BiteRush to associate orders with the correct user.

---

## 📦 Order Workflow

When a customer places an order:

```text
Restaurant
    ↓
Select Menu Item
    ↓
Add to Cart
    ↓
Cart Context
    ↓
Checkout
    ↓
Delivery Information
    ↓
Payment Preference
    ↓
POST /api/orders
    ↓
Authentication Verification
    ↓
Backend Validates Order
    ↓
Order Stored in PostgreSQL
    ↓
Order Confirmation
    ↓
Order History
```

Orders are associated with authenticated users so each customer receives their own order history.

---

## 🗄️ Database

BiteRush uses PostgreSQL hosted through Neon.

The database stores application information such as:

- Users
- Restaurants
- Menu items
- Offers
- Orders
- Order items

A simplified relationship is:

```text
USERS
  │
  └──── ORDERS
           │
           └──── ORDER ITEMS

RESTAURANTS
  │
  ├──── MENU ITEMS
  │
  └──── OFFERS
```

---

## 🌐 REST API

The frontend communicates with the backend through REST API endpoints.

Examples include:

```text
Authentication
POST   /api/auth/register
POST   /api/auth/login

Restaurants
GET    /api/restaurants
GET    /api/restaurants/:id
GET    /api/restaurants/:id/menu

Offers
GET    /api/offers

Orders
POST   /api/orders
GET    /api/orders
```

Protected endpoints require a valid JWT.

---

## 📁 Project Structure

```text
BiteRush/
│
├── public/
│
├── src/
│   ├── assets/
│   │   └── food/
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Restaurants.jsx
│   │   ├── RestaurantDetails.jsx
│   │   ├── Offers.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Orders.jsx
│   │   ├── SignIn.jsx
│   │   └── SignUp.jsx
│   │
│   └── main.jsx
│
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
├── package.json
└── README.md
```

> `.env` is excluded from Git and must never be committed because it contains private credentials and secrets.

---

## ⚙️ Running BiteRush Locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd BiteRush
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create:

```text
server/.env
```

Add the environment variables required by the backend, for example:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_private_jwt_secret
```

Never commit real credentials to GitHub.

### 5. Start the backend

```bash
cd server
node server.js
```

The API runs locally on:

```text
http://localhost:5000
```

### 6. Start the frontend

Open another terminal from the BiteRush root:

```bash
npm run dev
```

Vite will display the local development address in the terminal.

---

## 🔒 Security Considerations

BiteRush implements several important security practices:

- Passwords are not stored as plain text
- JWT is used for authenticated API requests
- Protected endpoints verify authentication
- Orders are associated with authenticated users
- Database credentials are stored in environment variables
- `.env` files are excluded from Git
- Order pricing is validated by the backend rather than relying only on frontend values

---

## 📱 Responsive Design

The interface is designed for multiple screen sizes, including:

- Desktop
- Laptop
- Tablet
- Mobile

Responsive styling is implemented with CSS media queries.

---

## 🚀 Future Improvements

Possible production-level improvements include:

- Restaurant/admin dashboard
- Real-time order status updates
- Live delivery tracking
- Online payment gateway integration
- Email verification
- Forgot-password workflow
- Restaurant reviews
- Favorites
- Address management
- Cloud image storage
- Production deployment
- Automated testing

---

## 🎯 Project Purpose

BiteRush was developed as a practical full-stack development project to demonstrate:

- Frontend development with React
- State management with Context API
- Backend development with Node.js and Express
- REST API design
- PostgreSQL database integration
- Cloud database hosting with Neon
- Authentication and authorization
- Full CRUD/data workflows
- Responsive user-interface development
- Git and GitHub version control

---

## 👩‍💻 Developer

**Ayesha Zubair**

Full-Stack Development Project — 2026
