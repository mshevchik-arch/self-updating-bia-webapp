const express = require('express');
const router = express.Router();
const DataIntegrationService = require('../services/DataIntegrationService');
const RoosterService = require('../services/RoosterService');

/**
 * GET /api/health
 * Overall system health check
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check all service health
    const [dataSourceHealth, roosterHealth] = await Promise.allSettled([
      DataIntegrationService.getDataSourceHealth(),
      RoosterService.getServiceHealth()
    ]);

    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      response_time_ms: responseTime,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      
      services: {
        data_sources: dataSourceHealth.status === 'fulfilled' ? dataSourceHealth.value : { status: 'error' },
        rooster_engine: roosterHealth.status === 'fulfilled' ? roosterHealth.value : { status: 'error' }
      },
      
      system: {
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        node_version: process.version,
        platform: process.platform
      }
    };

    // Determine overall health
    const servicesHealthy = 
      (dataSourceHealth.status === 'fulfilled' && dataSourceHealth.value.overall === 'healthy') &&
      (roosterHealth.status === 'fulfilled' && roosterHealth.value.status === 'healthy');
    
    if (!servicesHealthy) {
      healthStatus.status = 'degraded';
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);

  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /api/health/data-sources
 * Detailed data source health check
 */
router.get('/data-sources', async (req, res) => {
  try {
    const health = await DataIntegrationService.getDataSourceHealth();
    res.json(health);
  } catch (error) {
    console.error('❌ Data source health check error:', error);
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/rooster
 * Rooster prediction engine health check
 */
router.get('/rooster', async (req, res) => {
  try {
    const health = await RoosterService.getServiceHealth();
    res.json(health);
  } catch (error) {
    console.error('❌ Rooster health check error:', error);
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/readiness
 * Kubernetes readiness probe
 */
router.get('/readiness', async (req, res) => {
  try {
    // Quick readiness check - just verify core services are responding
    const checks = await Promise.allSettled([
      DataIntegrationService.checkRegistryHealth(),
      RoosterService.getServiceHealth()
    ]);

    const ready = checks.every(check => check.status === 'fulfilled');
    
    res.status(ready ? 200 : 503).json({
      ready,
      timestamp: new Date().toISOString(),
      checks: checks.length
    });

  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/liveness
 * Kubernetes liveness probe
 */
router.get('/liveness', (req, res) => {
  // Simple liveness check - just verify the process is running
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
