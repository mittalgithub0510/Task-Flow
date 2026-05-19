export const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
  return Math.round((completed / tasks.length) * 100);
};
