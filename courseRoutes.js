const express = require("express");
const Course = require("./Course");

const router = express.Router();

// Get all courses
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({
            message: "Server Error"
        });
    }
});

// Delete all courses
router.delete("/deleteall", async (req, res) => {
    try {
        await Course.deleteMany({});
        res.json({ message: "All courses deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Get single course
router.get("/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json(course);

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Add a course
router.post("/", async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.json(course);
    } catch (err) {
        res.status(500).json({
            message: "Server Error"
        });
    }
});

// Enroll in a course
router.post("/enroll/:id", async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { $inc: { enrolledStudents: 1 } },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({
            message: "Enrolled Successfully",
            enrolledStudents: course.enrolledStudents
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Get student count
router.get("/count/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ enrolledStudents: course.enrolledStudents });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Rate a course
router.post("/rate/:id", async (req, res) => {
    try {

        const { userId, star } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const existingRating = course.ratings.find(r => r.userId === userId);

        if (existingRating) {
            existingRating.star = star;
        } else {
            course.ratings.push({ userId, star });
        }

        const total = course.ratings.reduce((sum, r) => sum + r.star, 0);
        course.averageRating = (total / course.ratings.length).toFixed(1);

        await course.save();

        res.json({
            message: "Rating Successful",
            averageRating: course.averageRating,
            totalRatings: course.ratings.length
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;