/* ============================================
   دليل المغرب — Main JavaScript
   ============================================ */

(function () {
    "use strict";


    /* ============================================
       Mobile Menu
    ============================================ */

    function toggleMenu() {
        const menu = document.querySelector(".nav-links");

        if (!menu) {
            return;
        }

        menu.classList.toggle("active");
    }


    /* Make toggleMenu available to HTML if needed */
    window.toggleMenu = toggleMenu;


    /* ============================================
       Close Mobile Menu
    ============================================ */

    document.addEventListener("click", function (event) {

        const menu = document.querySelector(".nav-links");
        const button = document.querySelector(".menu-button");

        if (!menu || !button) {
            return;
        }

        if (
            !menu.contains(event.target) &&
            !button.contains(event.target)
        ) {
            menu.classList.remove("active");
        }

    });


    /* ============================================
       Close Menu After Clicking a Link
    ============================================ */

    document.addEventListener("DOMContentLoaded", function () {

        const menu = document.querySelector(".nav-links");

        if (!menu) {
            return;
        }

        const links = menu.querySelectorAll("a");

        links.forEach(function (link) {

            link.addEventListener("click", function () {

                menu.classList.remove("active");

            });

        });

    });


    /* ============================================
       Smooth Scroll
    ============================================ */

    document.addEventListener("DOMContentLoaded", function () {

        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(function (link) {

            link.addEventListener("click", function (event) {

                const targetId = this.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#" ||
                    targetId.length <= 1
                ) {
                    return;
                }

                const target = document.querySelector(targetId);

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });

    });


    /* ============================================
       Active Navigation
       ============================================ */

    document.addEventListener("DOMContentLoaded", function () {

        const currentPage =
            window.location.pathname.split("/").pop() || "index.html";

        const navLinks =
            document.querySelectorAll(".nav-links a");

        navLinks.forEach(function (link) {

            const href = link.getAttribute("href");

            if (!href) {
                return;
            }

            const linkPage = href.split("#")[0];

            if (
                linkPage &&
                linkPage === currentPage
            ) {
                link.classList.add("active");
            }

        });

    });


    /* ============================================
       Prevent Errors From Missing Elements
       ============================================ */

    window.addEventListener("error", function (event) {

        console.warn(
            "دليل المغرب: حدث خطأ في إحدى وظائف الصفحة.",
            event.message || ""
        );

    });


})();