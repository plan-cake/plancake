export const PARTICIPANTS = ["Mickey", "Goofy", "Donald", "You"];

export const generateTimeslots = () => {
  const slots = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 12; j++) {
      const date = new Date(2025, 9, 19 + i, 8);
      // advance by 15 minutes each
      date.setMinutes(date.getMinutes() + j * 15);
      slots.push(date);
    }
  }
  return slots;
};

export const generateAvailabilities = (timeslots: Date[]) => {
  const availabilities: Record<string, string[]> = {};
  for (let i = 0; i < timeslots.length; i++) {
    const slotIso = timeslots[i].toISOString();
    const available = [];
    if ((i >= 4 && i < 22) || (i >= 28 && i < 34))
      available.push(PARTICIPANTS[0]);
    if ((i >= 0 && i < 20) || (i >= 30 && i < 36))
      available.push(PARTICIPANTS[1]);
    if ((i >= 3 && i < 12) || (i >= 15 && i < 23) || (i >= 26 && i < 34))
      available.push(PARTICIPANTS[2]);
    availabilities[slotIso] = available;
  }
  return availabilities;
};

export const TIMESLOTS = generateTimeslots();
export const INITIAL_AVAILABILITIES = generateAvailabilities(TIMESLOTS);
