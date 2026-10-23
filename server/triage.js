'use strict';
// Single source of truth for triage: emergency category -> responder types to notify.
const TRIAGE = {
  medical: ['hospital'],
  accident: ['hospital', 'police'],
  breakdown: ['mechanic'],
  fuel: ['fuel_pump']
};
// Which categories each responder type can ever receive (used for console role views).
const ROLE_CATEGORIES = {};
for (const [cat, types] of Object.entries(TRIAGE)) {
  for (const t of types) (ROLE_CATEGORIES[t] = ROLE_CATEGORIES[t] || []).push(cat);
}
const TRIGGERS = ['manual', 'crash_auto'];
module.exports = { TRIAGE, ROLE_CATEGORIES, TRIGGERS };
