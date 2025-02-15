require("dotenv").config();


const express = require("express");
const supabase = require("./connection");
const cors = require("cors");
const multer = require("multer");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Multer for handling file uploads (stores files in memory)
const upload = multer({ storage: multer.memoryStorage() });

//⚠️import routes from here
const noticeRouter=require("./src/routes/notices")
//⬇️Assign routes to app from here
app.use("/notices",noticeRouter);

//Dummy Homepage to avoid frustration 😅 ===Arqam
app.get("/",async(req,res)=>{
    res.send("Welcome to CampusHub")
})




//⚠️import routes from here
const Router1 = require("./src/routes/courseadvisor");
//⬇️Assign routes to app from here
app.use("/courseadvisor",Router1);
const Router2 = require("./src/routes/leave");
//⬇️Assign routes to app from here
app.use("/leave",Router2);


// ## dont move it
app.get("/courses-to-exam/:student_id", async (req, res) => {
  const { student_id } = req.params;
  try {
      const { data, error } = await supabase
          .from("enrolled_courses")
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





// ✅ Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



