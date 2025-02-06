const express=require('express')
const router=express.Router()
const supabase=require('../../connection')



router.get("/all-result/:student_id", async (req, res) => {
    const { student_id } = req.params;
    try {
        const { data, error } = await supabase
        .from("completed_courses")
        .select("course_code, grade, course:course_code(name, credit)") // Fetch related course details
        .eq("student_id", student_id);
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Error fetching courses for improvement:", err.message);
        res.status(500).json({ success: false, message: "Error fetching courses", error: err.message });
    }
  });
router.get("/courses-to-improve/:student_id", async (req, res) => {
    const { student_id } = req.params;
    try {
        const { data, error } = await supabase
            .from("completed_courses")
            .select("course_code, grade, course:course_code(name, credit)") // Fetch related course details
            .eq("student_id", student_id)
            .lt("grade", 3.25)
            .order("grade", { ascending: true });
  
        if (error) throw error;
  
        // Format the response properly
        const formattedData = data.map(item => ({
            course_code: item.course_code,
            course_name: item.course.name,
            credit: item.course.credit,
            grade: item.grade
        }));
  
        res.status(200).json({ success: true, data: formattedData });
    } catch (err) {
        console.error("Error fetching courses for improvement:", err.message);
        res.status(500).json({ success: false, message: "Error fetching courses", error: err.message });
    }
  });



module.exports = router;