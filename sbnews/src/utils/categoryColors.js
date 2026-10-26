// One accent color per category, used for badges, card accent stripes,
// and the category pills — this is what gives the vibrant redesign its
// "color-coded sections" feel instead of everything being a single teal.
export const CATEGORY_COLORS = {
  // general: '#22D3EE',       // cyan
  // business: '#F59E0B',      // amber
  // technology: '#8B5CF6',    // violet
  // science: '#38BDF8',       // sky blue
  // health: '#FB7185',        // rose
  // sports: '#84CC16',        // lime
  // entertainment: '#EC4899', // pink
  // top: '#22D3EE',
  // world: '#22D3EE'
}

export const getCategoryColor = (category) => CATEGORY_COLORS[category?.toLowerCase()] || '#22D3EE'
