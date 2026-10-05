/* ==========================================
   دليل المغرب - Security Module
   ========================================== */

/*
 * This website does not use aggressive browser
 * blocking or anti-DevTools scripts.
 *
 * The goal is to keep the website:
 * - Fast
 * - Accessible
 * - User-friendly
 * - Search-engine friendly
 * - Easy to maintain
 *
 * No Ctrl+U blocking
 * No Ctrl+S blocking
 * No infinite debugger loops
 * No anti-copy tricks
 */


/* ==========================================
   BASIC ERROR HANDLING
   ========================================== */

window.addEventListener("error", function (event) {
    console.warn(
        "دليل المغرب: حدث خطأ في إحدى وظائف الصفحة.",
        event.message || ""
    );
});


/* ==========================================
   UNHANDLED PROMISE ERRORS
   ========================================== */

window.addEventListener("unhandledrejection", function (event) {
    console.warn(
        "دليل المغرب: حدث خطأ غير متوقع.",
        event.reason || ""
    );
});