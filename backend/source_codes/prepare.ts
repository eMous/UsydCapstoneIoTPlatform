import cache from "./cache";
import { v4 as uuidv4 } from "uuid";

if (!("toJSON" in Error.prototype))
  Object.defineProperty(Error.prototype, "toJSON", {
    value: function () {
      var alt = {};

      Object.getOwnPropertyNames(this).forEach(function (key) {
        alt[key] = this[key];
      }, this);

      return alt;
    },
    configurable: true,
    writable: true,
  });

const previousConsoleError = console.error;
console.error = function (...data: any[]) {
  let msg = data.reduce((pre, cur) => {
    return pre + cur + "</br>";
  }, "");
  cache.mongoDb
    .collection("ServerError")
    .insertOne(
      JSON.parse(JSON.stringify({ errorMsg: msg, time: new Date().toString() }))
    );

  previousConsoleError(data);
};

export function shuffle(inputArray: any) {
  var array = inputArray;
  var m = array.length,
    t,
    i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}
