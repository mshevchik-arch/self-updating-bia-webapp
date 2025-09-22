const express = require('express');
const router = express.Router();
const DataIntegrationService = require('../services/DataIntegrationService');

/**
 * GET /api/data-sources/health
 * Get health status of all data sources
 */
router.get('/health', async (req, res) => {
  try {
    const health = await DataIntegrationService.getDataSourceHealth();
    res.json(health);
  } catch (error) {
    console.error('❌ Data source health error:', error);
    res.status(500).json({ error: 'Failed to check data source health' });
  }
});

/**
 * GET /api/data-sources/registry/:functionName
 * Get Registry data for a specific function
 */
router.get('/registry/:functionName', async (req, res) => {
  try {
    const { functionName } = req.params;
    const data = await DataIntegrationService.getRegistryData(functionName);
    res.json(data);
  } catch (error) {
    console.error('❌ Registry data error:', error);
    res.status(500).json({ error: 'Failed to fetch Registry data' });
  }
});

/**
 * GET /api/data-sources/pagerduty/:functionName
 * Get PagerDuty data for a specific function
 */
router.get('/pagerduty/:functionName', async (req, res) => {
  try {
    const { functionName } = req.params;
    const data = await DataIntegrationService.getPagerDutyData(functionName);
    res.json(data);
  } catch (error) {
    console.error('❌ PagerDuty data error:', error);
    res.status(500).json({ error: 'Failed to fetch PagerDuty data' });
  }
});

/**
 * GET /api/data-sources/hr/:teamName
 * Get HR data for a specific team
 */
router.get('/hr/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    const data = await DataIntegrationService.getHRData(teamName);
    res.json(data);
  } catch (error) {
    console.error('❌ HR data error:', error);
    res.status(500).json({ error: 'Failed to fetch HR data' });
  }
});

/**
 * GET /api/data-sources/financial/:functionName
 * Get financial impact data for a specific function
 */
router.get('/financial/:functionName', async (req, res) => {
  try {
    const { functionName } = req.params;
    const data = await DataIntegrationService.getFinancialData(functionName);
    res.json(data);
  } catch (error) {
    console.error('❌ Financial data error:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

/**
 * GET /api/data-sources/monitoring/:functionName
 * Get monitoring data for a specific function
 */
router.get('/monitoring/:functionName', async (req, res) => {
  try {
    const { functionName } = req.params;
    const data = await DataIntegrationService.getMonitoringData(functionName);
    res.json(data);
  } catch (error) {
    console.error('❌ Monitoring data error:', error);
    res.status(500).json({ error: 'Failed to fetch monitoring data' });
  }
});

/**
 * POST /api/data-sources/test-connection
 * Test connection to a specific data source
 */
router.post('/test-connection', async (req, res) => {
  try {
    const { dataSource, functionName } = req.body;
    
    let result;
    switch (dataSource) {
      case 'registry':
        result = await DataIntegrationService.getRegistryData(functionName || 'test');
        break;
      case 'pagerduty':
        result = await DataIntegrationService.getPagerDutyData(functionName || 'test');
        break;
      case 'hr':
        result = await DataIntegrationService.getHRData(functionName || 'test');
        break;
      case 'financial':
        result = await DataIntegrationService.getFinancialData(functionName || 'test');
        break;
      case 'monitoring':
        result = await DataIntegrationService.getMonitoringData(functionName || 'test');
        break;
      default:
        return res.status(400).json({ error: 'Invalid data source' });
    }

    res.json({
      success: true,
      dataSource,
      testResult: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Connection test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/data-sources/integration-status
 * Get integration status for all data sources
 */
router.get('/integration-status', async (req, res) => {
  try {
    const status = {
      registry: {
        name: 'Registry (Snowflake)',
        status: 'scaffolding',
        description: 'Ready for Goose Snowflake extension integration',
        integration_notes: 'Use Goose built-in Snowflake extension to query Registry data'
      },
      pagerduty: {
        name: 'PagerDuty API',
        status: 'scaffolding',
        description: 'Ready for PagerDuty API integration',
        integration_notes: 'Requires PagerDuty API key and service configuration'
      },
      hr: {
        name: 'HR Systems',
        status: 'scaffolding',
        description: 'Ready for HR/LDAP integration',
        integration_notes: 'Requires HR system API credentials and endpoints'
      },
      financial: {
        name: 'Financial Systems',
        status: 'scaffolding',
        description: 'Ready for financial analytics integration',
        integration_notes: 'Requires access to revenue dashboards and analytics APIs'
      },
      monitoring: {
        name: 'Monitoring Systems',
        status: 'scaffolding',
        description: 'Ready for monitoring platform integration',
        integration_notes: 'Requires Datadog/monitoring system API credentials'
      },
      fusion: {
        name: 'Fusion MCP',
        status: 'partial',
        description: 'Existing Fusion MCP components available',
        integration_notes: 'Leverage existing Fusion integration at ~/fusion_integration/'
      }
    };

    res.json({
      overall_status: 'scaffolding_complete',
      ready_for_integrations_team: true,
      data_sources: status,
      next_steps: [
        'Integrations team to replace scaffolding with real API calls',
        'Configure API credentials and endpoints',
        'Test data source connections',
        'Validate data quality and confidence scoring'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Integration status error:', error);
    res.status(500).json({ error: 'Failed to get integration status' });
  }
});

module.exports = router;
