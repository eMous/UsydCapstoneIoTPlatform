// V1.2.0
// ReadMe
// All the Class as a type in the property WILL NOT stored in firebase as redundancy. Instead, the reference id will be stored.
// ------------------------- Entities & Relationships -------------------------

import moment from "moment";
import { Cursor, Double } from "mongodb";
import { number } from "prop-types";
import { updateExpressionWithTypeArguments } from "typescript";
import cache from "../../cache";

/*
 * The reaseon all properties are followed with `= undefined` is
 * If the property doesn't have a default value, it will be ignored when transpiling
 * and then I can never get the property information in runtime.
 */
class Configureable {
  constantConf: number = undefined; // default is the latest (cache may get the latest id)
  customizedConf: Record<string, unknown> = undefined; // overwrite some key-value in constantConf
}
export async function getConf(configurable: Configureable) {
  const conf = await cache.mongoGet({
    collection: ConstantConf.name,
    docId: configurable.constantConf,
  });
  if (configurable.customizedConf) {
    for (const key in configurable.customizedConf) {
      if (
        Object.prototype.hasOwnProperty.call(configurable.customizedConf, key)
      ) {
        const element = configurable.customizedConf[key];
        conf[key] = element;
      }
    }
  }
  return conf;
}
export class ProjectOwner extends Configureable {
  // Authentication
  email: string = undefined;
  phoneNum: number = undefined;
  imageBase64: string = undefined;
  // Basic information
  name: string = undefined;
  organisation: string = undefined;
  researchFields: number[] = undefined; // Element : indexs of RESEARCH_FIELD in ConstantConf

  // Funding Side
  balance: number = undefined;
  inFundingAccounts: Record<string, InFundingAccount> = undefined; // InFundingAccount;
  totalHasFundedMoney: number = undefined; // The total number where the fund have been exchanged to Participant balance
  totalAmountDataCollected: number = undefined; // The total records number of all the projects
  // Project Side
  projects: string[] = undefined; // Project document id (not path)
}

export class InFundingAccount {
  // Project ID
  projectId: Project | string = undefined;
  // The total number set as fund
  totalFund: number = undefined;
  // The number that has been exchanged to Participant's balance by Points
  exchangedAmount: number = undefined;

  conversionRate: number = undefined;
}

export class Project extends Configureable {
  // Basic information
  prjTitle: string = undefined;
  prjDescription: string = undefined;
  prjOwner: ProjectOwner = undefined;
  prjStartTime: Date = undefined;

  prjResearchField: number = undefined; // Element : indexs of RESEARCH_FIELD in ConstantConf

  // Fund Side
  inFundingAccount: InFundingAccount = undefined;

  prjRequirements: ProjectRequirement[] = undefined;
  prjGoals: ProjectGoal[] = undefined;

  records: SensorRecord[] = undefined;
  prjComplete = false;

  // Notification and Matchmaking
  matchmakingEnable: boolean = undefined;
  desiredParticipantNumber: number = undefined; // limited by PROJECT_MAX_PARTICIPANT_NUM_IN_A_PRJ && default is PROJECT_DEFAULT_PARTICIPANT_NUM_IN_A_PRJ
  // 1 > 2 && 2 = 3+4+5+6
  inMatchMakingParticipants: string[] = []; // 1 : length limited by IN_MATCHMAKING_NUM_LIMIT
  allInvitedParticipants: string[] = []; // 2 : length limited by IN_INVITATION_NUM_LIMIT
  inSendingOrDroppedParticipants: { email: string; sentTime: Date }[] = []; // 3
  receivedButNotAnsweredParticipants: string[] = []; // 4
  acceptedParticipants: string[] = []; // 5
  deniedParticipants: string[] = []; // 6
  inProjectParticipants: string[] = []; // 7
  leftParticipants: string[] = []; // 7
  inviteBlackList: string[] = []; // the participants are failed notified for more than PROJECT_REPUSH_TIMES_FOR_SPECIFIC_PARTICIPANT times
  prjStatistic: Array<SensorStatistic> = [];

  // For the Incentive Model
  // This flag determines if point redemption is allowed if the project is not yet completed
  // If set to true, then only if the project is completed, will the participant be allowed to
  // redeem any points
  isFullRedeemOnly: false; 

