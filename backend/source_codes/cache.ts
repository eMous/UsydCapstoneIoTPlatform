import { Cursor, Db, MongoClient } from "mongodb";
import NodeCache from "node-cache";
import * as models from "./models/data";
import domain = require("domain");
import AsyncLock = require("async-lock");
import { v4 as uuidv4 } from "uuid";

class MyCache {
  mongoDb: Db = undefined;
  cacheInstance = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
  lock = new AsyncLock(); // Define the lock
  async initDB() {
    const initOnce = await (async function () {
      var inited = false;
      return async function (__this) {
        if (!inited) {
          inited = true;
          const url =
            "mongodb+srv://iot-sensor-admin:604iAIWnaW3SjRjS@clusteriot43.frayu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
          const dbName = "tom_test_iotplatform";
          const client = await new MongoClient(url, {
            useUnifiedTopology: true,
          });
          const ret = await client.connect();
          __this.mongoDb = client.db(dbName);
        }
      };
    })();
    await initOnce(this);
  }

  async clearCache() {
    this.cacheInstance.flushAll();
  }

  private _researchFields: Record<string, any>;

  async mongoGetParticipantsById(
    ptcpIds: string[]
  ): Promise<unknown | undefined> {
    try {
      const PARTICIPANT_COLLECTION = models.Participant.name;
      const cursor = (await this.mongoDb
        .collection(PARTICIPANT_COLLECTION)
        .find({ email: { $in: ptcpIds } })
      ) as Cursor;
      const dataFromMongo = await cursor.toArray();
      return dataFromMongo;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async mongoGetParticipantsMatchReqs(
    reqsToMatch: Record<string, unknown>
  ): Promise<unknown | undefined> {
    try {
      const PARTICIPANT_COLLECTION = models.Participant.name;
      const cursor = (await this.mongoDb
        .collection(PARTICIPANT_COLLECTION)
        .find(reqsToMatch)
      ) as Cursor;
      const dataFromMongo = await cursor.toArray();
      return dataFromMongo;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * This function takes in a list of Project IDs and looks for the corresponding Project Owners.
   * @param projIds The list of Project IDs that belong to Project Owners
   * @returns An array of Project Owner documents
   */
  async mongoGetProjectOwnersFromProjIds(
    projIds: string[]
  ): Promise<unknown | undefined> {
    try {
      const PROJECT_OWNER_COLLECTION = "ProjectOwner";
      const cursor = (await this.mongoDb
        .collection(PROJECT_OWNER_COLLECTION)
        .find({ projects: { $in: projIds } })) as Cursor;
      const dataFromMongo = await cursor.toArray();
      return dataFromMongo;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async mongoGetProjectSensorRecords(
    projId: string,
    filters: Record<string, unknown> = null,
    limit: number = null
  ): Promise<unknown | undefined> {
    try {
      const SENSOR_RECORD_COLLECTION = "SensorRecord";
      let toFind = { projectList: projId };

      if (filters !== null) {
        toFind = { ...toFind, ...filters };
      }
      
      let cursor = null;

      if (limit !== null) {
        cursor = (await this.mongoDb
          .collection(SENSOR_RECORD_COLLECTION)
          .find(toFind).limit(limit)) as Cursor;
      } else {
        cursor = (await this.mongoDb
          .collection(SENSOR_RECORD_COLLECTION)
          .find(toFind)) as Cursor;
      }
      
      const dataFromMongo = await cursor.toArray();
      return dataFromMongo;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async mongoGet({ collection, docId }): Promise<unknown | undefined> {
    try {
      const cacheKey = this._mongoCacheKey(collection, docId);
      const value = this.cacheInstance.get(cacheKey);
      if (value != undefined) {
        // console.log(`read ${cacheKey} from cache.`);
        return value;
      }
      
      const dataFromMongo = await this.mongoDb
        .collection(collection)
        .findOne({ _id: docId });
      if (dataFromMongo == undefined) return undefined;
      
      this.cacheInstance.set(cacheKey, dataFromMongo);
      return dataFromMongo;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
    
  // async mongoUpdate({ collection, docId }, obj) {
  //   const lock = new AsyncLock(); // Define the lock
  //   const cacheKey = this._mongoCacheKey(collection, docId);  // Get the cacheKey

  //   const d = domain.create();
  //   d.run(() => {
  //     lock.acquire(cacheKey, function(done) {
  //       // remove undefined
  //       for (const key in obj) {
  //         if (Object.prototype.hasOwnProperty.call(obj, key)) {
  //           if (typeof obj[key] == "undefined") {
  //             delete obj[key];
  //           }
  //         }
  //       }
  
  //       // const cacheKey = this._mongoCacheKey(collection, docId);
  //       // Check local cache & mongodb
  //       return lock.acquire(cacheKey, this.mongoGet({ collection, docId }).then((cachedResult) => {
  //         if (typeof cachedResult == "undefined") {
  //           cachedResult = {};
  //         }
  //         cachedResult["_id"] = docId;

  //         // Update the cache object
  //         for (const key in obj) {
  //           if (Object.hasOwnProperty.call(obj, key)) {
  //             cachedResult[key] = obj[key];
  //           }
  //         }
  //         // Set the cache to the updated cache pbject
  //         this.cacheInstance.set(cacheKey, cachedResult);
  //         const id = { _id: docId };
  //         const updateDoc = {
  //           $set: cachedResult,
  //         };

  //         return lock.acquire(cacheKey, this.mongoDb
  //           .collection(collection)
  //           .updateOne(id, updateDoc, { upsert: true })
  //         );
  //       return obj;
  //     })
  //   })
  // }

  async mongoUpdate({ collection, docId }, obj) {
    // const uuid = uuidv4();
    // console.log(`ENTER MONGO UPDATE, UUID IS: ${uuid}`);
    // console.log(`REQUIRING THE LOCK, UUID IS: ${uuid}`);
    // console.log(`ACQUIRED LOCK, UUID IS: ${uuid}`)
    // remove undefined
    const cacheKey = this._mongoCacheKey(collection, docId);  // Get the cacheKey
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] == "undefined") {
          delete obj[key];
        }
      }
    }

    let cachedResult = await this.mongoGet({ collection, docId })

    // console.log(`FIRST AWAIT HAS BEEN PASSED, UUID IS: ${uuid}`);

    if (typeof cachedResult == "undefined") {
      cachedResult = {};
    }
    cachedResult["_id"] = docId;
        

    // Update the cache object
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        cachedResult[key] = obj[key];
      }
    }
    // Set the cache to the updated cache pbject
    this.cacheInstance.set(cacheKey, cachedResult);
    const id = { _id: docId };
    const updateDoc = {
      $set: cachedResult,
    };

    await this.mongoDb
      .collection(collection)
      .updateOne(id, updateDoc, { upsert: true });

    // console.log(`SECOND AWAIT HAS BEEN PASSED, UUID IS: ${uuid}`);
    // console.log(`HAS RETURNED IN INTERNAL FUNCTION, UUID IS: ${uuid}`);
    return obj;
  }

  _mongoCacheKey(collection: any, docId: any) {
    return `_mongo_${collection}/${docId}`;
  }

  getResearchFields(): models.RESEARCH_FIELDS {
    if (this._researchFields == undefined) {
      this._researchFields = new models.RESEARCH_FIELDS();
    }
    return this._researchFields;
  }

  async getSensors(): Promise<Array<models.SensorStored>> {
    const ret = [];
    const cacheKeys = this.cacheInstance.keys();
    const keysOfSensors = cacheKeys.filter((val, index, arr) =>
      val.startsWith(`_mongo_${models.SensorStored.name}/`)
    );
    keysOfSensors.forEach((val) => {
      ret.push(this.cacheInstance.get(val));
    });

    const countInCache = keysOfSensors.length;
    const atLeastCacheCount = 500;
    if (countInCache < atLeastCacheCount) {
      const cursor = this.mongoDb
        .collection(models.SensorStored.name)
        .find({
          id: {
            $nin: ret.map((el: models.SensorStored) => el._id),
          },
        })
        .limit(atLeastCacheCount - countInCache);
      const sensorsInDB = (await cursor.toArray()) as models.SensorStored[];
      sensorsInDB.forEach((sensor) => {
        this.cacheInstance.set(
          this._mongoCacheKey(models.SensorStored.name, sensor._id),
          sensor
        );
        ret.push(sensor);
      });
    }
    return ret;
  }
  getAPILevels(): Array<number> {
    return models.AndroidAPIPrjRequirement.getValidAPILevels();
  }
  getDeviceModels(): Array<string> {
    return models.DeviceModelPrjRequirement.getValidDeviceModels();
  }
  getFrequencyLevels(): Array<number> {
    return models.SensorPrjRequirement.getValidFrequencyLevels();
  }

  async getTheLatestConf(): Promise<models.ConstantConf> {
    const cacheKeyOfLatestId = `latest_id_${models.ConstantConf.name}`;
    let latestId = this.cacheInstance.get(cacheKeyOfLatestId);
    if (latestId != undefined) {
      const cacheKeyOfLatestConf = this._mongoCacheKey(
        models.ConstantConf.name,
        latestId
      );
      const latestConf = this.cacheInstance.get(cacheKeyOfLatestConf);
      if (latestConf != undefined) {
        return latestConf as models.ConstantConf;
      }
    }
    try {
      const cursor = this.mongoDb
        .collection(models.ConstantConf.name)
        .find()
        .sort({ _id: -1 })
        .limit(1) as Cursor;
      let latestDocument;
      // let latestDocuments = await (await db.collection(models.ConstantConf.name).orderBy('id', 'desc').limit(1).get()).docs;
      var latestConf: models.ConstantConf;
      if ((await cursor.count()) > 0) {
        const docs = await cursor.toArray();
        latestId = docs[0]._id;
        latestConf = docs[0] as unknown as models.ConstantConf;
      } else {
        // First upload the ConstConf to firestore
        const id = latestId == undefined ? 1 : Number(latestId) + 1;
        latestConf = new models.ConstantConf();
        latestConf.id = id;
        latestId = id;
        const path = { collection: models.ConstantConf.name, docId: id };
        await this.mongoUpdate(path, latestConf);
      }
      this.cacheInstance.set(cacheKeyOfLatestId, latestId);
      this.cacheInstance.set(
        this._mongoCacheKey(models.ConstantConf.name, latestId),
        latestConf
      );
      return latestConf;
    } catch (e) {
      console.log(e);
    }
  }
  async mongoGetAllParticipantsCached(): Promise<
    Record<string, models.Participant>
  > {
    const ret = {};
    const cacheKeys = this.cacheInstance.keys();
    const prefix = `_mongo_${models.Participant.name}/`;
    const keysOfParticipant = cacheKeys.filter((val, index, arr) => {
      const rett = val.startsWith(prefix);
      return rett;
    });
    keysOfParticipant.forEach((val) => {
      ret[val] = this.cacheInstance.get(val);
    });

    const countInCache = keysOfParticipant.length;
    const atLeastCacheCount = 500;
    if (countInCache < atLeastCacheCount) {
      const cursor = this.mongoDb
        .collection(models.Participant.name)
        .find({
          email: {
            $nin: keysOfParticipant.map((key) => key.substring(prefix.length)),
          },
        })
        .limit(atLeastCacheCount - countInCache);
      const participantsInDB = (await cursor.toArray()) as models.Participant[];
      participantsInDB.forEach((participant) => {
        this.cacheInstance.set(
          this._mongoCacheKey(models.Participant.name, participant.email),
          participant
        );
        ret[participant.email] = participant;
      });
    }
    return ret;
  }
  async mongoGetAllParticipantsReachedUnsentLimit(): Promise<Set<string>> {
    const cursor = this.mongoDb
      .collection(models.ParticipantReachedUnsentLimit.name)
      .find();
    const resultArray = (await cursor.toArray()).map((el) => el.participantId);
    const ret = new Set(resultArray);
    return ret;
  }
}

// export class DocumentReferenceCached {
//     path: string;
//     async data(){
//         const docSnapshot = await db.doc(this.path).get();
//         return docSnapshot.data();
//     }
//     constructor(path) {
//         this.path = path;
//     }
// }

const cache = new MyCache();

export default cache;
