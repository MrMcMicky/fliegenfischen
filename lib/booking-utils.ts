export const calculateLessonTotal = (
  priceCHF: number,
  hours: number,
  additionalPersonCHF: number,
  additionalPeople: number
) => {
  if (hours <= 0) return 0;
  const base = priceCHF * hours;
  const extra = additionalPersonCHF * hours * Math.max(0, additionalPeople);
  return base + extra;
};

export const normalizePrice = (value: number) => Math.max(0, Math.round(value));