  highlightedIssues: {
    issueCreateTime: string;
    issueParticipant: Participant;
    issueMessage: string;
    issueKind: number;
    chosenWhetherToAlert: number; // 1 yes, 2 no, 3 undecided
  }[] = undefined;
  participantsNoMoreIssues: Participant[] = undefined; // white list for the further issues
}
export class SensorStatistic {
  collectedNum: number = undefined;
  goalNum: number = undefined;
  sensorId: string = undefined;
}
export class ProjectRequirement {
  requirementType: string = undefined; // LastGeoPrjRequirement
  seriousness: number = undefined; // 1 - 5, 1 = Lowest, 5 = Highest
  static getAllRequirements(): Array<typeof ProjectRequirement> {
    return [
      LastGeoPrjRequirement,
      MobileSystemPrjRequirement,
      MobileDeviceTypePrjRequirement,
      AndroidAPIPrjRequirement,
      SensorPrjRequirement,
      GenderPrjRequirement,
      DeviceModelPrjRequirement,
    ];
  }
  async validate() {
    const seriousnessVal = Number(this.seriousness);
    if (
      !(
        Number.isInteger(seriousnessVal) &&
        seriousnessVal >= 1 &&
        seriousnessVal <= 5
      )
    ) {
      return Promise.reject("The seriousness should be 1-5.");
    }
    return true;
  }
}
export class LastGeoPrjRequirement extends ProjectRequirement {
  async validate() {
    await super.validate();
    const gpsPoint = this.gpsPoint as any;
    if (gpsPoint == undefined) {
      return Promise.reject("The lat and the lon should be provided.");
    }
    const latVal = Number(gpsPoint["lat"]);
    const lonVal = Number(gpsPoint["lon"]);
    if (!(latVal >= -90 && latVal <= 90 && lonVal <= 180 && lonVal >= -180)) {
      return Promise.reject(
        "The lat and the lon should be `-90`-`90` and `-180`-`180`."
      );
    }

    const radiusVal = Number(this.radius);
    if (!(radiusVal >= 1000 && radiusVal <= 50000)) {
      return Promise.reject(
        "The radius should be constrained between [1000,50000]."
      );
    }
    return true;
  }
  gpsPoint: { lat: number; lon: number } = undefined;
  radius: number = undefined; // meter
}

export class MobileSystemPrjRequirement extends ProjectRequirement {
  mobileSystems: Array<string> = undefined;
  async validate() {
    await super.validate();
    const validSystems = MobileSystemPrjRequirement.getValidSystems();
    if (
      !(this.mobileSystems instanceof Array && this.mobileSystems.length > 0)
    ) {
      return Promise.reject("An array of MobileSystem(s) should be provided.");
    }
    if (!this.mobileSystems.every((el) => validSystems.includes(el))) {
      return Promise.reject("System has to one(s) of " + validSystems);
    }
    return true;
  }
  static getValidSystems() {
    return ["Android", "iOS"];
  }
}

export class MobileDeviceTypePrjRequirement extends ProjectRequirement {
  mobileDeviceTypes: Array<string> = undefined;
  async validate() {
    await super.validate();
    const validDeviceTypes =
      MobileDeviceTypePrjRequirement.getValidDeviceTypes();
    if (
      !(
        this.mobileDeviceTypes instanceof Array &&
        this.mobileDeviceTypes.length > 0
      )
    ) {
      return Promise.reject(
        "An array of Mobile Device Type(s) should be provided."
      );
    }
    if (!this.mobileDeviceTypes.every((el) => validDeviceTypes.includes(el))) {
      return Promise.reject(
        "mobileDeviceType has to one(s) of " + validDeviceTypes
      );
    }
    return true;
  }
  static getValidDeviceTypes() {
    return ["Mobile Phone", "Wearable Device"];
  }
}

export class AndroidAPIPrjRequirement extends ProjectRequirement {
  minAPILevel: number = undefined;
  maxAPILevel: number = undefined;
  exclude: number[] = [];
  async validate() {
    await super.validate();
    if (this.minAPILevel == undefined && this.maxAPILevel == undefined) {
      return Promise.reject(
        "minAPILevel or maxAPILevel should be at least defined in AndroidAPIPrjRequirement."
      );
    }
    let exclude: Array<number> = [];
    if (this.exclude == undefined) {
      exclude = undefined;
    } else if (this.exclude instanceof Array) {
      exclude = this.exclude.map((x) => Number(x));
    } else {
      return Promise.reject(
        "exclude in AndroidAPIPrjRequirement should be an empty arrray or array of number."
      );
    }

    const validAPILevels = AndroidAPIPrjRequirement.getValidAPILevels();

    const minAPILevel = Number(this.minAPILevel);
    const maxAPILevel = Number(this.maxAPILevel);
    if (this.minAPILevel != undefined && this.maxAPILevel) {
      if (!(minAPILevel <= maxAPILevel)) {
        return Promise.reject(
          "minAPILevel should be less or equal than maxAPILevel in AndroidAPIPrjRequirement."
        );
      }
    }
    if (this.minAPILevel != undefined) {
      if (!validAPILevels.includes(minAPILevel)) {
        return Promise.reject(
          "minAPILevel not fund in the all APILevels in AndroidAPIPrjRequirement."
        );
      }
    }
    if (this.maxAPILevel != undefined) {
      if (!validAPILevels.includes(maxAPILevel)) {
        return Promise.reject(
          "maxAPILevel not fund in the all APILevels in AndroidAPIPrjRequirement."
        );
      }
    }

    if (exclude != undefined) {
      if (exclude.length > 0 && !exclude.every((el) => validAPILevels.includes(el))) {
        return Promise.reject(
          "some value(s) in exlude not fund in the all APILevels in AndroidAPIPrjRequirement."
        );
      }
    }
    return true;
  }

