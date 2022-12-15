export const isJSON = (str = '') => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}