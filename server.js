const express = require("express");
const supabase = require("./connection");
const cors = require('cors');
require("dotenv").config();
const app = express();
app.use(cors())
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Test Route: Check Database Connection
app.get("/test-db", async (req, res) => {
    try {
        const { data, error } = await supabase.from("test").select("*").limit(5);
        if (error) throw error;

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Route to handle leave application form submission
app.post("/submit-leave-application", async (req, res) => {
    const {
        name,
        id,
        level,
        department,
        section,
        courseCode,
        date,
        hour,
        reason,
        document
    } = req.body;

    // Log the received data for now (you can add Supabase insertion logic here)
    console.log("Received Leave Application Data:", req.body);

    // Optionally, you can store this in Supabase
    // const { data, error } = await supabase
    //   .from('leave_applications')
    //   .insert([
    //     { name, id, level, department, section, courseCode, date, hour, reason }
    //   ]);

    // If everything is successful, return a success message
    res.status(200).json({ success: true, message: "Leave application submitted" });
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