  static getValidAPILevels() {
    const apiLevels = [];
    // 9 is Android 2.3, API level 9
    // 30 is Android 11, API level 30
    for (let i = 9; i <= 30; i += 1) {
      apiLevels.push(i);
    }
    return apiLevels;
  }
}

export class SensorPrjRequirement extends ProjectRequirement {
  async validate() {
    await super.validate();
    if (!(this.sensors instanceof Array && this.sensors.length > 0)) {
      return Promise.reject(
        "if the SensorPrjRequirement is set. The sensors has to be an array and it should has at least one element."
      );
    }
    const sensorIds = this.sensors.map((sensor) => sensor.sensorId);
    if (new Set(sensorIds).size != this.sensors.length) {
      return Promise.reject(
        "in the SensorPrjRequirement, a sensor(id) can only be set once in the array."
      );
    }
    if (
      !sensorIds.every(
        async (el) => await SensorPrjRequirement.validSensorId(el)
      )
    ) {
      return Promise.reject(
        "in the SensorPrjRequirement, there exists invalid sensorName(s)."
      );
    }
    const minimumFrequency = this.sensors.map(
      (sensor) => sensor.minimumFrequency
    );
    if (
      !minimumFrequency.every(
        (el) => Number(el) >= 1 && Number(el) <= 3 && typeof el != "string"
      )
    ) {
      return Promise.reject(
        "in the SensorPrjRequirement, every minimumFrequency has to be [1,3]."
      );
    }
    return true;
  }

  static getValidFrequencyLevels() {
    // 1 is the lowest frequency, 3 is the highest
    return [1, 2, 3];
  }

  static async validSensorId(id: string) {
    const sensors = await cache.getSensors();
    const ret = sensors.some((el: SensorStored) => {
      let index;

      for (index = 0; index < id.length; ++index) {
        if (id.charCodeAt(index) != el._id.charCodeAt(index))
          console.log(
            "char " + index + ": ",
            id.charCodeAt(index),
            el._id.charCodeAt(index)
          );
      }
      const ret = el._id == id;
      console.log(el._id, id, ret);
      return ret;
    });
    return ret;
  }
  sensors: Array<{ sensorId: string; minimumFrequency: number }> = undefined;
}

export class GenderPrjRequirement extends ProjectRequirement {
  async validate() {
    await super.validate();
    if (!(this.genders instanceof Array && this.genders.length > 0)) {
      return Promise.reject(
        "if the GenderPrjRequirement is set. The genders has to be an array and it should has at least one element."
      );
    }
    if (new Set(this.genders).size != this.genders.length) {
      return Promise.reject(
        "in the GenderPrjRequirement, a gender can only be set once in the array."
      );
    }
    if (
      !this.genders.every((el) =>
        GenderPrjRequirement.getAllGenderValues().includes(el)
      )
    ) {
      return Promise.reject(
        "in the GenderPrjRequirement, there exists invalid gender(s)."
      );
    }
    return true;
  }
  genders: number[] = undefined; // 1 man, 2 woman, 3 not given on purpose 4 Unknown for now
  static getValidGenders() {
    enum GenderEnum {
      Male = 1,
      Female,
      DontTell,
      Unknown,
    }
    return GenderEnum;
  }
  static getAllGenderValues() {
    const values = Object.keys(GenderPrjRequirement.getValidGenders()).filter(
      (item) => {
        return !isNaN(Number(item));
      }
    );

    return values.map((el) => Number(el));
  }
}

export class DeviceModelPrjRequirement extends ProjectRequirement {
  async validate() {
    await super.validate();
    if (!(this.deviceModels instanceof Array && this.deviceModels.length > 0)) {
      return Promise.reject(
        "if the DeviceModelPrjRequirement is set. The deviceModels has to be an array and it should has at least one element."
      );
    }
    if (new Set(this.deviceModels).size != this.deviceModels.length) {
      return Promise.reject(
        "in the DeviceModelPrjRequirement, a deviceModel can only be set once in the array."
      );
    }
    if (
      !this.deviceModels.every((el) =>
        DeviceModelPrjRequirement.getValidDeviceModels().includes(el)
      )
    ) {
      return Promise.reject(
        "in the DeviceModelPrjRequirement, there exists invalid deviceModel(s)."
      );
    }
    return true;
  }
  deviceModels: string[] = undefined; // From List provided later
  static getValidDeviceModels() {
    // TODO
    return [
      "DeviceModelA",
      "DeviceModelB",
      "DeviceModelC",
      "DeviceModelD",
      "DeviceModelE",
    ];
  }
}

class ProjectGoal {
  sensorId: string; // From list
  recordsNum: number;
}

export class ParticipantGeo {
  // Seperate it from the Participant to deal with the frequent uploading.
  participant: string = undefined;
  lastGPS: number[] = [];
}

