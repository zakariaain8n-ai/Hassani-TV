// ================================================
// FIFA TV - SECURITY MODULE V4
// ================================================

(function () {

    "use strict";


    /* =================================================
       BLOCK VIEW-SOURCE
    ================================================= */

    if (
        window.location.href.startsWith(
            "view-source:"
        )
    ) {

        window.location.href =
            "about:blank";

        return;
    }


    /* =================================================
       ANTI-DRAG IMAGES
    ================================================= */

    document.addEventListener(
        "dragstart",
        function (event) {

            if (
                event.target &&
                event.target.tagName === "IMG"
            ) {

                event.preventDefault();

                return false;
            }
        }
    );


    /* =================================================
       CONSOLE WARNING
    ================================================= */

    console.log(
        "%c⛔ توقف!",
        "color:#ff0040;font-size:50px;font-weight:bold;"
    );

    console.log(
        "%c🚫 هذه المنطقة مخصصة للمطورين.",
        "color:#00ff88;font-size:18px;font-weight:bold;"
    );

    console.log(
        "%c⚠️ لا تنسخ أو تلصق كوداً من شخص مجهول هنا.",
        "color:#ff0040;font-size:14px;"
    );

})();