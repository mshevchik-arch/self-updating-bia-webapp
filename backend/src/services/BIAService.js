const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');

class BIAService {
  
  /**
   * Generate comprehensive BIA document with auto-populated data
   */
  static async generateBIA(biaRequest) {
    try {
      const {
        functionName,
        functionType,
        driName,
        driTeam,
        regionalOverlays,
        autoPopulatedData
      } = biaRequest;

      console.log(`📋 Generating BIA document for: ${functionName}`);

      const biaId = uuidv4();
      const generatedAt = new Date();

      // Generate comprehensive BIA document
      const biaDocument = {
        // Basic Information
        id: biaId,
        function_name: functionName,
        function_type: functionType,
        dri_name: driName,
        dri_team: driTeam,
        generated_at: generatedAt.toISOString(),
        status: 'draft',
        version: '1.0',

        // Auto-populated sections
        personnel_information: this.generatePersonnelSection(autoPopulatedData.hr, autoPopulatedData.pagerDuty),
        business_impact: this.generateBusinessImpactSection(autoPopulatedData.financial, autoPopulatedData.predictions),
        technology_dependencies: this.generateTechnologySection(autoPopulatedData.registry),
        recovery_requirements: this.generateRecoverySection(autoPopulatedData.predictions, autoPopulatedData.monitoring),
        risk_compliance: this.generateRiskComplianceSection(autoPopulatedData.registry, functionType),
        iso_22301_compliance: this.generateISO22301Section(functionType, autoPopulatedData.predictions),

        // Regional overlays
        regional_overlays: regionalOverlays ? this.generateRegionalOverlays(regionalOverlays) : [],

        // Predictive analysis from Rooster
        predictive_analysis: autoPopulatedData.predictions,

        // Data source tracking
        data_sources: this.generateDataSourceSummary(autoPopulatedData),

        // Confidence scoring
        confidence_assessment: this.calculateConfidenceScores(autoPopulatedData)
      };

      // Store BIA in database (scaffolding)
      await this.storeBIA(biaDocument);

      return biaDocument;

    } catch (error) {
      console.error('❌ BIA generation error:', error);
      throw error;
    }
  }

  /**
   * Generate personnel information section
   */
  static generatePersonnelSection(hrData, pagerDutyData) {
    return {
      team_size: hrData?.team_size || 'Unknown',
      key_personnel: hrData?.key_personnel || [
        { name: 'Tech Lead (TBD)', role: 'Technical Leadership', backup: 'Senior Engineer' },
        { name: 'Product Manager (TBD)', role: 'Product Strategy', backup: 'Associate PM' },
        { name: 'Operations Manager (TBD)', role: 'Operations', backup: 'Senior Ops' }
      ],
      escalation_policy: pagerDutyData?.escalation_policy || 'Standard escalation path',
      on_call_schedule: pagerDutyData?.on_call_schedule || '24/7 rotation',
      manager_chain: hrData?.manager_chain || ['Team Lead', 'Manager', 'Director', 'VP'],
      business_hours: hrData?.business_hours || '24/7 operations',
      confidence_score: Math.min(
        (hrData?.confidence_score || 0.5),
        (pagerDutyData?.confidence_score || 0.5)
      ),
      data_sources: ['HR Systems', 'PagerDuty'],
      auto_populated: true
    };
  }

  /**
   * Generate business impact section
   */
  static generateBusinessImpactSection(financialData, predictions) {
    const impactMatrix = this.calculateImpactMatrix(financialData);
    
    return {
      daily_revenue_impact: financialData?.daily_revenue_impact || 'TBD',
      monthly_revenue_impact: financialData?.monthly_revenue_impact || 'TBD',
      active_customers: financialData?.active_customers || 'TBD',
      transaction_volume: financialData?.transaction_volume || { daily: 'TBD', peak_hourly: 'TBD' },
      customer_segments: financialData?.customer_segments || { enterprise: 'TBD', smb: 'TBD', consumer: 'TBD' },
      
      impact_timeline: {
        '1_4_hours': impactMatrix.low,
        '4_24_hours': impactMatrix.medium,
        '1_7_days': impactMatrix.high,
        '7_plus_days': impactMatrix.critical
      },
      
      predictive_impact: {
        twelve_month_forecast: predictions?.performance_predictions?.availability_forecast || 'TBD',
        risk_level: predictions?.risk_assessment?.overall_risk || 'Medium',
        improvement_potential: predictions?.rto_analysis?.improvement_potential || 'TBD'
      },
      
      confidence_score: financialData?.confidence_score || 0.6,
      data_sources: ['Financial Systems', 'Analytics APIs', 'Rooster Predictions'],
      auto_populated: true
    };
  }

