# Integration Guide for Self-Updating BIA Web App

## Overview

This guide helps the integrations team replace the scaffolding code with real data source integrations. The backend is structured to make this process straightforward - most changes will be in the `DataIntegrationService.js` file.

## Architecture Summary

```
Frontend (React/HTML) 
    ↕️ REST API
Node.js Express Server
    ↕️ DataIntegrationService.js (🎯 MAIN INTEGRATION POINT)
┌─────────────────┬─────────────────┬─────────────────┐
│   Snowflake     │   PagerDuty     │   HR Systems    │
│   (Registry)    │   (Escalation)  │   (Personnel)   │
└─────────────────┴─────────────────┴─────────────────┘
    ↕️ Existing Fusion MCP Integration
Fusion Risk Management Platform
```

## Key Integration Points

### 1. Registry Data (Snowflake) - PRIMARY INTEGRATION

**File**: `backend/src/services/DataIntegrationService.js`
**Method**: `getRegistryData(functionName)`

**Current State**: Mock data with Snowflake query template
**Action Required**: Replace with actual Goose Snowflake extension calls

```javascript
// REPLACE THIS MOCK CODE:
const mockRegistryData = { /* ... */ };

// WITH ACTUAL GOOSE INTEGRATION:
const goose = require('@goose/snowflake'); // Or however Goose is imported
const result = await goose.snowflake.execute_query(registryQuery);
```

**Registry Query Template** (already provided):
```sql
SELECT 
  app_name,
  description,
  reliability_tier,
  team_id,
  slack_channel,
  documentation_url,
  runbook_url,
  dependencies,
  technology_stack,
  deployment_info
FROM REGISTRY.PUBLIC.APPLICATIONS 
WHERE LOWER(app_name) LIKE '%${functionName.toLowerCase()}%'
   OR LOWER(description) LIKE '%${functionName.toLowerCase()}%'
LIMIT 10
```

### 2. PagerDuty Integration

**File**: `backend/src/services/DataIntegrationService.js`
**Method**: `getPagerDutyData(functionName)`

**Required Environment Variables**:
```bash
PAGERDUTY_API_KEY=your_pagerduty_api_key
```

**Integration Template**:
```javascript
const pagerDutyAPI = axios.create({
  baseURL: 'https://api.pagerduty.com',
  headers: {
    'Authorization': `Token token=${process.env.PAGERDUTY_API_KEY}`,
    'Accept': 'application/vnd.pagerduty+json;version=2'
  }
});

// Get services matching function name
const services = await pagerDutyAPI.get('/services', {
  params: { query: functionName }
});

// Get escalation policies
const escalationPolicies = await pagerDutyAPI.get('/escalation_policies');

// Get incident statistics
const incidents = await pagerDutyAPI.get('/incidents', {
  params: { 
    service_ids: [serviceId],
    since: '2024-08-01T00:00:00Z',
    until: '2024-09-01T00:00:00Z'
  }
});
```

### 3. HR Systems Integration

**File**: `backend/src/services/DataIntegrationService.js`
**Method**: `getHRData(teamName)`

**Options**:
- **LDAP Integration** (most common)
- **Workday API**
- **Internal HR APIs**

**LDAP Template**:
```javascript
const ldap = require('ldapjs');

const client = ldap.createClient({
  url: process.env.LDAP_URL
});

// Bind with service account
await client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASSWORD);

// Search for team members
const searchOptions = {
  filter: `(department=${teamName})`,
  scope: 'sub',
  attributes: ['cn', 'mail', 'title', 'manager']
};
```

### 4. Financial Systems Integration

**File**: `backend/src/services/DataIntegrationService.js`
**Method**: `getFinancialData(functionName)`

**Likely Sources**:
- **Datadog Revenue Dashboards**
- **Internal Analytics APIs**
- **Business Intelligence Platforms**

**Template**:
```javascript
const financialAPI = axios.create({
  baseURL: process.env.FINANCIAL_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.FINANCIAL_API_KEY}`
  }
});

// Get revenue metrics
const revenueData = await financialAPI.get(`/revenue/service/${functionName}`);
const customerData = await financialAPI.get(`/customers/service/${functionName}`);
```

### 5. Monitoring Systems Integration

**File**: `backend/src/services/DataIntegrationService.js`
**Method**: `getMonitoringData(functionName)`

**Datadog Integration Template**:
```javascript
const datadogAPI = axios.create({
  baseURL: 'https://api.datadoghq.com/api/v1',
  headers: {
    'DD-API-KEY': process.env.DATADOG_API_KEY,
    'DD-APPLICATION-KEY': process.env.DATADOG_APP_KEY
  }
});

// Get service availability
const availability = await datadogAPI.get('/monitor', {
  params: { 
    name: functionName,
    type: 'service check'
  }
});

