
const express = require("express");
const supabase = require("./connection");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


// Multer for handling file uploads (stores files in memory)
const upload = multer({ storage: multer.memoryStorage() });

app.get("/all-result/:student_id", async (req, res) => {
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

app.get("/courses-to-improve/:student_id", async (req, res) => {
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

app.get("/courses-to-exam/:student_id", async (req, res) => {
  const { student_id } = req.params;
  try {
      const { data, error } = await supabase
          .from("completed_courses")
          .select("course_code, grade, course:course_code(name, credit)") // Fetch related course details
          .eq("student_id", student_id)
          .lt("grade", 3.25)
          .order("grade", { ascending: true })
          .limit(3);

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

// Route to fetch leave request details by student ID
app.get("/leave-requests/:student_id", async (req, res) => {
    const { student_id } = req.params;
 
    try {
      const { data, error } = await supabase
        .from("leave")
        .select("*")
        .eq("student_id", student_id)
        .is("status", null);
      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ success: false, message: "Leave request not found" });
      }
 
      res.status(200).json({ success: true, data: data[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error fetching leave request details" });
    }
  });
 

// Route to fetch all leave requests

app.get("/leave-requests", async (req, res) => {
  try {
      const { data, error } = await supabase
          .from("leave")
          .select("*")
          .is("status", null);  // Filter for rows where status is NULL

      if (error) throw error;

      res.status(200).json({ success: true, data });
  } catch (error) {
      console.error("Error fetching leave requests:", error.message);
      res.status(500).json({ success: false, message: "Error fetching leave requests", error: error.message });
  }
});


/**
 * ✅ Approve or reject a leave request
 */
app.post("/update-leave-status", async (req, res) => {
  const { student_id, leave_date, class_period, course_code, status } = req.body;

  try {
    if (status !== true && status !== false) {
      return res.status(400).json({ success: false, message: "Invalid status value. It must be true or false." });
    }

    const { error } = await supabase
      .from("leave")
      .update({ status })
      .match({ student_id, leave_date, class_period, course_code });

    if (error) throw error;

    // If approved, update the attendance remark
    if (status) {
      await supabase
        .from("attendance")
        .update({ remark: "Approved" })
        .match({ student_id, date: leave_date, class_period, course_code });
    }
    else {
      await supabase
        .from("attendance")
        .update({ remark: "Rejected" })
        .match({ student_id, date: leave_date, class_period, course_code });
    }

    res.status(200).json({
      success: true,
      message: `Leave status updated to ${status ? 'approved' : 'cancelled'}`,
    });
  } catch (error) {
    console.error("Error updating leave status:", error.message);
    res.status(500).json({ success: false, message: "Error updating leave status", error: error.message });
  }
});

/*
// Route to update leave request status (Approve/Cancel)
app.post("/update-leave-status", async (req, res) => {
  const { student_id, leave_date, class_period, course_code, status } = req.body;

  try {
    // Ensure status is a valid Boolean (either TRUE or FALSE)
    if (status !== true && status !== false) {
      return res.status(400).json({ success: false, message: "Invalid status value. It must be true or false." });
    }
    
    // Update the leave status based on provided conditions
    const { data, error } = await supabase
      .from("leave")
      .update({ status }) // Set the new status (TRUE or FALSE)
      .match({ student_id, leave_date, class_period, course_code }); // Match the leave request

    if (error) throw error;
    console.log("Data to change ");
    // Check if the data was actually updated

    // Send success response
    res.status(200).json({
      success: true,
      message: `Leave status updated to ${status ? 'approved' : 'cancelled'}`,
    });
  } catch (error) {
    console.error("Error updating leave status:", error.message);
    res.status(500).json({ success: false, message: "Error updating leave status", error: error.message });
  }
});

*/

//  Route to handle leave application form submission


app.post("/submit-leave-application", upload.single("document"), async (req, res) => {
    try {
        const { name, id, level, department, section, courseCode, date, class_period, reason } = req.body;
        const document = req.file ? req.file.buffer : null; // Extract file as binary
        if (!name || !id || !courseCode || !date || !class_period || !reason) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        // Prepare data to insert
        const newLeaveData = {
            student_id: parseInt(id),
            leave_date: date,
            class_period: parseInt(class_period),
            course_code: parseInt(courseCode),
            student_name: name,
            dept: department,
            reason,
            document, // Add document binary data
        };
        console.log("Data to insert:", newLeaveData);
        // Insert data into Supabase
        const { data, error } = await supabase.from("leave").insert([newLeaveData]);
        if (error) throw error;
        res.status(200).json({ success: true, message: "Leave application submitted successfully", data });
    } catch (error) {
        console.error("Error submitting leave application:", error.message);
        res.status(500).json({ success: false, message: "Error submitting leave application", error: error.message });
    }
});


// ✅ Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



