const express=require('express')
const router=express.Router();
const supabase=require('../../connection')

router.get('/', async (req, res) => {
    const {data,error} = await supabase 
    .from("student")
    .select("student_id,name,isActive");
    if (error) {
        res.status(500).json({ error: error.message });
    } else {
        res.status(200).json(data);
    }
})

module.exports=router;