import { THEMES } from './constants';

export function coverageMatrix(stories) {
  return THEMES.map((theme) => {
    const count = stories.filter((s) => (s.themes || []).includes(theme)).length;
    return { theme, covered: count > 0, count };
  });
}
