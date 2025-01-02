document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const pages = document.querySelectorAll(".page");
    const header = document.querySelector("header");

    // Initialize default active page
    const defaultPage = document.querySelector(".page.active");
    pages.forEach((page) => {
        if (page !== defaultPage) {
            page.style.opacity = "0"; // Hide non-active pages
            page.style.transform = "translateY(50px)"; // Start below
        }
    });

    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // Reset all pages
            pages.forEach(page => {
                page.classList.remove("active");
                page.style.opacity = "0";
                page.style.transform = "translateY(50px)";
            });

            // Reset all nav links
            navLinks.forEach(nav => {
                nav.classList.remove("active");
                nav.removeAttribute("aria-current");
            });

            // Activate the selected page and nav link
            const targetPage = document.getElementById(link.dataset.page);
            if (targetPage) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
                targetPage.classList.add("active");
                targetPage.style.opacity = "1";
                targetPage.style.transform = "translateY(0)";
            }
        });
    });

});
