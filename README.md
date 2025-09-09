# 🏦 Fakecombank - Demo Banking Application

A full-stack banking application demo built with modern web technologies. This project showcases a complete banking system with user authentication, account management, transaction processing, and payment integration.

## 🚀 Features

- **User Authentication & Authorization** - Secure JWT-based authentication with Spring Security
- **Account Management** - Create and manage bank accounts
- **Transaction Processing** - Transfer funds between accounts
- **Payment Integration** - Support for Stripe and PayPal payments
- **Dashboard Analytics** - Interactive charts and financial insights
- **Email Notifications** - Automated email alerts for transactions
- **OTP Verification** - Two-factor authentication for enhanced security
- **Password Reset** - Secure password recovery system
- **Responsive Design** - Mobile-first UI with Tailwind CSS

## 🏗️ Architecture

This application follows a microservices architecture with separate frontend and backend services:

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│   Andromeda     │◄──────────────────►│     Orion       │
│   (Frontend)    │                     │   (Backend)     │
│                 │                     │                 │
│  Next.js 15     │                     │ Spring Boot 3.4 │
│  React 19       │                     │ Java 21         │
│  TypeScript     │                     │ PostgreSQL      │
│  Tailwind CSS   │                     │ JWT Auth        │
│                 │                     │ Stripe/PayPal   │
└─────────────────┘                     └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend (Andromeda)
- **Framework**: Next.js 15.3.1
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios
- **Icons**: React Icons
- **State Management**: React Hooks
- **Build Tool**: Turbopack

### Backend (Orion)
- **Framework**: Spring Boot 3.4.4
- **Language**: Java 21
- **Database**: PostgreSQL
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **Payment Processing**: Stripe SDK, PayPal SDK
- **Email**: Spring Boot Mail
- **Documentation**: Built-in Spring Boot features

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Frontend Port**: 3000
- **Backend Port**: 8080

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Docker** (v20.0 or higher)
- **Docker Compose** (v2.0 or higher)
- **Node.js** (v18 or higher) - for local development
- **Java** (v21) - for local development
- **Maven** (v3.6 or higher) - for local development
- **PostgreSQL** (v13 or higher) - for local development

## 🚀 Quick Start with Docker

The easiest way to run the entire application is using Docker Compose:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Huy-Nguyen-Chualambo/Fakecombank_website.git
   cd Fakecombank_website
   ```

2. **Build the Docker images**
   ```bash
   # Build frontend image
   cd andromeda
   docker build -t andromeda:latest .
   cd ..
   
   # Build backend image
   cd orion
   docker build -t orion:latest .
   cd ..
   ```

3. **Start the application**
   ```bash
   docker compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## 💻 Local Development Setup

### Backend (Orion)

1. **Navigate to the backend directory**
   ```bash
   cd orion
   ```

2. **Install dependencies**
   ```bash
   chmod +x ./mvnw  # Make Maven wrapper executable
   ./mvnw clean install
   ```

3. **Configure the database**
   - Create a PostgreSQL database named `fakecombank`
   - Update `application.properties` with your database credentials

4. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```

The backend will be available at http://localhost:8080

### Frontend (Andromeda)

1. **Navigate to the frontend directory**
   ```bash
   cd andromeda
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:3000

## 🔧 Environment Configuration

### Backend Environment Variables

Create an `application.yml` file in `orion/src/main/resources/`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/fakecombank
    username: your_db_username
    password: your_db_password
  
  mail:
    host: your_smtp_host
    port: 587
    username: your_email
    password: your_email_password

jwt:
  secret: your_jwt_secret_key

stripe:
  api:
    key: your_stripe_secret_key

paypal:
  client:
    id: your_paypal_client_id
    secret: your_paypal_client_secret
```

### Frontend Environment Variables

Create a `.env.local` file in the `andromeda` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 📚 API Documentation

The backend provides RESTful APIs for all banking operations:

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

### Account Management
- `GET /api/accounts` - Get user accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/{id}` - Get account details

### Transactions
- `POST /api/transactions/transfer` - Transfer funds
- `GET /api/transactions/history` - Transaction history
- `GET /api/transactions/{id}` - Transaction details

### Payment Processing
- `POST /api/payments/stripe` - Process Stripe payment
- `POST /api/payments/paypal` - Process PayPal payment

## 🧪 Testing

### Backend Tests
```bash
cd orion
./mvnw test
```

### Frontend Tests
```bash
cd andromeda
npm run test
```

## 🏗️ Building for Production

### Backend
```bash
cd orion
./mvnw clean package
```

### Frontend
```bash
cd andromeda
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

- **Backend**: Follow Java code conventions and Spring Boot best practices
- **Frontend**: Use ESLint configuration provided in the project
- **Commits**: Use conventional commit messages

## 🔒 Security Notes

⚠️ **Important**: This is a demo application for educational purposes. Do not use in production without proper security hardening:

- Change all default passwords and secrets
- Implement proper input validation
- Add rate limiting
- Set up proper CORS policies
- Use HTTPS in production
- Implement proper logging and monitoring

## 📄 License

This project is for educational purposes. Please check with the repository owner for usage rights.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Huy-Nguyen-Chualambo/Fakecombank_website/issues) page
2. Create a new issue with detailed information about your problem
3. Include logs and error messages when possible

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Next.js team for the React framework
- All open-source contributors whose libraries make this project possible
