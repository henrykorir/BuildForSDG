const getDays = (periodType, timeToElapse) => {
  let days = 0;
  if (periodType === 'months') {
    days = timeToElapse * 30;
  } else if (periodType === 'weeks') {
    days = timeToElapse * 7;
  } else {
    days = timeToElapse;
  }
  return days;
};
const getPower = (periodType, timeToElapse) => {
  const days = getDays(periodType, timeToElapse);
  const index = (days / 3);
  const power = 2 ** index;
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
  const power = getPower(input.periodType, input.timeToElapse);
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
  const result = Math.trunc(part1 - part2);
  return result;
};
// Cases For ICU By Requested Time
const ICU = (where, input) => IBRT(where, input) * 0.05;
// Cases For Ventilators By Requested Time
const CFVBRT = (where, input) => IBRT(where, input) * 0.02;
// Get Dollars Inflight
const DI = (where, input) => {
  const days = getDays(input.periodType, input.timeToElapse);
  const { region } = input;
  const avg = region.avgDailyIncomeInUSD * region.avgDailyIncomePopulation;
  const infectionsByRequestedTime = IBRT(where, input);
  return Math.trunc((infectionsByRequestedTime * avg) / days);
};
// Estimation function
const estimation = (input) => {
  const estimate = {
    impact: {
      currentlyInfected: CI('impact', input),
      infectionsByRequestedTime: IBRT('impact', input),
      severeCasesByRequestedTime: SCBRT('impact', input),
      hospitalBedsByRequestedTime: HBBR('impact', input),
      casesForICUByRequestedTime: ICU('impact', input),
      casesForVentilatorsByRequestedTime: CFVBRT('impact', input),
      dollarsInFlight: DI('impact', input)
    },
    severeImpact: {
      currentlyInfected: CI('severeImpact', input),
      infectionsByRequestedTime: IBRT('severeImpact', input),
      severeCasesByRequestedTime: IBRT('severeImpact', input),
      hospitalBedsByRequestedTime: HBBR('severeImpact', input),
      casesForICUByRequestedTime: ICU('severeImpact', input),
      casesForVentilatorsByRequestedTime: CFVBRT('severeImpact', input),
      dollarsInFlight: DI('severeImpact', input)
    }
  };
  return estimate;
};
const covid19ImpactEstimator = (data) => {
  const input = data;
  const estimate = estimation(input);
  return {
    data: input,
    estimate
  };
};
export default covid19ImpactEstimator;
