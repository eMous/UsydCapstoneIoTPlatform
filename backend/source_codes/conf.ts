// Firebase Clients Side
import firebase from "firebase";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyAc0lq0LSUmtmQGKWindP0VBqBD0dKkFa8",
  authDomain: "sensordatacollector-27ecd.firebaseapp.com",
  databaseURL: "https://sensordatacollector-27ecd.firebaseio.com",
  projectId: "sensordatacollector-27ecd",
  storageBucket: "sensordatacollector-27ecd.appspot.com",
  messagingSenderId: "204178601091",
  appId: "1:204178601091:web:d22e6c8c1d8ab7c74857b6"
};
firebase.initializeApp(firebaseConfig);
export { firebase };

// Firebase Server Side
import fAdmin from "firebase-admin";
// const serviceAccount = {
//     "type": "service_account",
//     "project_id": "iot-platform-test-for-tom",
//     "private_key_id": "378b73a9cca9dad85fadc07e1d3360c5216b5dcd",
//     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCcqVbthQJrWTjw\nMzIdzLxJsw+daDryHUz4tWoVTgms1KXYobD3XqLJs5NBnLs7Y/iEzE//ASyMLL9b\nFmdYlQtMRv3lbh3PkJp8KweopvsMFrJFvxauDoZaFgftLtdd8jqySejP0zStGw7y\nGFUFMwouBVKO8GgsRLbmMxh83DWL2lwXhC5DU6QTfWskG7NnuqHmVFm/Icx9qSlh\n7Z71kavU/3JPcemGjsu627grBDZ2hxlYAS89IUa6bcxe6IFbxr2sr3oSZyl5Oe29\nsvzvf25CQaMN+vl3Tq5UhqilzTkwwhcKy+B5tpzajons3oKYSZsxLYaD3Xfz1TRV\n6yZxuvrJAgMBAAECggEAJdY+cQJpeazkdBshVRIwPaqaMF3OstBB2WXTd87Pxmbb\noW039R7tuUJ+Y9/rVqZIDSbdgUzyye46z1CjaEEjJ+qTgtisKYgWz7uCz4h45MwM\nhYzn+OT4LQTaKD5idMW+yHXSXXN46wA4hV88FZPktwXBEVXeCycTd5jKpsl2w056\nbN91gqPYo2A1hfwmpQXfBPFf2jzDd1c5cI2bI6Ss332AYqObNtwc+aDc7cbJ5nP8\nuwPozG0utRw9/6qibQNfFOuAB03fqUy41Upt9X6hnTxm34HkQ7wqK4c3pLwXWf6S\nCtqAfNCgbaTUG+qnf+ipKvLzbJ1VfjqNCGPwrkwlSQKBgQDWll3rMOndrX+ldJrW\npMkMWh4pohra2aK32IA+xGnsoDmEktQohONlMMfc8JQax/e2J0aCRHY4fwaU97M/\n95KfI6b9qDuZPk6E3EbdqhhLQ9UddRJLSBjs6h7Bz1lT1ViPsQwkrJ96kmZlmDeQ\nt8igKx++zh4s7k+Il6laKYCAjQKBgQC65SjHYnMJrx8hotQnLi5ObalzYGdJCjSS\nzxwDNyaGikR+yxl/qJsLOpBZkG+tOuf/kgzUzQhjzwKZplKJKpjtIQmBeNlc5KL3\nkd6TtE9qrSLoNS4Ay762i0Wel5MytGxuZXUvYQCA4jAN/9fGB6xQ2pgWsQU7pdTu\nqVIwQxJqLQKBgHuIVMjwf7F+D93QItMuSg8yUerlx0/1uhbcK/f2WoQ+ON55KGmr\nFr1KN8SZOqmwNIpIUe7sOqKLfd6EOky42U+D1r5v+t9dXxZdOO6i3Rl3E1jB7KYp\n+y9oGAy6sVHxn+oYokT6m1SUsx4JYvOM2ZJbQQs23WhASMj5hiTBf5iBAoGBAJGf\nLH7ufqP1B1S2Aofku7/wQi/b1Z5bjUs2hKUcu6/o3CXPKjcFsIi3QPIIUHuxgkLo\nEYddmkPqcCQ4K+ckgbOCIl33Q6XVoAU2ay67N4XvEVvM0+Na3WZubfh8Mf04B6Sc\n+QnJkxLZKog96GosYF8/c3F6zJEFTTwIQjnIiPihAoGAbctWp5LpOOpeK1Z4uLts\nqpTNs9roiv6N0ff/lT6jYW5N1SSMmRIVmnrd8STFbKx1eoM19FJkz++5iEKBLvG7\noQ4jLT+/yawy9r12Fh+gObCiZNJr+5rV5bWmb5BZuMtu9RBz7nZ6Kar28b17oDF6\nRVINgVyACMMFQr67Vy9NKdQ=\n-----END PRIVATE KEY-----\n",
//     "client_email": "firebase-adminsdk-4q4s6@iot-platform-test-for-tom.iam.gserviceaccount.com",
//     "client_id": "109927797148208196738",
//     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//     "token_uri": "https://oauth2.googleapis.com/token",
//     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-4q4s6%40iot-platform-test-for-tom.iam.gserviceaccount.com"
// }
fAdmin.initializeApp({
  credential: fAdmin.credential.cert({
    projectId: "sensordatacollector-27ecd",
    privateKey:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVUNKR/u4LyB7H\nWzwLLQmCL9qukF9wYmGYz/0JSUf1+v4qnqBrke/lPTDSm1XB117JDuPCn0fxmjkg\nxKOYRbzIeMqkY0aLdM655joUAezsXMtYg788KEW1CwKYdbj31+U+Fib7/dykqN8J\n1EQUBnjhWghUtCXiom7mPj9i4Hp1KwPCFl9Hoo8NFdPyMrPVC7waPOMx+pmyBFU1\nDbbuAwJhKr0Ugu/DN+KM19IJ3Tv0HlkpfuLjms2tALO+dj1m8LAgCMfRtCCbvMZX\n/zipNaawdJkJj2Bxi8TZ5n0p8x2miSNhxP6ZWT2xnMQHN0mx7Z9hSXZ4V82HVw1C\nGO1hXKS/AgMBAAECggEAEITMLDn/dy7g4NM3avvE39yQHTHRrSrlJd+/XFCkH71w\ncvdGQ2r2Fu6pwRL4Q3qifNcjMWZ9B2iKxhTwYv82vxhF6uEkw8wyC/TsG0c0loLp\nktWjHsehy+v3keBW4exw6xPOT6B/0XjxO916LpuiBzmg+aX4bwCOCPYn/bYHNius\new0HTDuQvc1jrKuf9Im7NKpSFNYwWbc/X0z5DLAyEDLCi6RDEO9kYJUsXQpbBvUI\nN2Nzw1nuElMdeVlS2P8Cmj+28EY/5graNLXZBqnxIb0GMvmMj1mv+8km14ojuxvA\nCLMu2AwzxGmu4LjHY3GROd7dF9xGKFcNAoXqCgbh2QKBgQDE8+uN7apL5PfaW/qP\nt4QV7+jrocMf8q99kSBzRrlpgmEH4SR75LbdvG1JeLusEMTE4Vxr+UQ6H56JwfEN\ngoeHUUYQjJpVx3/8+fB0ft1wLmYJdsPBJvu6LxRHyOXWF22DIBFRgEm82VioblDO\nH51pWLvJePfo2Hkx0TXaEG+aewKBgQDCFMRH3KDu2ZwCn6vlcsm4gwpMZ5chzvnB\nJyI0Bg8ogQal38/Q0Xt/5rY5ug1T6TuMhcWV4FVHT89qkr4TAprRULWD/YL1h9CL\neZKzYzFYYWEITkUiztsPmAIxxtj6TnnZIodDGtAGVk1iPFhBWfNNTFTLcYPELWfd\n22R/U9v9jQKBgQCZA3hqF89Kj2UQPI15wnXYJT+scUyLMZytzWaMqNG76xM/b+dM\nafC4bH/rqOUFVTHKU9vd9xbOoWomVIrWmCZ7NuVcTiBJrGj/PZ9WoomfcizMBX0o\nPwUrLRBwhOAraKAoU22hCC5BjgqXML2OpnlBMzMR3+2a9TOTRJq2BDbwqQKBgC/b\n8R8LcAAWV1tqRnhZWxcN8V8v+FvU70/LN6r+h4RkdOA4lcWXss2ydeM8VwcHL7ES\nV8wCuuTP8IUGVKrZbJYLQgefX0juyeVrAFsOLd/ue4AR1QilW+23fWsK7vyil3eN\nBS/uD7hQVdrQqK7M4KuCFDLq9iRNUhyqeljPtCMNAoGARQvUlHs38fk7sdfwZ74i\nzNfPfRmVMcJI5puPW1GgFa2QQddeUjlIURC0uWgDWY6YyNcYwbtTpYegNNL9s52A\n6Yy+kuXwmob0boFAT/z3kEep6irV+uoLtXjWtV5AArY+4Nw+5fvNfG6+SOYU+xIB\n119So21QoVSjjteuUiEpqy0=\n-----END PRIVATE KEY-----\n",
    clientEmail:
      "firebase-adminsdk-sjrw7@sensordatacollector-27ecd.iam.gserviceaccount.com",
  }),
});
export { fAdmin };

// Firebase Cloud Firestore
export const db = fAdmin.firestore();
