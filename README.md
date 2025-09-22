# Self-Updating BIA Web Application

## Architecture Overview

```
Frontend (React/HTML)
    ↕️ REST API
Node.js Express Server
    ↕️ Data Integration Layer
┌─────────────────┬─────────────────┬─────────────────┐
│   Snowflake     │   PagerDuty     │   HR Systems    │
│   (Registry)    │   (Escalation)  │   (Personnel)   │
└─────────────────┴─────────────────┴─────────────────┘
    ↕️ Fusion MCP Integration
Fusion Risk Management Platform
```

## Project Structure

```
self-updating-bia-webapp/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── services/        # Business logic & data integration
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth, validation, logging
│   │   └── utils/           # Helper functions
│   ├── config/              # Configuration files
│   └── tests/               # Unit and integration tests
├── frontend/
│   ├── public/              # Static assets
│   ├── src/                 # React components
│   └── build/               # Production build
├── database/
│   ├── migrations/          # Database schema changes
│   └── seeds/               # Sample data
└── docs/                    # API documentation
```

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL + Redis (caching)
- **Frontend**: React.js (enhanced from HTML prototype)
- **Data Integration**: Snowflake (via Goose), REST APIs
- **Authentication**: Block SSO (Okta/SAML)
- **Risk Management**: Fusion MCP integration
- **Deployment**: Docker + Kubernetes

## Integration with Existing Assets

### Rooster Predictive Engine
- Located at `/Users/mshevchik/rooster_bia/`
- Contains advanced RTO/RPO prediction algorithms
- Will be integrated as a microservice or Python subprocess

### Snowflake Integration
- Uses Goose's built-in Snowflake extension
- Registry data (CMDB equivalent) available in Snowflake
- Real-time dependency discovery and technology mapping

### Fusion MCP
- Existing integration components at 85% completion
- Bi-directional sync with risk management platform
- Automated control mapping and risk score updates

## Getting Started

1. `npm install` - Install dependencies
2. `npm run dev` - Start development server
3. `npm run test` - Run test suite
4. `npm run build` - Build for production

## Development Phases

1. **Phase 1**: Backend API + Snowflake integration
2. **Phase 2**: Data source scaffolding + Rooster integration
3. **Phase 3**: Frontend enhancement + real-time updates
4. **Phase 4**: Fusion integration + production deployment
