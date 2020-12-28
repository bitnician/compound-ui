exports.roundToTwo = (num) => {
  return +(Math.round(num + 'e+2') + 'e-2');
};

exports.capitalizeFirstLetter = (string) => {
  const lower = string.toLowerCase();
  return lower[0].toUpperCase() + lower.slice(1);
};
