<div align="center">
  <h1>🏇 Horse Racing Management System</h1>
  <br />
  <img src="https://skillicons.dev/icons?i=spring,java,react,tailwind,vite,mysql,redis&theme=light" alt="Tech Stack" />
</div>

## 📖 Introduction

The **Horse Racing Management System** is a comprehensive full-stack web application designed to manage, operate, and participate in virtual or real-world horse racing tournaments. The platform provides a rich ecosystem with tailored dashboards for different roles, real-time live racing features, betting mechanisms, and seamless payment integration.

---

## ✨ Key Features

*   **Role-Based Access & Dashboards:**
    *   **Admin:** Manage tournaments, races, users, and overall system configuration.
    *   **Referee:** Oversee race integrity, input race results, and manage live racing events.
    *   **Jockey:** View assigned races, manage schedules, and track performance.
    *   **Horse Owner:** Register horses, view horse statistics, and manage participation in races.
    *   **User (Bettor):** Browse tournaments, place bets, and view transaction history.
*   **Live Racing System:** Real-time updates on race progress and results using WebSockets (STOMP).
*   **Betting & Payment:** Secure deposit system integrated with the **PayOS** gateway for seamless transactions and betting payouts.
*   **Tournament & Horse Management:** Complete lifecycle management from horse registration and verification to tournament creation and race scheduling.
*   **Notifications:** Real-time push notifications for important events (race starts, bet results, invitations).

---

## 🛠️ Technology Stack

### Frontend (Client-side)
*   **Framework:** React 19 (built with Vite)
*   **Styling:** TailwindCSS v4, Framer Motion (for animations)
*   **Routing:** React Router DOM
*   **Data Visualization:** Recharts
*   **Real-time:** StompJS & SockJS-Client
*   **Utilities:** date-fns

### Backend (Server-side)
*   **Framework:** Spring Boot 3.5.0, Java 21
*   **Data Access:** Spring Data JPA, Hibernate, MySQL Connector
*   **Caching & Sessions:** Redis
*   **Security:** Spring Security (OAuth2 Resource Server, JWT)
*   **Media Storage:** Cloudinary (Image uploads)
*   **Payment Gateway:** PayOS Java SDK
*   **Communication:** WebSockets (STOMP), OpenFeign
*   **Mapping & Boilerplate:** MapStruct, Lombok

---

## 📂 Project Structure

The project is structured as a monorepo containing both `frontend` and `backend` codebases.

```text
horse-racing-management/
├── backend/                   # Spring Boot Backend Application
│   ├── src/main/java/com/swp391/horseracing/
│   │   ├── config/            # Security, WebSocket, Redis configurations
│   │   ├── exception/         # Global exception handling
│   │   └── module/            # Feature-based modular architecture
│   │       ├── admin/         # Admin-specific logic
│   │       ├── auth/          # Authentication & JWT processing
│   │       ├── betting/       # Betting rules and history
│   │       ├── horse/         # Horse profiles and management
│   │       ├── jockey/        # Jockey data and invitations
│   │       ├── notification/  # Real-time and email notifications
│   │       ├── payment/       # PayOS integration and deposits
│   │       ├── race/          # Race logic and live tracking
│   │       ├── tournament/    # Tournament structures
│   │       ├── user/          # User profiles and roles
│   │       └── websocket/     # STOMP message handlers
│   └── pom.xml                # Maven dependencies
│
└── frontend/                  # React + Vite Frontend Application
    ├── src/
    │   ├── api/               # Axios/Fetch services for backend endpoints
    │   ├── components/        # Reusable UI components (organized by domain)
    │   ├── contexts/          # React Contexts (Auth, Notification, etc.)
    │   ├── hooks/             # Custom React Hooks
    │   ├── pages/             # Route-level page components (Dashboards, Login, etc.)
    │   └── App.jsx            # Main application router
    ├── package.json           # NPM dependencies
    └── vite.config.js         # Vite configuration
```

---

## 🏗️ Architecture & Communication Flow

*   **RESTful APIs:** The React frontend communicates with the Spring Boot backend via standard HTTP REST APIs for CRUD operations, authentication, and general data fetching.
*   **WebSockets:** For the **Live Race** tracking and real-time **Notifications**, the application establishes a STOMP over WebSocket connection, allowing the server to push updates instantly to all connected clients without polling.
*   **Authentication:** Uses JWT (JSON Web Tokens). Upon successful login, the client stores the token and passes it in the `Authorization` header for protected routes.

---

## 🚀 Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   [Java 21](https://jdk.java.net/21/) or higher
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [MySQL](https://www.mysql.com/) (Running locally or via Docker)
*   [Redis](https://redis.io/) (Running locally or via Docker)
*   **API Keys:** You will need accounts and API keys for [Cloudinary](https://cloudinary.com/) (images) and [PayOS](https://payos.vn/) (payments).

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Configure your environment. You can set the following environment variables or update `src/main/resources/application.yml` (or `.properties`):
    *   `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (MySQL)
    *   `REDIS_HOST`, `REDIS_PORT`
    *   `CLOUDINARY_URL`
    *   PayOS configuration (`CLIENT_ID`, `API_KEY`, `CHECKSUM_KEY`)
    *   JWT Secret Keys
3.  Build and run the application using Maven Wrapper:
    ```bash
    ./mvnw spring-boot:run
    ```
    The backend will start, usually on `http://localhost:8080`.

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install NPM packages:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` directory and add your environment variables (e.g., API Base URL):
    ```env
    VITE_API_BASE_URL=http://localhost:8080/api
    VITE_WS_URL=http://localhost:8080/ws
    ```
4.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` (or similar).

---

## 📸 Screenshots & Demo

*(Add screenshots of the Admin Dashboard, Live Race view, and Betting interface here once available)*

---

## 👥 Contributors

*   *(Your Name/Team here)*

---
*Developed as part of SWP391.*
