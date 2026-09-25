/**
 * Shared AllBee catalogue values used by server functions.
 * Keep customer-facing prices here; the public pricing endpoint exposes them
 * and the order API validates against the same values.
 */
module.exports = {
  invitationPricing: {
    'PDF Invitation': { Basic: 299, Premium: 599, Elite: 999 },
    'Website Invitation': { Basic: 999, Premium: 1999, Elite: 3999 },
    'Both (PDF + Website)': { Basic: 1299, Premium: 2499, Elite: 4999 },
  },
  events: ['Wedding', 'Nikah', 'Birthday', 'Housewarming', 'Dargah Event', 'School Event', 'Business Event', 'Political Event', 'Other'],
  publicPricingRows: [
    ['invitation-pdf', 'basic', 'Basic PDF', 299],
    ['invitation-pdf', 'premium', 'Premium PDF', 599],
    ['invitation-pdf', 'elite', 'Elite PDF', 999],
    ['invitation-website', 'basic', 'Basic Website', 999],
    ['invitation-website', 'premium', 'Premium Website', 1999],
    ['invitation-website', 'elite', 'Elite Website', 3999],
    ['invitation-both', 'basic', 'Basic PDF + Website', 1299],
    ['invitation-both', 'premium', 'Premium PDF + Website', 2499],
    ['invitation-both', 'elite', 'Elite PDF + Website', 4999],
  ].map(([service_slug, package_slug, label, price]) => ({ service_slug, package_slug, label, price })),
};
