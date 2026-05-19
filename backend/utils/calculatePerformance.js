export const calculatePerformance = (action) => {
  switch (action) {
    case 'on-time': return 10;
    case 'late': return -5;
    case 'approved': return 15;
    case 'rejected': return -10;
    default: return 0;
  }
};
