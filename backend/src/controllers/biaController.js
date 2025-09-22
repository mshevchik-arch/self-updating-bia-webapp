const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const BIAService = require('../services/BIAService');
const DataIntegrationService = require('../services/DataIntegrationService');
const RoosterService = require('../services/RoosterService');

/**
 * POST /api/bia/generate
 * Generate a new BIA with auto-populated data
 */
router.post('/generate', [
  body('functionName').notEmpty().withMessage('Function name is required'),
  body('functionType').isIn(['product', 'platform', 'support', 'infrastructure', 'compliance'])
    .withMessage('Invalid function type'),
  body('driName').optional().isString(),
  body('driTeam').optional().isString(),
  body('regionalOverlays').optional().isArray()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { functionName, functionType, driName, driTeam, regionalOverlays } = req.body;

    console.log(`🔄 Generating BIA for: ${functionName}`);

    // Step 1: Gather data from all sources
    const dataGatheringPromises = [
      DataIntegrationService.getRegistryData(functionName),
      DataIntegrationService.getPagerDutyData(functionName),
      DataIntegrationService.getHRData(driTeam),
      DataIntegrationService.getFinancialData(functionName),
      DataIntegrationService.getMonitoringData(functionName)
    ];

    const [registryData, pagerDutyData, hrData, financialData, monitoringData] = 
      await Promise.allSettled(dataGatheringPromises);

    // Step 2: Use Rooster for predictive analysis
    const predictiveAnalysis = await RoosterService.generatePredictions(functionName, {
      registryData: registryData.status === 'fulfilled' ? registryData.value : null,
      monitoringData: monitoringData.status === 'fulfilled' ? monitoringData.value : null
    });

    // Step 3: Generate BIA document
    const biaDocument = await BIAService.generateBIA({
      functionName,
      functionType,
      driName,
      driTeam,
      regionalOverlays,
      autoPopulatedData: {
        registry: registryData.status === 'fulfilled' ? registryData.value : null,
        pagerDuty: pagerDutyData.status === 'fulfilled' ? pagerDutyData.value : null,
        hr: hrData.status === 'fulfilled' ? hrData.value : null,
        financial: financialData.status === 'fulfilled' ? financialData.value : null,
        monitoring: monitoringData.status === 'fulfilled' ? monitoringData.value : null,
        predictions: predictiveAnalysis
      }
    });

    // Step 4: Check Fusion for existing records
    const fusionCheck = await DataIntegrationService.checkFusionRecord(functionName);

    res.json({
      success: true,
      bia: biaDocument,
      fusionStatus: fusionCheck,
      dataSourceStatus: {
        registry: registryData.status,
        pagerDuty: pagerDutyData.status,
        hr: hrData.status,
        financial: financialData.status,
        monitoring: monitoringData.status
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ BIA Generation Error:', error);
    res.status(500).json({
      error: 'Failed to generate BIA',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/bia/approve
 * Approve and push BIA to Fusion
 */
router.post('/approve', [
  body('biaId').notEmpty().withMessage('BIA ID is required'),
  body('comments').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { biaId, comments } = req.body;

    console.log(`✅ Approving BIA: ${biaId}`);

    // Push to Fusion
    const fusionResult = await DataIntegrationService.pushToFusion(biaId, comments);

    // Update BIA status
    await BIAService.updateBIAStatus(biaId, 'approved', comments);

    res.json({
      success: true,
      fusionRecord: fusionResult,
      approvedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ BIA Approval Error:', error);
    res.status(500).json({
      error: 'Failed to approve BIA',
      message: error.message
    });
  }
});

/**
 * GET /api/bia/:id
 * Get BIA by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bia = await BIAService.getBIAById(id);
    
    if (!bia) {
      return res.status(404).json({ error: 'BIA not found' });
    }

    res.json(bia);
  } catch (error) {
    console.error('❌ Get BIA Error:', error);
    res.status(500).json({ error: 'Failed to retrieve BIA' });
  }
});

/**
 * GET /api/bia
 * List all BIAs with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { status, functionType, limit = 50, offset = 0 } = req.query;
    
    const biaList = await BIAService.listBIAs({
      status,
      functionType,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(biaList);
  } catch (error) {
    console.error('❌ List BIAs Error:', error);
    res.status(500).json({ error: 'Failed to list BIAs' });
  }
});

module.exports = router;
