import express, { Request, Response } from "express";
import { Kafka } from "kafkajs";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import jwk from "../jwk-keys.json";
import * as crypto from "crypto";
const app = express();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "my-group" });

const tokenPrivateKey: string = fs.readFileSync(
  `${process.cwd()}/private.key`,
  "utf-8"
);
const tokenPublicKey: string = fs.readFileSync(
  `${process.cwd()}/public.key`,
  "utf-8"
);

app.use(express.json());

app.post("generate-key", (req, res) => {
  crypto.generateKeyPair(
    "rsa",
    {
      modulusLength: 1024,
      publicKeyEncoding: {
        type: "spki",

        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    },
    (err, publicKeyValue, privateKeyValue) => {
      console.log("Public => ", publicKeyValue);
      console.log("Private => ", privateKeyValue);
    }
  );
});

app.post("/token-generate", (req, res) => {
  const token = jwt.sign({ data: "test" }, tokenPrivateKey, {
    algorithm: "RS256",
    keyid: "",
  });

  return res.json({ token });
});

app.get("/first-route", async (req: Request, res: Response) => {
  console.log("req headers", req.headers);

  console.log("Bateu na rota 1");

  return res.status(200).send({ authenticated1: false });

  // return res.json({ route1: true });
});
app.get("/second-route", (req: Request, res: Response) => {
  console.log("Bateu na rota 2");

  return res.status(200).send({ authenticated2: true });
});

app.get("/third-route", (req: Request, res: Response) => {
  console.log("Bateu na rota 3");

  return res.status(200).send({ authenticated3: true });
});

app.get("/get-jwt", (req, res) => {
  console.log("BATEU NA ROTA PARA PEGAR O JWK");

  return res.json(jwk);
});

// consumer.connect().then(() => {
//   consumer.subscribe({ topic: "mytopic", fromBeginning: true }).then(() => {
//     consumer.run({
//       eachMessage: async ({ topic, partition, message }) => {
//         console.log("TOPIC", topic);
//         console.log("PARITION", partition);
//         console.log("message", message);

//         console.log({
//           value: message.value.toString(),
//         });
//       },
//     });
//   });
// });

app.listen(3000, () => {
  console.log("\x1b[32m", " ------ API ONE is Listening on port 3000 ------");
});