  /**
   * Generate technology dependencies section
   */
  static generateTechnologySection(registryData) {
    return {
      core_technologies: registryData?.technology_stack || ['Unknown'],
      service_dependencies: registryData?.dependencies || ['Unknown'],
      reliability_tier: registryData?.reliability_tier || 'Unknown',
      deployment_info: registryData?.deployment_info || {
        regions: ['Unknown'],
        replicas: 'Unknown',
        auto_scaling: 'Unknown'
      },
      documentation: {
        runbook_url: registryData?.runbook_url || 'TBD',
        documentation_url: registryData?.documentation_url || 'TBD',
        slack_channel: registryData?.slack_channel || 'TBD'
      },
      confidence_score: registryData?.confidence_score || 0.7,
      data_sources: ['Registry (Snowflake)', 'CMDB'],
      auto_populated: true
    };
  }

  /**
   * Generate recovery requirements section
   */
  static generateRecoverySection(predictions, monitoringData) {
    return {
      rto: {
        current: predictions?.rto_analysis?.current_estimate || '4 hours',
        target: predictions?.rto_analysis?.twelve_month_forecast || '2 hours',
        confidence: predictions?.rto_analysis?.confidence_score || 0.7
      },
      rpo: {
        current: predictions?.rpo_analysis?.current_estimate || '1 hour',
        target: predictions?.rpo_analysis?.twelve_month_forecast || '30 minutes',
        confidence: predictions?.rpo_analysis?.confidence_score || 0.7
      },
      current_availability: monitoringData?.current_availability || '99.5%',
      sla_target: monitoringData?.sla_target || '99.9%',
      mttr: monitoringData?.performance_metrics?.avg_response_time || 'TBD',
      
      recovery_timeline: {
        detection: '0-15 minutes',
        initial_response: '15-30 minutes',
        mitigation: '30 minutes - 2 hours',
        full_recovery: '2-4 hours'
      },
      
      scenarios: predictions?.scenarios || {
        best_case: { rto: 'TBD', rpo: 'TBD', probability: '25%' },
        most_likely: { rto: 'TBD', rpo: 'TBD', probability: '50%' },
        worst_case: { rto: 'TBD', rpo: 'TBD', probability: '25%' }
      },
      
      confidence_score: Math.min(
        (predictions?.confidence_overall || 0.7),
        (monitoringData?.confidence_score || 0.7)
      ),
      data_sources: ['Rooster Predictions', 'Monitoring Systems', 'Historical Data'],
      auto_populated: true
    };
  }

  /**
   * Generate risk and compliance section
   */
  static generateRiskComplianceSection(registryData, functionType) {
    const complianceRequirements = this.getComplianceRequirements(functionType);
    
    return {
      compliance_requirements: complianceRequirements,
      data_classification: this.getDataClassification(functionType),
      regulatory_impact: this.getRegulatoryImpact(functionType),
      security_considerations: [
        'Data encryption in transit and at rest',
        'Access controls and authentication',
        'Audit logging and monitoring',
        'Incident response procedures'
      ],
      confidence_score: 0.8,
      data_sources: ['Compliance Database', 'Security Policies'],
      auto_populated: true
    };
  }

  /**
   * Generate ISO 22301 compliance section
   */
  static generateISO22301Section(functionType, predictions) {
    return {
      business_function_classification: this.getBCMClassification(functionType),
      mtpd: this.getMTPD(functionType),
      mbco: this.getMBCO(functionType),
      resource_requirements: this.getResourceRequirements(functionType),
      
      continuity_strategies: [
        'Automated failover procedures',
        'Geographic redundancy',
        'Data backup and recovery',
        'Alternative processing sites'
      ],
      
      testing_requirements: {
        frequency: 'Quarterly',
        scope: 'Full system recovery',
        success_criteria: 'RTO/RPO targets met',
        next_test_date: this.getNextTestDate()
      },
      
      risk_assessment: predictions?.risk_assessment || {
        overall_risk: 'Medium',
        risk_factors: ['Standard operational risks'],
        mitigation_recommendations: ['Standard mitigation strategies']
      },
      
      confidence_score: 0.85,
      data_sources: ['ISO 22301 Framework', 'BCM Policies', 'Rooster Analysis'],
      auto_populated: true
    };
  }