export class Participant {
  // Authentication
  email: string = undefined;

  // Basic Information for Matching
  name: string = undefined;
  gender: number = undefined; // 1 man 2 woman 3 not given on purpose 4 null
  mobileSystem = "Android"; // "iOS" | "Android"
  mobileDeviceType: string = undefined; // "Mobile Phone" | "Wearable Device"
  androidAPI: number = undefined;
  deviceModel: string = undefined;
  lastGeo: number[] = [];
  totalRecordsNumber = 0; // This corresponds to the number of records ACCEPTED by the server

  // Incentive
  lifeTimeWallet = 0;
  projectWallets: ProjectWalletInParProfile[] = [];
  balance = 0;

  // SensorConf
  sensorsInDevice: SimpleSensor[] = [];
  sensorConfsTemplate: SensorConf[] = [];

  // Prj
  projects: ProjectInParticipantProfile[] = [];
  lastSenseDataTime: Date = new Date("1900-01-01");

  // Statistics about Participant point redemption and contribution
  pointStatistics: ParticipantPointStatistics[] = [];

  // Participant Tier for the incentive model
  incentiveTier = 1; // 1 for Bronze | 2 for Silver | 3 for Gold
  tierMultiplier = 1.0; // This number corresponds to the tier multiplier in ParticipantIncentiveTier
  rating = 3.0; // This number starts a default of 3.0, can be a lowest of 0 and a maximum of 5
}

export class ProjectIncentiveTier {
  static getProjIncentiveTier(completionRate: number): number {
    if (completionRate <= 0.5) {
      return 1;
    } else if (completionRate > 0.5 && completionRate <= 0.95) {
      return 2;
    } else {
      return 3;
    }
  }
}

export class ParticipantIncentiveTier {
  static getRatingToTierMapping(rating: number): number {
    if (rating < 2) {
      return 1;
    } else if (rating >= 2 && rating < 2.75) {
      return 2;
    } else if (rating >= 2.75) {
      return 3;
    }
  }

  /**
   * This function returns a mapping of all the available incentive tiers
   * to its corresponding tier name
   * @returns An object of { tierNumber: tierName }
   */
  static getAllTiers(): Record<number, string> {
    return {
      1: "Bronze",
      2: "Silver",
      3: "Gold",
    };
  }

  /**
   * This function takes in the tier number and returns the tier name
   * @param tierNum The tier number used to denote the name of the tier
   * @returns The name of the tier, e.g. "Bronze"
   */
  static getTierName(tierNum: number): string {
    return this.getAllTiers()[tierNum];
  }

  /**
   * This function takes in the tier number and returns the corresponding
   * multiplier associated with this tier
   * @param tierNum The tier number used to denote the name of the tier
   */
  static getTierMultiplier(tierNum: number): number {
    switch (tierNum) {
      case 1:
        return 1.0;
      case 2:
        return 1.5;
      case 3:
        return 2.0;
      default:
        return 1.0;
    }
  }
}

export class ParticipantPointStatistics {
  year: number; // e.g. 2021
  mth: number; // 0 is January, 11 is December
  qtr: number; // 1 is Quarter 1 (Jan - Mar), 4 is Quarter 4 (Oct - Dec)
  pointsRedeemed = 0;
  redeemablePointsEarned = 0;
  lifeTimePointsEarned = 0;
}

export class Points {
  static getBasePoints = (): number => 10;
}

export class SimpleSensor {
  name: string;
  type: number;
  id: string;
}
export class ProjectWalletInParProfile {
  projectId: string = undefined;
  conversionRate: number = undefined;
  exchangeable: boolean = undefined;
  existingPoints: number = undefined;
  exchangedMoney: number = undefined;
  maxExchangeable: number = undefined;
}
export class ProjectInParticipantProfile {
  inviteTime: Date = undefined;
  joinTime: Date = undefined;
  leaveTime: Date = undefined;
  lastSenseDataTime: Date = new Date("1900-01-01");
  sensorReliability: SensorDataReliability[] = [];
  sensorLastUpdated: SensorRecordHistory[] = []; // This is if the sensor data was accepted and updated
  prjStartTime: Date = undefined;
  sensorConfs: SensorConf[] = [];
  sensorRecords: SimpleSensorRecord[] = [];
  issues: IssueInProjectInParProfile[] = [];
  prjComplete = false;
  projectId: string;
  ptcpTierRating = 1; // Defaults to 1, which is Bronze 
  isFullRedeemOnly = false; // If true, then the participant is only allowed to redeem points when they complete the project
}

export class SensorDataReliability {
  sensorId: string = undefined;
  numReliableRecords = 0;
  numRecordsReceived = 0;
}

export class SensorRecordHistory {
  sensorId: string = undefined;
  lastSensed: Date = new Date();
}

export class SimpleSensorRecord {
  sensorId: string = undefined;
  number: number = undefined;
  required: number = undefined;
}

