const express = require('express');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const serviceRoleKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
const supabaseUrl = 'https://YOUR_PROJECT.supabase.co';

app.post('/forwardToSupabase', async (req, res) => {
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
      })
    });

    const data = await response.json();
    res.status(200).json({ message: "Inserted into Supabase", data });
  } catch (error) {
    console.error("Error:", error);
    res.status(401).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});