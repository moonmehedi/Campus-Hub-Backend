const express=require('express')
const router=express.Router()
const supabase=require('../../connection')

router.get('/',async(req,res)=>{
    try {
        const{data,error}=await supabase.from("notices").select("*");
        if (error) throw error
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

module.exports = router;