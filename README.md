# Nearby House Rental Finder

A medium-level MERN application for finding rental homes by area and distance. Tenants can search, map, save, and inquire about listings; owners can manage properties and tenant inquiries; admins can manage accounts and listings.

## Features

- Tenant and owner registration and login with JWT authentication
- Property browsing, full-text keyword search, and rent/location/type filters
- Nearby property search by latitude, longitude, and radius
- OpenStreetMap maps powered by Leaflet (no paid map API)
- Tenant favorites and property inquiries
- Owner property creation, editing, availability management, and inquiry status updates
- Admin dashboard statistics and user/property management
- Responsive UI with loading and error feedback
- Image URLs supported for listings (no image-hosting account required)

## Technology Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios, Leaflet, React-Leaflet
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, dotenv, CORS
- Database: MongoDB Atlas (or a local MongoDB instance)

## System Architecture

```text
React + Leaflet
      | Axios / JSON API
Express REST API + JWT middleware
      | Mongoose
MongoDB Atlas
```

## Folder Structure

```text
Nearby-House-Rental-Finder/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## MongoDB Setup

1. Create a free MongoDB Atlas cluster (or install MongoDB locally).
2. In Atlas, create a database user and allow the development machine's IP address in Network Access.
3. Copy the database connection URI from Atlas. Replace the username, password, and database name as needed.
4. Put the URI in `backend/.env` as `MONGO_URI`. Do not commit this file.

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and set values:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Optionally copy `frontend/.env.example` to `frontend/.env` and change `VITE_API_URL` if the API is hosted somewhere other than `http://localhost:5000/api`.

Never place real credentials in source code or share `.env` files.

## Installation

Use two terminals from the project root.

### Backend

```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:5000` by default. Its health check is `http://localhost:5000/api/health`.

Create the initial administrator account using the configured admin environment values:

```bash
npm run create-admin
```

For an optional classroom demo database, insert fictional sample data:

```bash
npm run seed
```

The seed creates one admin, two owners, three tenants, and eight listings across Hyderabad, Bengaluru, Pune, and Chennai. Demo accounts are `admin@example.test` / `AdminPass123`, `ananya.owner@example.test` / `OwnerPass123`, and `aarav.tenant@example.test` / `TenantPass123`. These are public demo credentials: use only in a local demonstration database, never in a deployed environment.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API Endpoints

All API responses use a JSON success envelope (`success`, `message`, `data`) or an error envelope (`success: false`, `message`).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | API/database health |
| POST | `/api/auth/register` | Public | Register tenant or owner |
| POST | `/api/auth/login` | Public | Log in and receive JWT |
| GET | `/api/auth/me` | Authenticated | Current account |
| GET | `/api/properties` | Public | Search/filter available properties |
| GET | `/api/properties/nearby?lat=17.385&lng=78.4867&radius=10` | Public | Search by distance in km |
| GET | `/api/properties/:id` | Public | Property details |
| GET | `/api/properties/my` | Owner | Current owner's listings |
| POST | `/api/properties` | Owner | Create listing |
| PUT | `/api/properties/:id` | Owner | Update own listing |
| DELETE | `/api/properties/:id` | Owner | Delete own listing |
| GET | `/api/favorites` | Tenant | List favorites |
| POST | `/api/favorites/:propertyId` | Tenant | Add favorite |
| DELETE | `/api/favorites/:propertyId` | Tenant | Remove favorite |
| POST | `/api/inquiries` | Tenant | Contact a property's owner |
| GET | `/api/inquiries/my` | Tenant | View sent inquiries |
| GET | `/api/inquiries/owner` | Owner | View received inquiries |
| PUT | `/api/inquiries/:id/status` | Owner | Update inquiry status |
| GET | `/api/admin/stats` | Admin | Dashboard totals |
| GET | `/api/admin/users` | Admin | List accounts |
| DELETE | `/api/admin/users/:id` | Admin | Delete account |
| GET | `/api/admin/properties` | Admin | List property records |
| PUT | `/api/admin/properties/:id` | Admin | Update availability |
| DELETE | `/api/admin/properties/:id` | Admin | Delete property |

Property filters include `city`, `locality`, `minRent`, `maxRent`, `bhk`, `propertyType`, `furnishing`, `available`, and `search` (title, description, city, locality, or address). Nearby accepts `lat`/`lng` or `latitude`/`longitude`, with `radius` in kilometers. Authenticate protected API requests with `Authorization: Bearer <token>`.

## User Roles

- **Tenant:** browse and map properties, favorite listings, and contact owners.
- **Owner:** create and manage listings and respond to inquiries.
- **Admin:** view statistics and manage users and listings. Public registration cannot create an admin account.

## Screenshots

Add project screenshots here after running the application:

- Home and property search
- Nearby properties map
- Owner dashboard and property form
- Admin dashboard

## Future Enhancements

- Property image uploads with an optional image-hosting provider
- Pagination and saved search preferences
- Email notifications for inquiries
- Automated integration tests and deployment configuration

## Author

B.Tech project team