  /**
   * Generate regional overlay sections
   */
  static generateRegionalOverlays(regionalOverlays) {
    return regionalOverlays.map(overlay => ({
      region: overlay.region,
      legal_entity: this.getLegalEntity(overlay.region),
      regulatory_framework: this.getRegulatoryFramework(overlay.region),
      data_residency: this.getDataResidency(overlay.region),
      local_requirements: this.getLocalRequirements(overlay.region),
      regional_rto: this.getRegionalRTO(overlay.region),
      regional_rpo: this.getRegionalRPO(overlay.region),
      confidence_score: 0.75,
      auto_populated: true
    }));
  }

  /**
   * Generate data source summary
   */
  static generateDataSourceSummary(autoPopulatedData) {
    const sources = [];
    
    if (autoPopulatedData.registry) sources.push({
      name: 'Registry (Snowflake)',
      status: 'connected',
      confidence: autoPopulatedData.registry.confidence_score,
      last_updated: autoPopulatedData.registry.last_updated
    });
    
    if (autoPopulatedData.pagerDuty) sources.push({
      name: 'PagerDuty',
      status: 'connected',
      confidence: autoPopulatedData.pagerDuty.confidence_score,
      last_updated: autoPopulatedData.pagerDuty.last_updated
    });
    
    if (autoPopulatedData.hr) sources.push({
      name: 'HR Systems',
      status: 'connected',
      confidence: autoPopulatedData.hr.confidence_score,
      last_updated: autoPopulatedData.hr.last_updated
    });
    
    if (autoPopulatedData.financial) sources.push({
      name: 'Financial Systems',
      status: 'connected',
      confidence: autoPopulatedData.financial.confidence_score,
      last_updated: autoPopulatedData.financial.last_updated
    });
    
    if (autoPopulatedData.monitoring) sources.push({
      name: 'Monitoring Systems',
      status: 'connected',
      confidence: autoPopulatedData.monitoring.confidence_score,
      last_updated: autoPopulatedData.monitoring.last_updated
    });
    
    if (autoPopulatedData.predictions) sources.push({
      name: 'Rooster Predictions',
      status: 'connected',
      confidence: autoPopulatedData.predictions.confidence_overall,
      last_updated: autoPopulatedData.predictions.generated_at
    });
    
    return sources;
  }

  /**
   * Calculate overall confidence scores
   */
  static calculateConfidenceScores(autoPopulatedData) {
    const scores = [];
    
    if (autoPopulatedData.registry?.confidence_score) scores.push(autoPopulatedData.registry.confidence_score);
    if (autoPopulatedData.pagerDuty?.confidence_score) scores.push(autoPopulatedData.pagerDuty.confidence_score);
    if (autoPopulatedData.hr?.confidence_score) scores.push(autoPopulatedData.hr.confidence_score);
    if (autoPopulatedData.financial?.confidence_score) scores.push(autoPopulatedData.financial.confidence_score);
    if (autoPopulatedData.monitoring?.confidence_score) scores.push(autoPopulatedData.monitoring.confidence_score);
    if (autoPopulatedData.predictions?.confidence_overall) scores.push(autoPopulatedData.predictions.confidence_overall);
    
    const overallConfidence = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
    
    return {
      overall_confidence: Math.round(overallConfidence * 100) / 100,
      data_completeness: (scores.length / 6) * 100, // 6 possible data sources
      confidence_level: overallConfidence >= 0.8 ? 'High' : overallConfidence >= 0.6 ? 'Medium' : 'Low',
      recommendations: overallConfidence < 0.7 ? [
        'Verify data source connections',
        'Update missing information',
        'Schedule data validation review'
      ] : []
    };
  }

  // Helper methods for ISO 22301 and regional compliance
  static getBCMClassification(functionType) {
    const classifications = {
      'product': 'Critical - Customer Facing',
      'platform': 'Important - Business Enabling',
      'support': 'Supporting - Internal Operations',
      'infrastructure': 'Critical - Foundation Service',
      'compliance': 'Important - Regulatory Required'
    };
    return classifications[functionType] || 'To Be Determined';
  }

