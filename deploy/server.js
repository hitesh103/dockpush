import express from "express";
import crypto from "crypto";
import { exec } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

const app = express();
app.use(express.json({ verify: (req, res, buf) => (req.rawBody = buf) }));

const SECRET = process.env.GITHUB_SECRET;

function verifySignature(req) {
  const signature = `sha256=${crypto
    .createHmac("sha256", SECRET)
    .update(req.rawBody)
    .digest("hex")}`;
  return signature === req.headers["x-hub-signature-256"];
}

app.post("/webhook", (req, res) => {
  if (!verifySignature(req)) {
    console.log("⚠️ Invalid webhook signature");
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  if (event !== "push") {
    console.log(`ℹ️ Ignoring non-push event: ${event}`);
    return res.status(200).send("Not a push event");
  }

  const ref = req.body.ref; // e.g., "refs/heads/test"
  const branch = ref.split("/").pop();

  console.log(`🔔 Push detected on branch: ${branch}`);

  if (branch !== "test") {
    console.log("⏩ Ignoring push because it's not the 'test' branch.");
    return res.status(200).send("Push ignored (not test branch)");
  }

  console.log("🚀 Starting deployment for test branch...");

  exec("bash ./deploy/deploy.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Deploy error: ${error.message}`);
      return res.status(500).send("Deployment failed");
    }
    console.log(stdout);
    res.status(200).send("✅ Deployed successfully from test branch");
  });
});

app.listen(9000, () => console.log("Webhook server running at http://localhost:9000"));
