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

// ✅ Route to handle leave application form submission
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
