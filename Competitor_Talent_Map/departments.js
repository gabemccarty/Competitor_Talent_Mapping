/**
 * Map job title keywords to department names (same as README spec).
 */
const DEPARTMENT_KEYWORDS = [
  { dept: 'AI & Machine Learning', keywords: ['machine learning', 'ml ', ' ml', 'applied scientist'] },
  { dept: 'Perception', keywords: ['perception'] },
  { dept: 'Motion Planning', keywords: ['planning', 'planner', 'prediction'] },
  { dept: 'Simulation', keywords: ['simulation', ' sim ', 'simulation'] },
  { dept: 'Software Engineering', keywords: ['software engineer'] },
  { dept: 'Systems Engineering', keywords: ['system engineer', 'systems engineer'] },
  { dept: 'Hardware Engineering', keywords: ['hardware'] },
  { dept: 'Infrastructure & Platform', keywords: ['infrastructure', 'platform', 'cloud'] },
  { dept: 'Data Engineering', keywords: ['data engineer', 'data platform'] },
  { dept: 'Product Management', keywords: ['product manager', 'product management'] },
  { dept: 'Product Design', keywords: ['product design', ' ux ', ' ui ', 'ux design', 'ui design'] },
  { dept: 'Technical Program Management', keywords: ['program manager', ' tpm ', 'technical program'] },
  { dept: 'Safety', keywords: ['safety'] },
  { dept: 'Test & Validation', keywords: ['test', 'validation', 'sdet', ' qa '] },
  { dept: 'Fleet Operations', keywords: ['fleet', 'operations'] },
];

export const departmentColors = {
  'AI & Machine Learning': '#3498DB',
  'Perception': '#3498DB',
  'Motion Planning': '#3498DB',
  'Simulation': '#16A085',
  'Software Engineering': '#27AE60',
  'Systems Engineering': '#E67E22',
  'Hardware Engineering': '#9B59B6',
  'Infrastructure & Platform': '#7F8C8D',
  'Data Engineering': '#27AE60',
  'Product Management': '#E91E63',
  'Product Design': '#E91E63',
  'Technical Program Management': '#E91E63',
  'Safety': '#F39C12',
  'Test & Validation': '#F39C12',
  'Fleet Operations': '#7F8C8D',
  'Other': '#95A5A6',
};

export function inferDepartment(title) {
  if (!title || typeof title !== 'string') return 'Other';
  const t = title.toLowerCase();
  for (const { dept, keywords } of DEPARTMENT_KEYWORDS) {
    if (keywords.some((kw) => t.includes(kw.toLowerCase()))) return dept;
  }
  return 'Other';
}
