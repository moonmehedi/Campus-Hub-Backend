const express = require("express");
const router = express.Router();
const supabase = require("../../connection");
const { getCurrentTimestamp } = require('../utils/timestamp');

// Login route
router.post('/', async (req, res) => {
    const timestamp = getCurrentTimestamp(); // Current UTC timestamp

    try {
        const { student_id, password } = req.body;

        // Query student from database - only get student_id and password
        const { data: student, error } = await supabase
            .from('student')
            .select('student_id, password')
            .eq('student_id', student_id)
            .single();

        if (error || !student) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid ID or password',
                timestamp
            });
        }

        // Direct password comparison (since it's stored as plain text)
        if (password !== student.password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid ID or password',
                timestamp
            });
        }

        // Set session data
        req.session.user = {
            student_id: student.student_id,
            loginTime: timestamp
        };

        // Log the successful login
        console.log(`[${timestamp}] Student ID ${student.student_id} logged in successfully`);

        res.json({
            success: true,
            message: 'Login successful',
            student_id: student.student_id,
            timestamp
        });

    } catch (error) {
        console.error(`[${timestamp}] Login error:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            timestamp
        });
    }
});

// Status check route
router.get('/', (req, res) => {
    const timestamp = getCurrentTimestamp();   // Current UTC timestamp

    if (req.session.user) {
        res.json({
            isAuthenticated: true,
            student_id: req.session.user.student_id,
            timestamp
        });
    } else {
        res.json({
            isAuthenticated: false,
            timestamp
        });
    }
});

// Logout route
router.post('/', (req, res) => {
    const timestamp = getCurrentTimestamp();   // Current UTC timestamp
    
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not logged in',
            timestamp
        });
    }

    const studentId = req.session.user.student_id;
    
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed',
                timestamp
            });
        }
        
        console.log(`[${timestamp}] Student ID ${studentId} logged out successfully`);
        
        res.clearCookie('connect.sid');
        res.json({ 
            success: true, 
            message: 'Logged out successfully',
            timestamp
        });
    });
});

module.exports = router;