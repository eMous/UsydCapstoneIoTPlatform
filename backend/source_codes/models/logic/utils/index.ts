import { SensorRecord } from "../../data";
const fs = require("fs");
const path = require("path");
const os = require("os");
import {
  FCMCutomizedData,
  fcmCustomProtocol,
  DataRetrieveCommand,
} from "../../data";
import bunyan = require("bunyan");
import { LoggingBunyan } from "@google-cloud/logging-bunyan";
const loggingBunyan = new LoggingBunyan();

export const logger = bunyan.createLogger({
  name: "NELSON BACKEND LOGS",
  streams: [
    { stream: process.stdout, level: 'info' },
    loggingBunyan.stream('info')
  ]
});

export const sensorRecordDateTimeCompare = (a: SensorRecord, b: SensorRecord): number => {
  if (new Date(a.createDetailedTime).getTime() < new Date(b.createDetailedTime).getTime()) {
    return -1;
  }

  if (new Date(a.createDetailedTime).getTime() > new Date(b.createDetailedTime).getTime()) {
    return 1;
  }

  return 0;
}

export const getCurrentQuarter = () => {
  const currMth = new Date().getMonth();

  // currMth 0 to 3 are months Jan to Mar
  if (currMth < 3) {
    return 1; // 1 refers to Quarter 1 (Jan to Mar)
  } else if (currMth > 3 && currMth < 6) {
    return 2; // 2 refers to Quarter 2 (Apr to Jun)
  } else if (currMth > 6 && currMth < 9) {
    return 3; // 3 refers to Quarter 3 (Jul to Sep)
  } else {
    return 4; // 4 refers to Quarter 4 (Oct to Dec)
  }
};

export async function getParticipantDataRetrievalData(
  dataRetrieveInfo: DataRetrieveCommand
): Promise<FCMCutomizedData> {
  const fcmCutomizedData = new FCMCutomizedData(
    true,
    fcmCustomProtocol.DATA_RETRIEVE_COMMAND,
    new DataRetrieveCommand()
  );
  fcmCutomizedData.commandData = dataRetrieveInfo;
  return fcmCutomizedData;
}

export const sanitizeDataFields = (mongoDbDocs) => {
  let outputArr = [];

  let genderValsAsKey = {};
  Object.keys(constants.gender).forEach((k) => {
    genderValsAsKey[constants.gender[k]] = k;
  });

  mongoDbDocs.forEach((eachDoc) => {
    outputArr.push({
      datetimeRecorded: eachDoc.createDetailedTime.toString(),
      deviceModel: eachDoc.createDeviceModel,
      deviceType: eachDoc.createDeviceType,
      mobileOperatingSystem: eachDoc.createMobileSystem,
      osApiLevel: eachDoc.createAndroidAPI.toString(),
      participantGender: genderValsAsKey[eachDoc.participantGender],
      deviceSensorName: eachDoc.sensorName,
      sensorValues: eachDoc.sensorValue.toString(),
    });
  });

  return outputArr;
};

export const dataFiltersToMongoFilters = (filters) => {
  let mongoFilters = {};

  filters.forEach((eachFilter) => {
    switch (eachFilter.filterType) {
      case "MobileDeviceTypeRecordFilter": {
        mongoFilters["createDeviceType"] = {
          $in: eachFilter.mobileDeviceTypes,
        };
        break;
      }

      case "DeviceModelRecordFilter": {
        mongoFilters["createDeviceModel"] = { $in: eachFilter.deviceModels };
        break;
      }

      case "MobileSystemRecordFilter": {
        mongoFilters["createMobileSystem"] = { $in: eachFilter.mobileSystems };
        break;
      }

      case "AndroidAPIRecordFilter": {
        mongoFilters["createAndroidAPI"] = { $in: eachFilter.apiLevels };
        break;
      }

      case "DataCreateDateRecordFilter": {
        const periodFilter = eachFilter.periods[0];
        mongoFilters["createDetailedTime"] = {};

        if (typeof periodFilter.dateBegin !== "undefined") {
          mongoFilters["createDetailedTime"]["$gte"] = new Date(
            periodFilter.dateBegin
          );
        }

        if (typeof periodFilter.dateEnd !== "undefined") {
          mongoFilters["createDetailedTime"]["$lte"] = new Date(
            periodFilter.dateEnd
          );
        }

        if (Object.keys(mongoFilters["createDetailedTime"]).length === 0) {
          delete mongoFilters["createDetailedTime"];
        }

        break;
      }

      case "DataCreateWeekdayRecordFilter": {
        mongoFilters["createWeekDay"] = { $in: eachFilter.weekdays };
        break;
      }

      case "SensorIdRecordFilter": {
        mongoFilters["sensorId"] = { $in: eachFilter.sensorIds };
        break;
      }

      case "ParticipantGenderRecordFilter": {
        mongoFilters["participantGender"] = { $in: eachFilter.genders };
        break;
      }

      default:
        break;
    }
  });

  return mongoFilters;
};

/**
 * CREDIT: https://medium.com/@danny.pule/export-json-to-csv-file-using-javascript-a0b7bc5b00d2
 *
 * This function takes in an array of MongoDB documents (SensorRecords) and turns it into a CSV file.
 * This CSV file will be created in the temporary resources folder to allow the Project Owner to download it.
 */
export const exportToCSV = (mongoDbDocsArr: any[], projId: string) => {
  // The output CSV array
  let outputCsvArr = [];

  // The headers we want for the CSV file
  const fileHeaders = [
    "Datetime Recorded",
    "Device Model",
    "Device Type",
    "Mobile Operating System",
    "OS API Level",
    "Participant's Gender",
    "Device Sensor Name",
    "Sensor Value(s)",
  ];

  outputCsvArr.push(fileHeaders);

  let arrOfDataCsvArr = mongoDocsToCsvArr(mongoDbDocsArr);
  arrOfDataCsvArr.forEach((eachArr) => {
    outputCsvArr.push(eachArr);
  });

  // Write the file to the temporary location
  const fileDir = path.join(__dirname, `../../../../resources/tmp/${projId}/`);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir);
  }

  const fileLocation = path.join(
    __dirname,
    `../../../../resources/tmp/${projId}/`,
    "sensor_record_download.csv"
  );
  fs.writeFileSync(fileLocation, outputCsvArr.join(os.EOL));
};

const mongoDocsToCsvArr = (mongoDbDocsArr: SensorRecord[]) => {
  let csvArr = [];

  let genderValsAsKey = {};
  Object.keys(constants.gender).forEach((k) => {
    genderValsAsKey[constants.gender[k]] = k;
  });

  // Format the data from the MongoDB document into a state that we want
  mongoDbDocsArr.forEach((doc: SensorRecord) => {
    csvArr.push(
      [
        `"${doc.createDetailedTime.toString()}"`,
        `"${doc.createDeviceModel}"`,
        `"${doc.createDeviceType}"`,
        `"${doc.createMobileSystem}"`,
        `"${doc.createAndroidAPI.toString()}"`,
        `"${genderValsAsKey[doc.participantGender]}"`,
        `"${doc.sensorName}"`,
        `"${doc.sensorValue.toString()}"`,
      ].join()
    );
  });

  return csvArr;
};

export const constants = {
  gender: {
    Male: 1,
    Female: 2,
    "Prefer not to say": 3,
  },
};

Object.freeze(constants);
