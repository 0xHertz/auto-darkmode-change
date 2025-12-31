export function getSunTimes(date, lat, lng) {
  const rad = Math.PI / 180;

  const day = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
      86400000,
  );

  const lngHour = lng / 15;

  function calc(isRise) {
    const t = day + ((isRise ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;

    let L =
      M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
    L = (L + 360) % 360;

    let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
    RA = (RA + 360) % 360;

    const Lq = Math.floor(L / 90) * 90;
    const RAq = Math.floor(RA / 90) * 90;
    RA = (RA + Lq - RAq) / 15;

    const sinDec = 0.39782 * Math.sin(L * rad);
    const cosDec = Math.cos(Math.asin(sinDec));

    const cosH =
      (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) /
      (cosDec * Math.cos(lat * rad));

    let H = isRise ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad;
    H /= 15;

    let T = H + RA - 0.06571 * t - 6.622;
    let UT = (T - lngHour) % 24;
    if (UT < 0) UT += 24;

    const d = new Date(date);
    d.setUTCHours(Math.floor(UT), Math.floor((UT % 1) * 60), 0);
    return d;
  }

  return {
    sunrise: calc(true),
    sunset: calc(false),
  };
}
