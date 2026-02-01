# Lingustix

A modern, full-stack language learning and composition evaluation platform built with Spring Boot and Next.js. This project demonstrates clean architecture principles, Docker-ready deployment, and standardized API design patterns for real-time grammar checking and writing improvement.

## Technical Architecture

### Backend (Spring Boot 4)

- RESTful API with standardized Record-based DTOs for type-safe request/response handling
- JWT Authentication with token blacklisting for secure login and logout functionality
- Global Exception Handling via `@RestControllerAdvice` with configurable debug messages
- JPA/Hibernate with PostgreSQL for persistent storage
- Elasticsearch integration for full-text search capabilities
- LanguageTool integration for grammar and style checking

### Frontend (Next.js 16)

- React 19 with TypeScript for type-safe component development
- App Router architecture with server and client components
- Tailwind CSS for responsive, utility-first styling
- Zustand for lightweight state management
- Framer Motion for smooth animations

### Infrastructure

- Docker Compose orchestration for all services
- Multi-stage Docker builds for optimized container images
- Environment variable configuration for all settings
- Health checks for service dependencies

## Project Structure

```
├── lingustix-api/
│   ├── src/main/java/com/nexus/lingustix/
│   │   ├── components/          # JWT handling, Global exception handler
│   │   ├── configurations/      # Security, Search, Application configs
│   │   ├── controllers/         # REST API endpoints
│   │   ├── models/
│   │   │   ├── entities/        # JPA entities
│   │   │   ├── requests/        # Request DTOs (Records)
│   │   │   └── responses/       # Response DTOs (Records)
│   │   ├── repositories/        # Spring Data JPA repositories
│   │   └── services/            # Business logic layer
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── lingustix-web/
│   ├── src/
│   │   ├── app/                 # Next.js app router pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utilities, stores, and API client
│   │   └── types/               # TypeScript type definitions
│   ├── Dockerfile
│   └── package.json
│
├── compose.yaml
└── .env.exemple
```

## Key Implementation Details

### Standardized Controller Pattern

All controllers follow a strict Record-in, Record-out pattern:

- Request bodies are received as immutable Java Records
- Responses are returned as Records wrapped in ResponseEntity
- No raw entities are exposed through the API

### Global Exception Handling

Centralized error handling with GlobalExceptionComponent:

- Standard HTTP status codes (404, 401, 400, 500)
- Configurable debug messages via `APP_DEBUG_SHOW_MESSAGES` environment variable
- Custom exception types for resource not found, unauthorized access, etc.

### Environment-Driven Configuration

All application settings are externalized:

- JWT configuration (secret, expiration)
- Database connection (URL, credentials)
- Elasticsearch endpoint configuration
- Debug settings and logging levels

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Running with Docker

Clone the repository:

```bash
git clone https://github.com/Jehudme/Lingustix.git
cd Lingustix
```

Create environment file:

```bash
cp .env.exemple .env
```

Start all services:

```bash
docker compose --profile app --profile postgres --profile languagetool --profile search up -d
```

Access the application:

- Web UI: http://localhost:8080
- API: http://localhost:3000
- API Documentation: http://localhost:3000/swagger-ui.html

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COMPOSE_PROFILES` | Docker Compose profiles to enable | `app,postgres,languagetool,search` |
| `SERVER_PORT` | API server port | `3000` |
| `WEBSITE_PORT` | Frontend port | `8080` |
| `POSTGRES_PORT` | PostgreSQL database port | `5432` |
| `LANGUAGETOOL_PORT` | LanguageTool service port | `8081` |
| `ELASTICSEARCH_PORT` | Elasticsearch port | `9200` |
| `SPRING_DATASOURCE_DB` | PostgreSQL database name | `lingustix_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | (required) |
| `APP_JWT_SECRET` | Base64-encoded JWT signing key | (development key) |
| `APP_JWT_EXPIRATION` | Token expiration in milliseconds | `86400000` (24h) |
| `APP_DEBUG_SHOW_MESSAGES` | Show detailed error messages | `false` |
| `LOG_LEVEL_SQL` | SQL query logging level | `DEBUG` |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Authenticate and receive JWT |
| POST | /auth/logout | Invalidate current session |
| POST | /auth/refresh | Refresh JWT token |

### Account Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /accounts | Create new account |
| GET | /accounts/me | Get current user info |

### Compositions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /compositions | Create new composition |
| GET | /compositions/{id} | Get composition by ID |
| PUT | /compositions/{id} | Update composition |
| DELETE | /compositions/{id} | Delete composition |

### Evaluations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /evaluations | Evaluate composition for errors |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /search/compositions | Search compositions |

## Local Development

### Frontend (Next.js)

```bash
cd lingustix-web
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend (Spring Boot)

```bash
cd lingustix-api
./mvnw spring-boot:run
```

The API will be available at http://localhost:8080

Ensure PostgreSQL, Elasticsearch, and LanguageTool services are running before starting the backend.

## Testing

### Backend Tests

```bash
cd lingustix-api
./mvnw test
```

### Frontend Linting

```bash
cd lingustix-web
npm run lint
```

### Frontend Build

```bash
cd lingustix-web
npm run build
```

## Technologies Used

- Java 21 with Spring Boot 4
- PostgreSQL 16 for relational data
- Elasticsearch 9 for full-text search
- LanguageTool for grammar checking
- Next.js 16 with React 19
- TypeScript for type-safe frontend development
- Tailwind CSS for frontend styling
- Docker with multi-stage builds

## Security

- JWT-based authentication with automatic token refresh
- BCrypt password hashing with salt
- Server-side token blacklisting for secure logout
- Configurable CORS policies
- Server-side validation on all endpoints

### Production Security Checklist

- Change `APP_JWT_SECRET` to a unique, strong secret
- Set `APP_DEBUG_SHOW_MESSAGES=false`
- Use strong database passwords
- Enable HTTPS/TLS
- Configure appropriate CORS origins
- Set up rate limiting
- Enable security headers

## Development Notes

This project was built as a demonstration of:

- Clean, self-documenting code without inline comments
- Immutable DTO patterns using Java Records
- Centralized exception handling with standard HTTP responses
- Full containerization with Docker Compose
- Environment-variable driven configuration for deployment flexibility

## License

This project is licensed under the MIT License - see the LICENSE file for details.
