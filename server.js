import 'dotenv/config';
import express from 'express';
import supabase from './db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Example route to get data from Supabase
app.get('/', async (req, res) => {
  res.status(200).send("Hello World");
});

app.get('/student',async(req,res)=>{
  const {data,error}=await supabase.from('student').select('*');
  if(error){
    return res.status(500).json({error:error.message});
  }
  res.status(200).json(data);
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