export class IssueInProjectInParProfile {
  issueType: number = undefined;
  issueMessage: string = undefined;
  issueCreateDate: string = undefined;
  hasNotifyTheParticipant: boolean = undefined;
}

export class ParticipantNotifications extends Configureable {
  participantId: string = undefined;
  unhandledInvitations: Array<{
    projectId: string;
    invitedTime: Date;
    receivedTime: Date;
  }> = [];
  retrieveDataNotifications: Array<{
    retrieveTime: Date;
    hasBeenRead: boolean;
    projectId: string;
    retrievalId: string;
  }> = [];
  inSendingOrDroppedInvitations: string[] = []; // projectIds arrary; limited by UNSENT_INVITATION_LIMIT
}

export class ParticipantReachedUnsentLimit {
  participantId: string = undefined;
}

export class SensorConf {
  enabledSensorName = "sensorA";
  sensorFrequency: 1 | 2 | 3 = 1;
}

export class SensorFrequencies {
  static getFrequency(freqNum: number) {
    const freqMap = {
      // 1 corresponds to "LOW" frequency: 1 record to be read every 60s
      1: 60 * 1000,
      // 2 corresponds to "MEDIUM" frequency: 1 record to be read every 20s
      2: 20 * 1000,
      // 3 corresponds to "HIGH" frequency: 1 record to be read every 1s
      3: 1 * 1000,
    };

    return freqMap[freqNum];
  }
}

export class RecordFilter {
  filterType: string = undefined; // DeviceTypeRecordFilter
  static getRecordFilters(): Array<typeof RecordFilter> {
    return [
      MobileDeviceTypeRecordFilter,
      DeviceModelRecordFilter,
      MobileSystemRecordFilter,
      AndroidAPIRecordFilter,
      DataCreateDateRecordFilter,
      DataCreateTimeRecordFilter,
      DataCreateWeekdayRecordFilter,
      SensorIdRecordFilter,
      ParticipantGenderRecordFilter,
    ];
  }
  async validate(): Promise<any> {
    return;
  }
}
class MobileDeviceTypeRecordFilter extends RecordFilter {
  mobileDeviceTypes: string[] = undefined;
  async validate(): Promise<any> {
    const validDeviceTypes =
      MobileDeviceTypePrjRequirement.getValidDeviceTypes();
    if (
      !(
        this.mobileDeviceTypes instanceof Array &&
        this.mobileDeviceTypes.length > 0
      )
    ) {
      return Promise.reject(
        "An array of Mobile Device Type(s) should be provided."
      );
    }
    if (!this.mobileDeviceTypes.every((el) => validDeviceTypes.includes(el))) {
      return Promise.reject(
        "mobileDeviceType has to one(s) of " + validDeviceTypes
      );
    }
    return true;
  }
}
class DeviceModelRecordFilter extends RecordFilter {
  deviceModels: string[] = undefined;
  async validate(): Promise<any> {
    const validDeviceModels = DeviceModelPrjRequirement.getValidDeviceModels();
    if (!(this.deviceModels instanceof Array && this.deviceModels.length > 0)) {
      return Promise.reject("An array of Device Model(s) should be provided.");
    }
    if (!this.deviceModels.every((el) => validDeviceModels.includes(el))) {
      return Promise.reject(
        "deviceModel has to one(s) of " + validDeviceModels
      );
    }
    return true;
  }
}
class MobileSystemRecordFilter extends RecordFilter {
  mobileSystems: string[] = undefined;
  async validate(): Promise<any> {
    const validMobileSystems = MobileSystemPrjRequirement.getValidSystems();
    if (
      !(this.mobileSystems instanceof Array && this.mobileSystems.length > 0)
    ) {
      return Promise.reject("An array of Mobile System(s) should be provided.");
    }
    if (!this.mobileSystems.every((el) => validMobileSystems.includes(el))) {
      return Promise.reject(
        "mobileSystem has to one(s) of " + validMobileSystems
      );
    }
    return true;
  }
}
class AndroidAPIRecordFilter extends RecordFilter {
  apiLevels: number[] = undefined;
  async validate(): Promise<any> {
    const validAPILevels = AndroidAPIPrjRequirement.getValidAPILevels();
    if (!(this.apiLevels instanceof Array && this.apiLevels.length > 0)) {
      return Promise.reject("An array of apiLevel(s) should be provided.");
    }
    if (!this.apiLevels.every((el) => validAPILevels.includes(el))) {
      return Promise.reject(
        "validAPILevels has to one(s) of " + validAPILevels
      );
    }
    return true;
  }
}
class DataCreateDateRecordFilter extends RecordFilter {
  periods: { dateBegin: string; dateEnd: string }[] = undefined;
  async validate(): Promise<any> {
    if (!(this.periods instanceof Array && this.periods.length > 0)) {
      return Promise.reject("An array of period(s) should be provided.");
    }
    if (
      !this.periods.every((el) => {
        return (
          !isNaN(Date.parse(el.dateBegin)) && !isNaN(Date.parse(el.dateEnd))
        );
      })
    ) {
      return Promise.reject("dateBegin and dateEnd should be well formated.");
    }

    if (
      !this.periods.every((el) => {
        return Date.parse(el.dateBegin) < Date.parse(el.dateEnd);
      })
    ) {
      return Promise.reject("dateBegin has to smaller than dateEnd.");
    }
    return true;
  }
}
class DataCreateTimeRecordFilter extends RecordFilter {
  periods: { timeBegin: string; timeEnd: string }[] = undefined;
  async validate(): Promise<any> {
    const format = "HH:mm:ss";
    if (!(this.periods instanceof Array && this.periods.length > 0)) {
      return Promise.reject("An array of period(s) should be provided.");
    }
    if (
      !this.periods.every((el) => {
        const begin = moment(el.timeBegin, format, true);
        const end = moment(el.timeEnd, format, true);
        const beginValid = begin.isValid();
        const endValid = end.isValid();
        const beginBeforeEnd = begin.isBefore(end);
        return beginValid && endValid && beginBeforeEnd;
      })
    ) {
      return Promise.reject(
        "dateBegin and dateEnd should be well formated and the begin time should be before than the end time."
      );
    }
    return true;
  }
}
class DataCreateWeekdayRecordFilter extends RecordFilter {
  weekdays: number[] = undefined;
  private _getWeekDay() {
    return { Mon: 1, Sun: 7 };
  }
  async validate(): Promise<any> {
    const format = "HH:mm:ss";
    if (!(this.weekdays instanceof Array && this.weekdays.length > 0)) {
      return Promise.reject("An array of weekdays(s) should be provided.");
    }
    if (new Set(this.weekdays).size != this.weekdays.length) {
      return Promise.reject("Weekdays(s) can not set twice.");
    }
    if (
      !this.weekdays.every(
        (el) =>
          Number.isInteger(el) &&
          this._getWeekDay().Mon <= el &&
          this._getWeekDay().Sun >= el
      )
    ) {
      return Promise.reject("weekday(s) should be within the range of 1-7.");
    }
    return true;
  }
}
class SensorIdRecordFilter extends RecordFilter {
  sensorIds: string[] = undefined;
  async validate(): Promise<any> {
    const validSensorNames = await cache.getSensors();
    if (!(this.sensorIds instanceof Array && this.sensorIds.length > 0)) {
      return Promise.reject("An array of sensorName(s) should be provided.");
    }
    if (
      !this.sensorIds.every(
        async (el) => await SensorPrjRequirement.validSensorId(el)
      )
    ) {
      return Promise.reject("sensorNames has to one(s) of " + validSensorNames);
    }
    return true;
  }
}
class ParticipantGenderRecordFilter extends RecordFilter {
  genders: number[] = undefined;
  async validate(): Promise<any> {
    if (!(this.genders instanceof Array && this.genders.length > 0)) {
      return Promise.reject(
        "if the GenderPrjRequirement is set. The genders has to be an array and it should has at least one element."
      );
    }
    if (new Set(this.genders).size != this.genders.length) {
      return Promise.reject(
        "in the GenderPrjRequirement, a gender can only be set once in the array."
      );
    }
    if (
      !this.genders.every((el) =>
        GenderPrjRequirement.getAllGenderValues().includes(el)
      )
    ) {
      return Promise.reject(
        "in the GenderPrjRequirement, there exists invalid gender(s)."
      );
    }
    return true;
  }
}

