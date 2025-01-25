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
router.post('/', async (req, res) => {
    const { teacher_id, title, content } = req.body;
    console.log(`Teacher id:${teacher_id} Title:${title} content:${content}`)
    try {
        const { data,error } = await supabase
            .from('notices')
            .insert({ teacher_id, title, content })
            .select();

        if (error) return res.status(500).json({ error: error.message });

        res.status(201).json({ message: 'Notice created successfully',data });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { teacherId, title, content } = req.body;

    try {
        const { data: notice, error: fetchError } = await supabase
            .from('notices')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (fetchError || notice.teacher_id !== teacherId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { error } = await supabase
            .from('notices')
            .update({ title, content })
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json({ message: 'Notice updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { teacherId } = req.body;
    console.log(`TeacherId: ${teacherId} NoticeId:${id}`)
    try {
        const { data: notice, error: fetchError } = await supabase
            .from('notices')
            .select('teacher_id')
            .eq('notice_id', id)
            .single();

        if (fetchError || notice.teacher_id !== teacherId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { error } = await supabase
            .from('notices')
            .delete()
            .eq('notice_id', id);

        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json({ message: 'Notice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;