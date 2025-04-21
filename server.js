const express = require("express");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp();

const serviceRoleKey = 'حط هنا service_role key من supabase';
const supabaseUrl = 'https://bnnjifrokyurklsdiouj.supabase.co';

app.post("/forwardToSupabase", async (req, res) => {
  console.log("✅ Request from Flutter:");
  console.log(req.body);  // نطبع البيانات اللى جاية من Flutter

  const idToken = req.body.idToken;

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const response = await fetch(`${supabaseUrl}/rest/v1/patients`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        uid: uid,
        name: req.body.name,
        age: req.body.age,
        medical_history: req.body.medical_history
      }),
    });

    const data = await response.json();
    console.log("📩 Supabase Response:", data);

    res.status(200).send({ message: "✅ Inserted into Supabase", data });

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(401).send({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
