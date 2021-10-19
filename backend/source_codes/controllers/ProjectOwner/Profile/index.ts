import { matchedData } from "express-validator";
import { ProjectOwner } from "../../../models/data";
import { register } from "../../../firebaseConfig";
import cache from "../../../cache";

module.exports.createProfileDevMode = async (req, res) => {
  try {
    await register(req.body.email, req.body.password);
    res.sendStatus(200);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.createProfile = async (req, res) => {
  const updateData = matchedData(req);
  updateData["balance"] = 0;
  const projectOwnerEmail = req["user"].email;
  const path = { collection: ProjectOwner.name, docId: projectOwnerEmail };
  const ret = await cache.mongoUpdate(path, updateData);
  res.json(ret);
  console.log(
    `A new user update its profile, its email is ${projectOwnerEmail}, updated value ${ret}`
  );
};

module.exports.retrieveProfile = async (req, res) => {
  const projectOwnerEmail = req["user"].email;
  const path = {
    collection: ProjectOwner.name,
    docId: projectOwnerEmail,
  };
  const ret = await cache.mongoGet(path);
  res.json(ret);
};

/**
 * This method adds funds to the Project Owner's funding balance
 */
module.exports.addToBalance = async (req, res) => {
  const objToAdd = matchedData(req);
  const addValue = parseFloat(objToAdd.addValue).toFixed(2);
  const projectOwnerEmail = req.user.email;
  const path = {
    collection: ProjectOwner.name,
    docId: projectOwnerEmail,
  };

  const keyArr = [
    cache._mongoCacheKey(ProjectOwner.name, projectOwnerEmail),
  ];

  await cache.lock.acquire(keyArr, async function() {
    const profile = (await cache.mongoGet(path)) as ProjectOwner;

    if (typeof profile.balance == "undefined") {
      profile.balance = 0;
    }

    profile.balance += parseFloat(addValue);
    await cache.mongoUpdate(path, profile);

    res.json({ balance: profile.balance });
  });
};