// Get performance metrics
const metrics = await datadogAPI.get('/query', {
  params: {
    query: `avg:system.load.1{service:${functionName}}`,
    from: Math.floor(Date.now() / 1000) - 3600,
    to: Math.floor(Date.now() / 1000)
  }
});
```

## Existing Assets to Leverage

### 1. Rooster Predictive Engine ✅
**Location**: `/Users/mshevchik/rooster_bia/`
**Status**: Ready to use
**Integration**: Already implemented in `RoosterService.js`

### 2. Fusion MCP Integration ✅
**Location**: `~/fusion_integration/` (85% complete)
**Status**: Existing components available
**Files**:
- `fusion_mcp.py` (18KB) - Full MCP implementation
- `fusion_api_client.py` (13KB) - Complete API client
- `mcp_schema.json` (7KB) - Tool definitions

### 3. Database Schema ✅
**Location**: `database/migrations/001_create_bia_tables.sql`
**Status**: Production-ready PostgreSQL schema

## Step-by-Step Integration Process

### Phase 1: Registry Integration (Week 1)
1. **Set up Goose Snowflake access**
   - Configure Snowflake credentials
   - Test Registry query execution
   - Validate data mapping

2. **Replace mock data in `getRegistryData()`**
   - Import Goose Snowflake extension
   - Execute Registry query
   - Map results to expected format

3. **Test integration**
   - Use `/api/data-sources/registry/test` endpoint
   - Verify data quality and confidence scoring

### Phase 2: PagerDuty Integration (Week 1)
1. **Configure PagerDuty API access**
   - Get API key from PagerDuty admin
   - Set up environment variables

2. **Implement PagerDuty client**
   - Replace mock data in `getPagerDutyData()`
   - Map escalation policies and incident data

3. **Test and validate**
   - Test with known service names
   - Verify MTTR calculations

### Phase 3: HR and Financial Systems (Week 2)
1. **Identify HR system APIs**
   - LDAP endpoints and credentials
   - Alternative HR APIs if available

2. **Identify financial data sources**
   - Revenue dashboard APIs
   - Customer analytics endpoints

3. **Implement integrations**
   - Replace mock data in respective methods
   - Add proper error handling

### Phase 4: Complete Fusion Integration (Week 2)
1. **Complete Fusion MCP setup**
   - Finish remaining 15% of implementation
   - Configure API credentials

2. **Integrate with BIA web app**
   - Replace Fusion scaffolding with real MCP calls
   - Test bi-directional sync

## Testing Strategy

### Unit Testing
```bash
# Test individual data source integrations
npm test -- --grep "DataIntegrationService"
```

### Integration Testing
```bash
# Test complete BIA generation workflow
curl -X POST http://localhost:3001/api/bia/generate \
  -H "Content-Type: application/json" \
  -d '{"functionName": "test-service", "functionType": "product"}'
```

### Health Check Monitoring
```bash
# Monitor data source health
curl http://localhost:3001/api/data-sources/health
```

## Configuration Management

### Environment Variables
Copy `backend/config/env.example` to `.env` and configure:

```bash
# Registry (Snowflake)
SNOWFLAKE_ACCOUNT=square
SNOWFLAKE_USER=your-username
SNOWFLAKE_PASSWORD=your-password

# PagerDuty
PAGERDUTY_API_KEY=your-api-key

# HR Systems
LDAP_URL=ldap://your-ldap-server
LDAP_BIND_DN=your-bind-dn
LDAP_BIND_PASSWORD=your-password

# Financial Systems
FINANCIAL_API_URL=https://your-financial-api
FINANCIAL_API_KEY=your-api-key

# Monitoring
DATADOG_API_KEY=your-datadog-api-key
DATADOG_APP_KEY=your-datadog-app-key
```

## Error Handling and Resilience

### Graceful Degradation
The system is designed to handle partial data source failures:

```javascript
// Example: If PagerDuty fails, continue with other sources
const [registryData, pagerDutyData, hrData] = await Promise.allSettled([
  DataIntegrationService.getRegistryData(functionName),
  DataIntegrationService.getPagerDutyData(functionName),
  DataIntegrationService.getHRData(driTeam)
]);

// System continues even if some sources fail
```

### Confidence Scoring
Each data source provides a confidence score (0.0-1.0):
- **High (0.8-1.0)**: Real-time, authoritative data
- **Medium (0.6-0.8)**: Recent data with some uncertainty
- **Low (0.0-0.6)**: Fallback or estimated data

## Deployment Considerations

### Development
```bash
npm run dev
```

### Production
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for API response caching
- **Monitoring**: Health check endpoints for Kubernetes
- **Security**: Rate limiting, input validation, CORS

## Support and Troubleshooting

### Common Issues
1. **Snowflake Connection**: Verify Goose extension is properly configured
2. **API Rate Limits**: Implement exponential backoff
3. **Data Quality**: Monitor confidence scores and add validation
4. **Performance**: Use Redis caching for frequently accessed data

### Logging
All integrations include structured logging:
```javascript
console.log(`📊 Fetching Registry data for: ${functionName}`);
console.error('❌ Registry data fetch error:', error);
```

### Monitoring Endpoints
- `/api/health` - Overall system health
- `/api/data-sources/health` - Data source health
- `/api/health/readiness` - Kubernetes readiness probe

## Next Steps

1. **Start with Registry integration** (highest impact)
2. **Add PagerDuty integration** (escalation policies)
3. **Complete HR and Financial integrations**
4. **Finish Fusion MCP integration**
5. **Deploy to staging environment**
6. **Conduct end-to-end testing**
7. **Deploy to production**

The scaffolding is complete and ready for your integrations. Each data source integration is isolated, so you can work on them independently and deploy incrementally.
