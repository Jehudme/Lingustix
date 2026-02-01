# Lingustix

A state-of-the-art language learning and composition evaluation platform. Lingustix helps writers improve their writing skills through real-time grammar checking, intelligent suggestions, and comprehensive composition management.

## ✨ Features

- **🔐 Secure Authentication** - JWT-based authentication with token refresh and session management
- **📝 Composition Editor** - Rich text editor for creating and managing your writings
- **🔍 Grammar & Style Checking** - Powered by LanguageTool for real-time grammar, spelling, and style suggestions
- **🔎 Full-Text Search** - Elasticsearch-powered search across all your compositions
- **📊 Writing Analytics** - Track word count, reading time, and error density
- **🎨 Modern UI** - Beautiful, responsive interface built with Next.js and Tailwind CSS

## 🏗️ Architecture

Lingustix is a full-stack application consisting of:

- **Frontend** (`lingustix-web/`) - Next.js 16 application with React 19, TypeScript, and Tailwind CSS
- **Backend** (`lingustix-api/`) - Spring Boot 4 REST API with Java 21
- **Database** - PostgreSQL 16 for persistent data storage
- **Search Engine** - Elasticsearch 9 for full-text search capabilities
- **Grammar Service** - LanguageTool for grammar and style checking

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) 20+ (for local frontend development)
- [Java 21](https://adoptium.net/) (for local backend development)
- [Maven](https://maven.apache.org/) (for local backend development)

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jehudme/Lingustix.git
   cd Lingustix
   ```

2. **Create your environment file**
   ```bash
   cp .env.exemple .env
   ```
   
3. **Update the `.env` file** with your configuration:
   - Change `SPRING_DATASOURCE_PASSWORD` to a secure password
   - Change `APP_JWT_SECRET` to a unique base64-encoded secret (min 32 characters)
   - Set `APP_DEBUG_SHOW_MESSAGES=false` for production

4. **Start the services**
   ```bash
   docker compose --profile app --profile postgres --profile languagetool --profile search up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:8080 (or your configured `WEBSITE_PORT`)
   - API: http://localhost:3000 (or your configured `SERVER_PORT`)
   - API Documentation: http://localhost:3000/swagger-ui.html

### Local Development

#### Frontend (Next.js)

```bash
cd lingustix-web
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

#### Backend (Spring Boot)

```bash
cd lingustix-api
./mvnw spring-boot:run
```

The API will be available at http://localhost:8080

> **Note:** Make sure PostgreSQL, Elasticsearch, and LanguageTool services are running before starting the backend.

## 📁 Project Structure

```
Lingustix/
├── lingustix-api/          # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/       # Java source files
│   │   │   └── resources/  # Configuration files
│   │   └── test/           # Test files
│   ├── Dockerfile
│   └── pom.xml
│
├── lingustix-web/          # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities, stores, and API client
│   │   └── types/          # TypeScript type definitions
│   ├── Dockerfile
│   └── package.json
│
├── compose.yaml            # Docker Compose configuration
├── .env.exemple            # Example environment variables
└── README.md
```

## 🔧 Configuration

### Environment Variables

See `.env.exemple` for all available configuration options. Key variables include:

| Variable | Description | Default |
|----------|-------------|---------|
| `COMPOSE_PROFILES` | Docker Compose profiles to enable | `app,postgres,languagetool,search` |
| `SERVER_PORT` | API server port | `3000` |
| `WEBSITE_PORT` | Frontend port | `8080` |
| `SPRING_DATASOURCE_DB` | PostgreSQL database name | `lingustix_db` |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password | *(required)* |
| `APP_JWT_SECRET` | JWT signing secret (base64) | *(required)* |
| `APP_JWT_EXPIRATION` | JWT expiration in milliseconds | `86400000` (24h) |
| `APP_DEBUG_SHOW_MESSAGES` | Show detailed error messages | `false` |

## 🛠️ API Documentation

When the backend is running, API documentation is available at:

- **Swagger UI**: http://localhost:3000/swagger-ui.html
- **OpenAPI JSON**: http://localhost:3000/v3/api-docs

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate and receive JWT |
| `POST` | `/auth/logout` | Invalidate current session |
| `POST` | `/auth/refresh` | Refresh JWT token |
| `POST` | `/accounts` | Create new account |
| `GET` | `/accounts/me` | Get current user info |
| `POST` | `/compositions` | Create new composition |
| `GET` | `/compositions/{id}` | Get composition by ID |
| `POST` | `/evaluations` | Evaluate composition for errors |
| `GET` | `/search/compositions` | Search compositions |

## 🧪 Testing

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

## 🔒 Security

- **Authentication**: JWT-based with automatic token refresh
- **Password Storage**: BCrypt hashing with salt
- **Token Revocation**: Server-side token blacklisting for secure logout
- **CORS**: Configurable cross-origin policies
- **Input Validation**: Server-side validation on all endpoints

### Production Security Checklist

- [ ] Change `APP_JWT_SECRET` to a unique, strong secret
- [ ] Set `APP_DEBUG_SHOW_MESSAGES=false`
- [ ] Use strong database passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure appropriate CORS origins
- [ ] Set up rate limiting
- [ ] Enable security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LanguageTool](https://languagetool.org/) for grammar checking capabilities
- [Spring Boot](https://spring.io/projects/spring-boot) for the robust backend framework
- [Next.js](https://nextjs.org/) for the modern React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