export class SensorRecord {
  id: string = undefined;
  sensorId: string = undefined;
  sensorName: string = undefined;
  sensorType: number = undefined;
  sensorValue: number[] = undefined;
  createDetailedTime: Date = undefined;
  createTime: number = undefined; // 22:22 -> 22*3600+22*60
  createWeekDay: number = undefined;
  createDeviceModel: string = undefined;
  createMobileSystem: string = undefined; // "Android" | "iOS" |
  createDeviceType: string = undefined; // "MobilePhone" | "Wearable Device" |
  createAndroidAPI: number = undefined;
  createGeo: number[] = undefined;
  participantGender: number = undefined; // 1 | 2 | 3 | 4
  participantId: string = undefined;
  projectList: string[] = undefined;
}

/**
 * The class for the Participant's lifetime rating
 */
class ParticipantRating extends Configureable {
  participant: Participant;
  // The actual participant rating based on the factors below
  // Calculated as:
  // (COMPLETED_PROJS_WEIGHT * numCompletedProjects) + (RELIABILITY_WEIGHT * reliabilityScore)
  // COMPLETED_PROJS_WEIGHT: 0.5;
  // RELIABILITY_WEIGHT: 0.5;
  rating: number;

  // The number of projects a user has completed
  // NOTE: If a user QUITS a project, it DOES NOT ADD TO THIS COUNT
  numCompletedProjects: number;

