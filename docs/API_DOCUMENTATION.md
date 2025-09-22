# Self-Updating BIA Web App - API Documentation

## Overview

The Self-Updating BIA Web App provides a RESTful API for generating Business Impact Analysis documents with auto-populated data from multiple sources.

**Base URL**: `http://localhost:3001/api`

## Authentication

Currently using development mode. Production will implement Block SSO (Okta/SAML).

## API Endpoints

### BIA Management

#### Generate BIA
```http
POST /api/bia/generate
```

Generate a new BIA with auto-populated data from integrated sources.

**Request Body:**
```json
{
  "functionName": "Cash App Payment Processing",
  "functionType": "product",
  "driName": "John Doe",
  "driTeam": "Cash App Engineering",
  "regionalOverlays": [
    {
      "region": "na",
      "requirements": {...}
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "bia": {
    "id": "uuid",
    "function_name": "Cash App Payment Processing",
    "personnel_information": {...},
    "business_impact": {...},
    "technology_dependencies": {...},
    "recovery_requirements": {...},
    "predictive_analysis": {...}
  },
  "fusionStatus": {
    "exists": false,
    "action_required": "create"
  },
  "dataSourceStatus": {
    "registry": "fulfilled",
    "pagerDuty": "fulfilled",
    "hr": "fulfilled"
  }
}
```

#### Approve BIA
```http
POST /api/bia/approve
```

Approve and push BIA to Fusion Risk Management platform.

**Request Body:**
```json
{
  "biaId": "uuid",
  "comments": "Approved with minor adjustments"
}
```

#### Get BIA
```http
GET /api/bia/:id
```

Retrieve a specific BIA by ID.

#### List BIAs
```http
GET /api/bia?status=approved&limit=10&offset=0
```

List BIAs with optional filtering.

### Data Sources

#### Health Check
```http
GET /api/data-sources/health
```

Get health status of all integrated data sources.

**Response:**
```json
{
  "registry": {
    "status": "healthy",
    "response_time": "150ms",
    "last_check": "2024-09-22T16:00:00Z"
  },
  "pagerduty": {
    "status": "healthy",
    "response_time": "200ms"
  },
  "overall": "healthy"
}
```

#### Get Registry Data
```http
GET /api/data-sources/registry/:functionName
```

Get Registry (CMDB) data for a specific function.

#### Get PagerDuty Data
```http
GET /api/data-sources/pagerduty/:functionName
```

Get PagerDuty escalation policies and incident data.

#### Test Connection
```http
POST /api/data-sources/test-connection
```

Test connection to a specific data source.

**Request Body:**
```json
{
  "dataSource": "registry",
  "functionName": "test-function"
}
```

### Fusion Integration

#### Check Fusion Record
```http
GET /api/fusion/check/:functionName
```

Check if BIA record exists in Fusion.

#### Push to Fusion
```http
POST /api/fusion/push
```

Push approved BIA to Fusion Risk Management platform.

#### Sync with Fusion
```http
POST /api/fusion/sync
```

Bi-directional sync with Fusion.

#### Integration Status
```http
GET /api/fusion/status
```

Get Fusion integration status and capabilities.

### System Health

#### Overall Health
```http
GET /api/health
```

Overall system health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-09-22T16:00:00Z",
  "response_time_ms": 150,
  "services": {
    "data_sources": {"overall": "healthy"},
    "rooster_engine": {"status": "healthy"}
  },
  "system": {
    "uptime": 3600,
    "memory_usage": {...}
  }
}
```

#### Readiness Probe
```http
GET /api/health/readiness
```

Kubernetes readiness probe endpoint.

#### Liveness Probe
```http
GET /api/health/liveness
```

Kubernetes liveness probe endpoint.

## Data Integration Architecture

### Registry (Snowflake)
- **Source**: Block's Registry system via Snowflake
- **Access**: Goose Snowflake extension
- **Data**: Technology stack, dependencies, deployment info

### PagerDuty
- **Source**: PagerDuty API
- **Data**: Escalation policies, incident history, MTTR

### HR Systems
- **Source**: LDAP/HR APIs
- **Data**: Personnel information, org chart, team structure

### Financial Systems
- **Source**: Analytics APIs
- **Data**: Revenue impact, customer metrics, transaction volumes

### Monitoring Systems
- **Source**: Datadog/monitoring platforms
- **Data**: Availability, performance metrics, SLA data

### Rooster Predictions
- **Source**: Existing Rooster predictive engine
- **Data**: RTO/RPO forecasts, risk assessments, scenarios

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "timestamp": "2024-09-22T16:00:00Z",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (health check failures)

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Data Source Integration Status

| Data Source | Status | Integration Notes |
|-------------|--------|-------------------|
| Registry (Snowflake) | Scaffolding | Ready for Goose Snowflake extension |
| PagerDuty | Scaffolding | Requires API key configuration |
| HR Systems | Scaffolding | Requires LDAP/API credentials |
| Financial Systems | Scaffolding | Requires analytics API access |
| Monitoring | Scaffolding | Requires Datadog/monitoring API |
| Fusion MCP | Partial | 85% complete, existing components available |

## Next Steps for Integrations Team

1. **Replace scaffolding** with real API calls in `DataIntegrationService.js`
2. **Configure API credentials** in environment variables
3. **Test data source connections** using health check endpoints
4. **Validate data quality** and confidence scoring
5. **Complete Fusion MCP integration** using existing components

## Development

### Running the API
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Database Migrations
```bash
# Run migrations
npm run migrate

# Seed database
npm run seed
```

## Production Deployment

- **Environment**: Docker + Kubernetes
- **Database**: PostgreSQL with Redis caching
- **Monitoring**: Health check endpoints for Kubernetes probes
- **Security**: Rate limiting, input validation, CORS protection
