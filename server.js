const express = require("express");
const supabase = require("./connection");
require("dotenv").config();

const app = express();
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
app.get("/moon", async (req, res) => {
    try {
        const { data, error } = await supabase.from("test").select("*").limit(5);
        if (error) throw error;

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
