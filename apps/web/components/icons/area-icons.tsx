/** Maps area names to material-symbols-outlined icon names */
export function getAreaIconName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('piscina') || n.includes('natação')) return 'pool'
  if (n.includes('churras')) return 'outdoor_grill'
  if (n.includes('tênis') || n.includes('tenis')) return 'sports_tennis'
  if (n.includes('basquete') || n.includes('basket')) return 'sports_basketball'
  if (n.includes('futebol') || n.includes('campo')) return 'sports_soccer'
  if (n.includes('quadra') || n.includes('poliesport')) return 'sports_court'
  if (n.includes('academia') || n.includes('ginásio') || n.includes('fitness')) return 'fitness_center'
  if (n.includes('salão') || n.includes('festa') || n.includes('evento')) return 'celebration'
  return 'meeting_room'
}