  static getMTPD(functionType) {
    const mtpds = {
      'product': '2 hours',
      'platform': '4 hours',
      'support': '24 hours',
      'infrastructure': '1 hour',
      'compliance': '8 hours'
    };
    return mtpds[functionType] || '4 hours';
  }

  static getMBCO(functionType) {
    const mbcos = {
      'product': '80% capacity within MTPD',
      'platform': '60% capacity within MTPD',
      'support': '50% capacity within MTPD',
      'infrastructure': '95% capacity within MTPD',
      'compliance': '70% capacity within MTPD'
    };
    return mbcos[functionType] || '60% capacity within MTPD';
  }

  static getResourceRequirements(functionType) {
    const resources = {
      'product': 'Dedicated DR site, 24/7 support',
      'platform': 'Hot standby, business hours support',
      'support': 'Workarounds, extended hours support',
      'infrastructure': 'Real-time replication, immediate response',
      'compliance': 'Backup systems, priority restoration'
    };
    return resources[functionType] || 'Standard backup procedures';
  }

  static calculateImpactMatrix(financialData) {
    return {
      low: 'Minimal customer impact, <$100K revenue',
      medium: 'Moderate customer impact, $100K-$1M revenue',
      high: 'Significant customer impact, $1M-$10M revenue',
      critical: 'Severe customer impact, >$10M revenue'
    };
  }

  static getComplianceRequirements(functionType) {
    const requirements = {
      'product': ['PCI-DSS', 'SOX Controls', 'Data Privacy'],
      'platform': ['SOX Controls', 'Data Privacy', 'Security Standards'],
      'support': ['Data Privacy', 'Access Controls'],
      'infrastructure': ['Security Standards', 'Audit Logging', 'Change Management'],
      'compliance': ['All Applicable Standards', 'Regulatory Reporting', 'Audit Trail']
    };
    return requirements[functionType] || ['Standard Controls'];
  }

  static getDataClassification(functionType) {
    return functionType === 'product' ? 'PII/Financial' : 'Internal/Confidential';
  }

  static getRegulatoryImpact(functionType) {
    return functionType === 'product' ? 'High - Customer facing' : 'Medium - Internal operations';
  }

  static getLegalEntity(region) {
    const entities = {
      'na': 'Block, Inc. (Delaware)',
      'eu': 'Block Europe Limited (Ireland)',
      'apac': 'Block Japan KK'
    };
    return entities[region] || 'TBD';
  }

  static getRegulatoryFramework(region) {
    const frameworks = {
      'na': 'SOX/FDIC',
      'eu': 'GDPR/DORA',
      'apac': 'JFSA (Japan)'
    };
    return frameworks[region] || 'Local Regulations';
  }

  static getDataResidency(region) {
    const residency = {
      'na': 'US/Canada Only',
      'eu': 'EU Only',
      'apac': 'Local + Singapore'
    };
    return residency[region] || 'Local Requirements';
  }

  static getLocalRequirements(region) {
    return ['Data localization', 'Local incident reporting', 'Regulatory notifications'];
  }

  static getRegionalRTO(region) {
    const rtos = {
      'na': '2 hours',
      'eu': '4 hours',
      'apac': '6 hours'
    };
    return rtos[region] || '4 hours';
  }

  static getRegionalRPO(region) {
    const rpos = {
      'na': '30 minutes',
      'eu': '1 hour',
      'apac': '2 hours'
    };
    return rpos[region] || '1 hour';
  }

  static getNextTestDate() {
    const nextQuarter = new Date();
    nextQuarter.setMonth(nextQuarter.getMonth() + 3);
    return format(nextQuarter, 'yyyy-MM-dd');
  }

  // Database operations (scaffolding)
  static async storeBIA(biaDocument) {
    // TODO: Implement actual database storage
    console.log(`💾 Storing BIA: ${biaDocument.id}`);
    // This would store in PostgreSQL
    return biaDocument.id;
  }

  static async getBIAById(id) {
    // TODO: Implement actual database retrieval
    console.log(`📖 Retrieving BIA: ${id}`);
    return null; // Placeholder
  }

  static async updateBIAStatus(id, status, comments) {
    // TODO: Implement actual database update
    console.log(`📝 Updating BIA status: ${id} -> ${status}`);
    return true;
  }

  static async listBIAs(filters) {
    // TODO: Implement actual database query
    console.log(`📋 Listing BIAs with filters:`, filters);
    return []; // Placeholder
  }
}

module.exports = BIAService;
