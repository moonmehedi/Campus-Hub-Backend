const express=require('express')
const router=express.Router();
const supabase=require('../../connection')

router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });

    if (error) {
        res.status(500).json({ error: error.message });
    } else {
        const transformedData = data.map(item => {
            if (item.timestamp) { 
                const originalTimestamp = new Date(item.timestamp);
                const formattedTimestamp = originalTimestamp.toISOString().replace('T', ' ').slice(0, 19);
                return { ...item, timestamp: formattedTimestamp };
            }
            return item;
        });
        res.status(200).json(transformedData);
    }
});
module.exports=router;