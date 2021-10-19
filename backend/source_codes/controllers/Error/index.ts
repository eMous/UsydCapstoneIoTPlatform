import cache from "../../cache";
import { Cursor } from "mongodb";

module.exports.log = async (req, res) => {
  let cursor = cache.mongoDb
    .collection("ServerError")
    .find()
    .sort({ _id: -1 })
    .limit(30) as Cursor;
  let html = "<center>";
  while (await cursor.hasNext()) {
    let obj = await cursor.next();
    let errorMsg = obj["errorMsg"];
    const time = obj["time"];
    if ("string" != typeof errorMsg) {
      errorMsg = JSON.stringify(errorMsg);
    }
    html = `${html}time: ${time}<br/>${errorMsg}<br/><br/><br/> `;
  }
  html = `${html}</center>`;
  res.send(html);
};
