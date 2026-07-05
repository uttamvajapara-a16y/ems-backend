const validatePayrollMonth = (month, year) => {
  const requestedMonth = Number(month);
  const requestedYear = Number(year);

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JS months are 0-indexed, so add 1
  const currentYear = now.getFullYear();

  if (requestedYear > currentYear) {
    return { valid: false, message: "Cannot generate payroll for a future year" };
  }

  if (requestedYear === currentYear && requestedMonth >= currentMonth) {
    return { valid: false, message: "Cannot generate payroll for the current or a future month" };
  }

  return { valid: true };
};

module.exports = { validatePayrollMonth };