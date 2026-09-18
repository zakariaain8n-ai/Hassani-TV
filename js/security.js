/* ==========================================
   🛡️ Hassani E.com - Custom Security Module
   ========================================== */

// 1. Disable Ctrl+S (Save Page) & Ctrl+U (View Source)
document.addEventListener('keydown', function (e) {
    // Prevent Ctrl+S / Cmd+S
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        return false;
    }

    // Prevent Ctrl+U / Cmd+U
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
    }
});

// 2. Anti-DevTools Debugger Trap
// If DevTools is opened, this creates an infinite breakpoint loop to freeze inspection
(function () {
    function blockDevTools() {
        function check(a) {
            if (("" + a / a)["length"] !== 1 || a % 20 === 0) {
                (function () {}["constructor"]("debugger")());
            } else {
                (function () {}["constructor"]("debugger")());
            }
            check(++a);
        }
        try {
            check(0);
        } catch (err) {}
    }
    setInterval(blockDevTools, 300);
})();