  // The score of a user based on their data contribution reliability
  // Calculated as:
  // reliabilityScore + ((no. of provided readings for the day / no. of required readings for the day) / no. of days in project)
  // NOTE: Maybe to improve performance, we can use the average readings for the MONTH instead of for the day
  reliabilityScore: number;
}
/**
 * The class for the Participant's Matchmaking score for a specific project
 */
class MatchmakingScore extends Configureable {
  createTime: Date;
  project: Project;
  participant: Participant;
  // The Participant's matchmaking score for this project
  // Calculated as:
  // (PARTICIPANT_RATING_WEIGHTAGE * ParticipantRating.rating) + (ADDITIONAL_FACTORS_WEIGHTAGE * AdditionalFactors.score)
  matchmakeScore: number;
  // PARTICIPANT_RATING_WEIGHTAGE: 0.5;
  // ADDITIONAL_FACTORS_WEIGHTAGE: 0.5;

  // a non-cascade redundancy of ParticipantRating in a specific time
  participantRating: number;
  participantNumCompletedProjects: number;
  participantReliabilityScore: number;

  /**
   * The additional factors to consider when matchmaking a user,
   * based on project requirements, and other user factors
   */
  // The normalized score for the additional factors
  // Calculated as:
  // (PROJ_REQ_WEIGHT * projRequirementsScore) + (SIMILARITY_WEIGHT * userDataSimilarityScore) + (USER_INTEREST_WEIGHT * userInterestScore)
  // PROJ_REQ_WEIGHT: 0.85;
  // SIMILARITY_WEIGHT: 0.1;
  // USER_INTEREST_WEIGHT: 0.05;
  additionalFactorsScore: number;
  // The weighted score of a user's ability to meet the project requirements
  // Calculated as:
  // SUM(ProjectRequirement.seriousness * userMetReq) / SUM(ProjectRequirement.seriousness), for each project requirement
  // where userMetReq is if the user has met the requirements, userMetReq == 1 if met, 0 if not met
  addtionalFactorsProjRequirementsScore: number;
  // The score for the similarity of data provided in the past
  // Calculated as:
  // SUM(1 for each sensor in SensorPrjRequirement that appears in Participant.sensorsContributed) / SUM(SensorPrjRequirement.sensorName.length)
  addtionalFactorsUserDataSimilarityScore: number;
  // The score for user's interest in the project topic
  // 1 if the user's interest is part of the project's research field (Project.prjResearchField), else 0
  additionalFactorsUserInterestScore: number;
}

/**
 * The class for Constant Settings for the project controlled by versions(its id).
 * It will be cached into memory when developing.
 */
export class ConstantConf {
  id = undefined;
  // MatchmakingScore Conf
  MATCHMAKNGSCORE_PARTICIPANT_RATING_WEIGHTAGE = 0.5;
  MATCHMAKNGSCORE_ADDITIONAL_FACTORS_WEIGHTAGE = 0.5;
  MATCHMAKNGSCORE_PROJ_REQ_WEIGHT = 0.85;
  MATCHMAKNGSCORE_SIMILARITY_WEIGHT = 0.1;
  MATCHMAKNGSCORE_USER_INTEREST_WEIGHT = 0.05;

  // ParticipantRating Conf
  RARTICIPANTRATING_COMPLETED_PROJS_WEIGHT = 0.5;
  RARTICIPANTRATING_RELIABILITY_WEIGHT = 0.5;

  // Project Conf
  PROJECT_DEFAULT_PARTICIPANT_NUM_IN_A_PRJ = 1000;
  PROJECT_MAX_PARTICIPANT_NUM_IN_A_PRJ = 1000;
  PROJECT_IN_MATCHMAKING_NUM_LIMIT = 200;
  PROJECT_IN_INVITATION_NUM_LIMIT = 200;
  PROJECT_MATCHMAKING_TIMEOUT = 86400;
  PROJECT_REPUSH_TIMEOUT = 86400;
  PROJECT_REPUSH_TIMES_FOR_SPECIFIC_PARTICIPANT = 10;

  // ParticipantNotifications Conf
  PARTICIPANTNOTIFICATIONS_INSENDING_INVITATION_LIMIT = 10;
}

// RESEACH FIELD -- Will not stored in firestore
export class RESEARCH_FIELDS {
  constructor() {
    this[1] = "Advertising, Searching, and Discovery";
    this[2] = "Service Orchestration";
    this[3] = "Efficient Resource Management";
    this[4] = "Energy Harvesting";
    this[5] = "Things to Cloud";
    this[6] = "Miniaturization";
    this[7] = "Big Data Analytics";
    this[8] = "Semantic technologies";
    this[9] = "Virtualization";
    this[10] = "Pregnancy Prediction";
    this[11] = "Heterogeneous Networks";
    this[9999] = "Others";
  }
}
export class Success {
  constructor(success: boolean, msg?: string) {
    this.success = success;
    this.msg = msg;
  }
  success: boolean = undefined;
  msg: string = undefined;
}
export class FCMUser {
  email: string = undefined;
  fcmToken: string = undefined;
  lastLoginTime: Date = undefined;
  currentLoggedIn: boolean = undefined;
  isFirstSession: boolean = undefined;
}
export class FCMProtocol {
  data: FCMData = new FCMData();
  android: { priority: string } = { priority: "high" };
  token: string = undefined;
}
export class FCMData {
  notificationTitle: string = undefined;
  notificationContent: string = undefined;
  customizedJsonData: string = undefined;
}
export class FCMCutomizedData {
  constructor(showNotification: boolean, commandId: number, commandData: any) {
    this.showNotification = showNotification;
    this.commandId = commandId;
    this.commandData = commandData;
  }
  showNotification = true;
  commandId: number = undefined;
  commandData: any = undefined;
}

