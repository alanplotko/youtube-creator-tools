/* eslint-disable import/prefer-default-export */

export function truncateString(str, num = 15) {
  if (str.length > num) {
    return `${str.slice(0, num)}...`;
  }
  return str;
}

export function shortenString(str, num = 20) {
  if (str.length > num) {
    return `${str.substr(0, 10)}...${str.substr(-8)}`;
  }
  return str;
}
