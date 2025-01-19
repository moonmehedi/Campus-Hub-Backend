require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT||3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// Example route to get data from Supabase
app.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
});

// // Example route to insert data into Supabase
// app.post('/users', async (req, res) => {
//   const { name, email } = req.body;

//   const { data, error } = await supabase
//     .from('users')
//     .insert([{ name, email }]);

//   if (error) {
//     return res.status(500).json({ error: error.message });
//   }

//   res.status(201).json(data);
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
