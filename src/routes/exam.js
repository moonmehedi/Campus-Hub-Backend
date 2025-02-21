const express = require("express");
const router = express.Router();
const supabase = require("../../connection");

router.get("/test", (req, res) => {
    res.json({ 
      message: "Exam routes are working",
      currentTime: new Date().toISOString(),
      status: "OK" 
    });
  });
// Get exams within a date range
router.get("/exams/show", async (req, res) => {
  const { start, end } = req.query;
  try {
    const { data, error } = await supabase
      .from("exam_schedules")
      .select("*")
      .gte("exam_date", start)
      .lte("exam_date", end)
      .order("exam_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching exams:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create new exam
router.post("/exams/store", async (req, res) => {
  const {
    teacher_id,
    exam_name,
    exam_type,
    exam_date,
    start_time,
    end_time,
    room_number
  } = req.body;

  try {
    // Check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from("exam_schedules")
      .select("*")
      .eq("exam_date", exam_date)
      .eq("room_number", room_number)
      .or(`start_time.lte.${end_time},end_time.gte.${start_time}`);

    if (conflictError) throw conflictError;

    if (conflicts && conflicts.length > 0) {
      return res.status(400).json({
        error: "There is a scheduling conflict with another exam in this room"
      });
    }

    // Insert new exam
    const { data, error } = await supabase
      .from("exam_schedules")
      .insert([{
        teacher_id,
        exam_name,
        exam_type,
        exam_date,
        start_time,
        end_time,
        room_number
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("Error creating exam:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update exam
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    exam_name,
    exam_type,
    start_time,
    end_time,
    room_number
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("exam_schedules")
      .update({
        exam_name,
        exam_type,
        start_time,
        end_time,
        room_number,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error updating exam:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete exam
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("exam_schedules")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error deleting exam:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;