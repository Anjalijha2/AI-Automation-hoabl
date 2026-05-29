'use strict';

const { sequelize } = require('../connection');

async function getActiveCampaign() {
  return sequelize.query(
    `SELECT * FROM allocation_campaigns WHERE status = 'ACTIVE' AND deleted_at IS NULL ORDER BY start_time DESC LIMIT 1`,
    { type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getCampaigns(limit = 20) {
  return sequelize.query(
    'SELECT * FROM allocation_campaigns WHERE deleted_at IS NULL ORDER BY start_time DESC LIMIT :limit',
    { replacements: { limit }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getCampaignUnits(campaignId) {
  return sequelize.query(
    'SELECT * FROM allocation_campaign_units WHERE allocation_campaign_id = :campaignId',
    { replacements: { campaignId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getCampaignBatches(campaignId) {
  return sequelize.query(
    'SELECT * FROM allocation_batches WHERE allocation_campaign_id = :campaignId ORDER BY id',
    { replacements: { campaignId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getOffersByCode(offerCode) {
  return sequelize.query(
    'SELECT * FROM offers WHERE offer_code = :offerCode AND deleted_at IS NULL',
    { replacements: { offerCode }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getActiveOffers() {
  return sequelize.query(
    'SELECT * FROM offers WHERE is_active = 1 AND deleted_at IS NULL',
    { type: sequelize.QueryTypes.SELECT }
  );
}

async function getRegistrationUnitOffers(registrationUnitId) {
  return sequelize.query(
    'SELECT * FROM registration_unit_offers WHERE registration_unit_id = :registrationUnitId',
    { replacements: { registrationUnitId }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = {
  getActiveCampaign,
  getCampaigns,
  getCampaignUnits,
  getCampaignBatches,
  getOffersByCode,
  getActiveOffers,
  getRegistrationUnitOffers,
};
