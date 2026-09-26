/**
 * AllBee's published customer-facing catalogue.
 * Invitation totals are authoritative for api/order-create.js.
 * Website prices are starting quotes; course prices are full-course fees.
 */
const invitationPricing = {
  'PDF Invitation': { Basic: 299, Premium: 599, Elite: 999 },
  'Website Invitation': { Basic: 999, Premium: 1999, Elite: 3999 },
  'Both (PDF + Website)': { Basic: 1299, Premium: 2499, Elite: 4999 },
};
const websitePackages = [
  { slug: 'basic', label: 'Basic Website', price: 9999, price_type: 'from' },
  { slug: 'business', label: 'Business Website', price: 19999, price_type: 'from' },
  { slug: 'ecommerce', label: 'E-Commerce', price: 34999, price_type: 'from' },
];
const marketingPackages = [
  { slug: 'starter', label: 'Starter', price: 999, price_type: 'monthly' },
  { slug: 'standard', label: 'Standard', price: 2999, price_type: 'monthly' },
  { slug: 'premium', label: 'Premium', price: 4999, price_type: 'monthly' },
  { slug: 'enterprise', label: 'Enterprise', price: 9999, price_type: 'monthly' },
];
const courses = [
  { slug: 'python', label: 'Python Programming', price: 2999, duration_days: 40 },
  { slug: 'ms-office', label: 'MS-Office Advanced', price: 2499, duration_days: 40 },
  { slug: 'photoshop', label: 'Photoshop Advanced', price: 2999, duration_days: 40 },
  { slug: 'spoken-english', label: 'Spoken English', price: 2999, duration_days: 45 },
  { slug: 'basic-computers', label: 'Basic Computers', price: 1799, duration_days: 30 },
  { slug: 'hardware', label: 'Hardware & Networking', price: 5999, duration_days: 60 },
];
const invitationSlugs = {
  'PDF Invitation': 'invitation-pdf',
  'Website Invitation': 'invitation-website',
  'Both (PDF + Website)': 'invitation-both',
};
const publicPricingRows = [
  ...Object.entries(invitationPricing).flatMap(([type, packages]) =>
    Object.entries(packages).map(([pkg, price]) => ({
      service_slug: invitationSlugs[type], package_slug: pkg.toLowerCase(),
      label: pkg + ' ' + type, price, price_type: 'fixed',
    }))),
  ...websitePackages.map(pkg => ({
    service_slug: 'website', package_slug: pkg.slug,
    label: pkg.label, price: pkg.price, price_type: pkg.price_type,
  })),
  ...marketingPackages.map(pkg => ({
    service_slug: 'marketing', package_slug: pkg.slug,
    label: pkg.label, price: pkg.price, price_type: pkg.price_type,
  })),
  ...courses.map(course => ({
    service_slug: 'course', package_slug: course.slug,
    label: course.label, price: course.price, price_type: 'fixed',
    duration_days: course.duration_days,
  })),
];
module.exports = {
  invitationPricing,
  websitePackages,
  marketingPackages,
  courses,
  events: ['Wedding','Nikah','Birthday','Housewarming','Dargah Event','School Event','Business Event','Political Event','Other'],
  publicPricingRows,
};
