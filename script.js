document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", function () {
            navLinks.classList.toggle("active");
        });
    }

    updateNavbar();

    if (document.querySelector(".course-container")) {
        loadCourses();
    }

    if (document.getElementById("course-name")) {
        loadCourseDetails();
    }
});

function updateNavbar() {
    const token = localStorage.getItem("token");
    const navLinks = document.querySelector(".nav-links");

    if (!navLinks) return;

    const loginLi = navLinks.querySelector('a[href="login.html"]')?.parentElement;
    const registerLi = navLinks.querySelector('a[href="register.html"]')?.parentElement;
    const profileLi = navLinks.querySelector('a[href="profile.html"]')?.parentElement;
    const logoutLi = navLinks.querySelector('#logout-btn')?.parentElement;

    if (token) {

        if (loginLi) loginLi.remove();
        if (registerLi) registerLi.remove();

        if (!profileLi) {
            const li = document.createElement("li");
            li.innerHTML = `<a href="profile.html" style="color:#00bcd4;">👤 Profile</a>`;
            navLinks.appendChild(li);
        }

        if (!logoutLi) {
            const li = document.createElement("li");
            li.innerHTML = `<a href="#" id="logout-btn" onclick="logoutUser()" style="color:#ff4444;">Logout</a>`;
            navLinks.appendChild(li);
        }

    } else {

        if (profileLi) profileLi.remove();
        if (logoutLi) logoutLi.remove();

        if (!registerLi) {
            const li = document.createElement("li");
            li.innerHTML = `<a href="register.html">Register</a>`;
            navLinks.appendChild(li);
        }

        if (!loginLi) {
            const li = document.createElement("li");
            li.innerHTML = `<a href="login.html">Login</a>`;
            navLinks.appendChild(li);
        }
    }
}

function logoutUser() {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "index.html";
}
// ======================
// Load All Courses
// ======================

async function loadCourses() {
    const container = document.querySelector(".course-container");

    if (!container) return;

    try {
        const response = await fetch("http://localhost:5000/api/courses");
        const courses = await response.json();

        container.innerHTML = "";

        courses.forEach(course => {

            const card = document.createElement("div");
            card.className = "course-card";

            card.innerHTML = `
                <i class="fas fa-book-open"></i>

                <h3>${course.name}</h3>

                <p><strong>Teacher:</strong> ${course.teacher}</p>

                <p><strong>Credits:</strong> ${course.credits}</p>

                <p>👥 ${course.enrolledStudents} Students</p>

                <p>⭐ ${course.averageRating} (${course.ratings ? course.ratings.length : 0} Ratings)</p>

                <button style="
                    margin-top:15px;
                    width:100%;
                    padding:10px;
                    background:#00bcd4;
                    color:white;
                    border:none;
                    border-radius:6px;
                    cursor:pointer;
                ">
                    View Details
                </button>
            `;

            card.onclick = function () {
                window.location.href = `course-details.html?id=${course._id}`;
            };

            container.appendChild(card);

        });

    } catch (err) {
        console.error(err);
        container.innerHTML = "<h2 style='text-align:center;color:red;'>Failed to load courses!</h2>";
    }
}

// ======================
// Search + Filter
// ======================

function filterCourses() {

    const query = document.getElementById("search-input").value.toLowerCase();

    const creditFilter = document.getElementById("credit-filter").value;

    const cards = document.querySelectorAll(".course-card");

    cards.forEach(card => {

        const text = card.innerText.toLowerCase();

        const creditText = card.querySelector("p:nth-child(4)").innerText;

        const credits = creditText.replace("Credits:", "").trim();

        const matchSearch = text.includes(query);

        const matchCredit =
            creditFilter === "all" || credits === creditFilter;

        if (matchSearch && matchCredit) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

}
// ======================
// Load Course Details
// ======================

async function loadCourseDetails() {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    try {

        const response = await fetch(`http://localhost:5000/api/courses/${id}`);
        const course = await response.json();

        document.getElementById("course-name").innerText = course.name;
        document.getElementById("course-credits").innerText = "Credits: " + course.credits;
        document.getElementById("course-teacher").innerText = "Teacher: " + course.teacher;
        document.getElementById("course-description").innerText = course.description;
        document.getElementById("student-count").innerText =
            "👥 Enrolled Students: " + course.enrolledStudents;

        document.getElementById("average-rating").innerText =
            "⭐ Average Rating: " + course.averageRating;

        document.getElementById("total-ratings").innerText =
            (course.ratings ? course.ratings.length : 0) + " Ratings";

    } catch (err) {
        console.error(err);
    }
}

// ======================
// Enroll Course
// ======================

async function enrollCourse() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const id = new URLSearchParams(window.location.search).get("id");

    try {

        const response = await fetch(`http://localhost:5000/api/courses/enroll/${id}`, {

            method: "POST",

            headers: {
                "Authorization": token
            }

        });

        const data = await response.json();

        alert(data.message);

        loadCourseDetails();

    } catch (err) {
        console.log(err);
    }

}

// ======================
// Rate Course
// ======================

async function rateCourse(star) {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first!");
        return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));

    const id = new URLSearchParams(window.location.search).get("id");

    try {

        const response = await fetch(`http://localhost:5000/api/courses/rate/${id}`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                userId: payload.id,
                star: star
            })

        });

        const data = await response.json();

        alert(data.message);

        loadCourseDetails();

    } catch (err) {
        console.log(err);
    }

}

// ======================
// Login
// ======================

async function loginUser(event) {

    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {

        const response = await fetch("http://localhost:5000/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (data.token) {

            localStorage.setItem("token", data.token);

            alert("Login Successful");

            window.location.href = "index.html";

        } else {

            alert(data.message);

        }

    } catch (err) {

        console.log(err);

    }

}

// ======================
// Register
// ======================

async function registerUser(event) {

    event.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {

        const response = await fetch("http://localhost:5000/api/auth/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })

        });

        const data = await response.json();

        alert(data.message);

        if (data.message === "Registration Successful") {
            window.location.href = "login.html";
        }

    } catch (err) {

        console.log(err);

    }

}