const getDays = (input) => {
  const { periodType } = input;
  const { timeToElapse } = input;
  let days = 0;
  if (periodType.trim() === 'months') days = timeToElapse * 30;
  if (periodType.trim() === 'weeks') days = timeToElapse * 7;
  if (periodType.trim() === 'days') days = timeToElapse;
  return days;
};
const getPower = (input) => {
  const days = getDays(input);
  const index = Math.trunc(days / 3);
  const power = (2 ** index);
  return power;
};
// Currently Infected
const CI = (where, input) => {
  let value = 0;
  if (where === 'impact') value = input.reportedCases * 10;
  else value = input.reportedCases * 50;
  return value;
};
// infections by request time
const IBRT = (where, input) => {
  const power = getPower(input);
  const value = power * CI(where, input);
  return value;
};
// severe Cases By RequestedTime
const SCBRT = (where, input) => {
  const value = IBRT(where, input) * 0.15;
  return value;
};
// Get Hospital Beds By RequestedTime:
const HBBR = (where, input) => {
  const part1 = 0.35 * input.totalHospitalBeds;
  const part2 = SCBRT(where, input);
  const result = part1 - part2;
  return result;
};
// Cases For ICU By Requested Time
const ICU = (where, input) => IBRT(where, input) * 0.05;
// Cases For Ventilators By Requested Time
const CFVBRT = (where, input) => IBRT(where, input) * 0.02;
// Get Dollars Inflight
const DI = (where, input) => {
  const days = getDays(input);
  const avg = input.region.avgDailyIncomeInUSD * input.region.avgDailyIncomePopulation;
  const infectionsByRequestedTime = IBRT(where, input);
  return ((infectionsByRequestedTime * avg) / days);
};
// Estimation function
const estimation = (input) => ({
  impact: {
    currentlyInfected: Math.trunc(CI('impact', input)),
    infectionsByRequestedTime: Math.trunc(IBRT('impact', input)),
    severeCasesByRequestedTime: Math.trunc(SCBRT('impact', input)),
    hospitalBedsByRequestedTime: Math.trunc(HBBR('impact', input)),
    casesForICUByRequestedTime: Math.trunc(ICU('impact', input)),
    casesForVentilatorsByRequestedTime: Math.trunc(CFVBRT('impact', input)),
    dollarsInFlight: Math.trunc(DI('impact', input))
  },
  severeImpact: {
    currentlyInfected: Math.trunc(CI('severeImpact', input)),
    infectionsByRequestedTime: Math.trunc(IBRT('severeImpact', input)),
    severeCasesByRequestedTime: Math.trunc(SCBRT('severeImpact', input)),
    hospitalBedsByRequestedTime: Math.trunc(HBBR('severeImpact', input)),
    casesForICUByRequestedTime: Math.trunc(ICU('severeImpact', input)),
    casesForVentilatorsByRequestedTime: Math.trunc(CFVBRT('severeImpact', input)),
    dollarsInFlight: Math.trunc(DI('severeImpact', input))
  }
});
const covid19ImpactEstimator = (data) => {
  const input = data;
  const estimate = estimation(input);
  return {
    data: input,
    estimate
  };
};
export default covid19ImpactEstimator;
