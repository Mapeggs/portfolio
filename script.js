document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const pages = document.querySelectorAll(".page");

    // Set the default active page (About Me)
    const defaultPage = "about";
    document.getElementById(defaultPage).classList.add("active");

    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default anchor behavior

            // Remove active class from all nav links and pages
            navLinks.forEach(nav => nav.classList.remove("active"));
            pages.forEach(page => page.classList.remove("active"));

            // Add active class to clicked link
            const targetPage = link.getAttribute("data-page");
            link.classList.add("active");

            // Show the corresponding page
            document.getElementById(targetPage).classList.add("active");
        });
    });
});
