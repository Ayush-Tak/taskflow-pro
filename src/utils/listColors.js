/**
 * List color utilities
 * Provides consistent color theming for lists based on their ID
 * Uses a predefined color palette with light and dark theme variants
 */

/**
 * Predefined color palette for lists
 * Each color has light and dark theme variants with background, border, and text colors
 * Colors are carefully chosen for good contrast and visual appeal
 */
export const LIST_COLORS = [
  // Blues - Professional and calming
  {
    light: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
    dark: { bg: '#1a237e', border: '#64b5f6', text: '#90caf9' }
  },
  // Greens - Natural and positive
  {
    light: { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' },
    dark: { bg: '#1b5e20', border: '#81c784', text: '#a5d6a7' }
  },
  // Oranges - Energetic and warm
  {
    light: { bg: '#fff3e0', border: '#ff9800', text: '#f57c00' },
    dark: { bg: '#e65100', border: '#ffb74d', text: '#ffcc02' }
  },
  // Purples - Creative and sophisticated
  {
    light: { bg: '#f3e5f5', border: '#9c27b0', text: '#7b1fa2' },
    dark: { bg: '#4a148c', border: '#ba68c8', text: '#ce93d8' }
  },
  // Teals - Balanced and refreshing
  {
    light: { bg: '#e0f2f1', border: '#009688', text: '#00695c' },
    dark: { bg: '#004d40', border: '#4db6ac', text: '#80cbc4' }
  },
  // Cyans - Modern and tech-focused
  {
    light: { bg: '#e1f5fe', border: '#00bcd4', text: '#0097a7' },
    dark: { bg: '#006064', border: '#4dd0e1', text: '#80deea' }
  },
  // Light Greens - Fresh and organic
  {
    light: { bg: '#f1f8e9', border: '#8bc34a', text: '#558b2f' },
    dark: { bg: '#33691e', border: '#aed581', text: '#c5e1a5' }
  },
  // Pinks - Playful and attention-grabbing
  {
    light: { bg: '#fce4ec', border: '#e91e63', text: '#c2185b' },
    dark: { bg: '#880e4f', border: '#f06292', text: '#f8bbd9' }
  },
  // Indigos - Deep and trustworthy
  {
    light: { bg: '#e8eaf6', border: '#3f51b5', text: '#303f9f' },
    dark: { bg: '#1a237e', border: '#7986cb', text: '#9fa8da' }
  },
  // Lime - Vibrant and energetic
  {
    light: { bg: '#f9fbe7', border: '#cddc39', text: '#827717' },
    dark: { bg: '#827717', border: '#dce775', text: '#f0f4c3' }
  },
  // Amber - Warm and inviting
  {
    light: { bg: '#fff8e1', border: '#ffc107', text: '#ff8f00' },
    dark: { bg: '#ff6f00', border: '#ffca28', text: '#fff176' }
  },
  // Brown - Earthy and stable
  {
    light: { bg: '#efebe9', border: '#795548', text: '#5d4037' },
    dark: { bg: '#3e2723', border: '#a1887f', text: '#bcaaa4' }
  },
];

/**
 * Generates a consistent color index for a list based on its ID
 * Uses string hashing to ensure the same ID always gets the same color
 *
 * @param {string} listId - Unique identifier for the list
 * @returns {number} Index into the LIST_COLORS array
 */
export const getListColorIndex = (listId) => {
  // Simple string hash function - converts string to number
  const hash = listId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a; // Convert to 32-bit integer
  }, 0);

  // Use modulo to get index within array bounds
  return Math.abs(hash) % LIST_COLORS.length;
};

/**
 * Gets the complete color set (light and dark variants) for a list
 *
 * @param {string} listId - Unique identifier for the list
 * @returns {Object} Color object with light and dark theme variants
 */
export const getListColorSet = (listId) => {
  const colorIndex = getListColorIndex(listId);
  return LIST_COLORS[colorIndex];
};