export class FCMCustomProtocol {
  INVITATION_COMMAND = 1;
  PARTICIPANT_DATA_COMMAND = 2;
  DATA_RETRIEVE_COMMAND = 3;
}

export class InvitationCommand {
  projectId: string;
  inviteTime: Date;
  constructor(projectId, inviteTime) {
    this.projectId = projectId;
    this.inviteTime = inviteTime;
  }
}
export class ParticipantData {
  participantNotifications = false;
  participantProfile = false;
  projectIds: string[] = [];
}
export class DataRetrieveCommand {
  // projectId: string = undefined;
  // projectOwnerName:string=undefined;
  // retrieveTime: string = undefined;
  retrieveId: string = undefined;
}

export const fcmCustomProtocol = new FCMCustomProtocol();

export class SensorStored {
  _id: string = undefined; // ${name}_._${typeNum}
  name: string = undefined;
  typeNum: string = undefined;
}
export const SENSOR_ID_JOINER = `__`;
class SensorType {
  constructor(typeNumber: number, typeName: string) {
    this.typeNumber = typeNumber;
    this.typeName = typeName;
  }
  typeNumber: number;
  typeName: string;
}
export const sensorTypes = [] as SensorType[];
sensorTypes.push(new SensorType(1, `android.sensor.accelerometer`));
sensorTypes.push(new SensorType(2, `android.sensor.magnetic_field`));
sensorTypes.push(new SensorType(3, `android.sensor.orientation`));
sensorTypes.push(new SensorType(4, `android.sensor.gyroscope`));
sensorTypes.push(new SensorType(5, `android.sensor.light`));
sensorTypes.push(new SensorType(6, `android.sensor.pressure`));
sensorTypes.push(new SensorType(7, `android.sensor.temperature`));
sensorTypes.push(new SensorType(8, `android.sensor.proximity`));
sensorTypes.push(new SensorType(9, `android.sensor.gravity`));
sensorTypes.push(new SensorType(10, `android.sensor.linear_acceleration`));
sensorTypes.push(new SensorType(11, `android.sensor.rotation_vector`));
sensorTypes.push(new SensorType(12, `android.sensor.relative_humidity`));
sensorTypes.push(new SensorType(13, `android.sensor.ambient_temperature`));
sensorTypes.push(
  new SensorType(14, `android.sensor.magnetic_field_uncalibrated`)
);
sensorTypes.push(new SensorType(15, `android.sensor.game_rotation_vector`));
sensorTypes.push(new SensorType(16, `android.sensor.gyroscope_uncalibrated`));
sensorTypes.push(new SensorType(17, `android.sensor.significant_motion`));
sensorTypes.push(new SensorType(18, `android.sensor.step_detector`));
sensorTypes.push(new SensorType(19, `android.sensor.step_counter`));
sensorTypes.push(
  new SensorType(20, `android.sensor.geomagnetic_rotation_vector`)
);
sensorTypes.push(new SensorType(21, `android.sensor.heart_rate`));
sensorTypes.push(new SensorType(22, `android.sensor.tilt_detector`));
sensorTypes.push(new SensorType(23, `android.sensor.wake_gesture`));
sensorTypes.push(new SensorType(24, `android.sensor.glance_gesture`));
// sensorTypes.push(new SensorType(25,`android.sensor.pick_up_gesture`));
// sensorTypes.push(new SensorType(26,`android.sensor.wrist_tilt_gesture`));
// sensorTypes.push(new SensorType(27,`android.sensor.device_orientation`));
sensorTypes.push(new SensorType(28, `android.sensor.pose_6dof`));
sensorTypes.push(new SensorType(29, `android.sensor.stationary_detect`));
sensorTypes.push(new SensorType(30, `android.sensor.motion_detect`));
sensorTypes.push(new SensorType(31, `android.sensor.heart_beat`));
// sensorTypes.push(new SensorType(32,`android.sensor.dynamic_sensor_meta`));
sensorTypes.push(
  new SensorType(34, `android.sensor.low_latency_offbody_detect`)
);
sensorTypes.push(
  new SensorType(35, `android.sensor.accelerometer_uncalibrated`)
);
sensorTypes.push(new SensorType(36, `android.sensor.hinge_angle`));
