$(function () {
    $("#body3").css("opacity", 0).animate({ opacity: 1 }, 500);

    $("#row1 ").hover(function () { $(this).animate({ paddingRight: "30px" }, 120); },
        function () { $(this).animate({ paddingRight: "22px" }, 120); });
        
    $("#side a.exit").click(function (ev) {
        if (!confirm("Do you want to leave the website?")) { ev.preventDefault(); }
    });
    if ($("#table2").length) { setupFleet(); }
});

function setupFleet() {
    $("#reserve").attr("novalidate", "novalidate");

    $(".ditailsbox").change(function () {
        var panel = $(this).closest("tr").next("tr.details");
        if (this.checked) { panel.slideDown(250); } else { panel.slideUp(250); }
    });

    var $pick = $("#table2 tr:not(.details) td:last-child input[type=checkbox]");
    $("#goBtn").after('<span id="pickCount"></span>');
    $pick.change(function () {
        var n = $pick.filter(":checked").length;
    });

    $("#Detaile-card").hide();

    $("#goBtn").click(function () {
        if ($pick.filter(":checked").length === 0) { alert("Please select"); return; }
        $("#Detaile-card").slideDown(350);
        $("html, body").animate({ scrollTop: $("#reserve").offset().top - 20 }, 450);
    });

    $("#reserve").submit(function (ev) {
        ev.preventDefault();
        if (runChecks()) { buildSummary(); }
    });
}


function toDate(s) {
    var p = s.split("-");
    if (p.length !== 3 || p[0].length !== 4 || p[1].length !== 2 || p[2].length !== 2) { return null; }
    var y = Number(p[0]), m = Number(p[1]), d = Number(p[2]);
    if (isNaN(y) || isNaN(m) || isNaN(d)) { return null; }
    var dt = new Date(Date.UTC(y, m - 1, d));
    var same = dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
    return same ? dt : null;
}

var rules = {
    fullName: function (v) {
        if (v === "") { return ""; }
        var words = v.split(" ");
        for (var i = 0; i < words.length; i++) {
            if (!/^[A-Za-z]+$/.test(words[i])) { return "Name must contain English letters only"; }
        }
        return words.length < 2 ? "Please enter your full name (at least two words)." : "";
    },
    nid: function (v) {
        if (v === "") { return "Required field."; }
        if (v.length !== 11 || isNaN(v) || v.indexOf(".") >= 0 || v.indexOf("+") >= 0 || v.indexOf("-") >= 0) { return "Must be exactly 11 digits."; }
        var g = Number(v.substr(0, 2));
        return (g >= 1 && g <= 14) ? "" : "The first two digits must be from 01 to 14.";
    },
    from: function (v) {
        if (v === "") { return "Required field."; }
        return toDate(v) ? "" : "Use the yyyy-mm-dd valid date.";
    },
    to: function (v, all) {
        if (v === "") { return "Required field."; }
        var e = toDate(v);
        if (!e) { return "Use the yyyy-mm-dd valid date."; }
        var s = toDate(all.from);
        return (s && e.getTime() <= s.getTime()) ? "Must be after the start date." : "";
    },
    phone: function (v) {
        if (v === "") { return ""; }
        var local = v.replace(/^(\+963|00963)/, "0");
        var okNet = /^09(3|8|9)\d{7}$/.test(local) || /^09(4|5|6)\d{7}$/.test(local);
        return okNet ? "" : "Number must be Syriatel or MTN";
    },
    mail: function (v) {
        if (v === "") { return ""; }
        return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v) ? "" : "Invalid email format.";
    }
};

function runChecks() {
    var vals = {}, valid = true;
    $.each(rules, function (id) { vals[id] = trimValue("#" + id); });

    $.each(rules, function (id, fn) {

        var msg = fn(vals[id], vals);

        var input = $("#" + id);

        input.toggleClass("invalid", msg !== "");
        var msgEl = input.next(".msg");
        if (!msgEl.length) { msgEl = $('<span class="msg"></span>').insertAfter(input); }
        msgEl.text(msg);
        if (msg !== "") { valid = false; }
    });
    return valid;
}

function trimValue(selector) {
    return String($(selector).val() || "").replace(/^\s+|\s+$/g, "");
}

function buildSummary() {
    var days = Math.round((toDate(trimValue("#to")) - toDate(trimValue("#from"))) / 864e5);
    var lines = [], total = 0;
    var picks = $("#table2 tr:not(.details) td:last-child input[type=checkbox]:checked").get();
    for (var i = 0; i < picks.length; i++) {
        var tr = $(picks[i]).closest("tr");
        var price = Number(tr.find(".price").text());
        total += price * days;
        lines.push("<tr><td>" + tr.children("td").eq(1).text().trim() + "</td><td>" + days + " day(s)</td><td>" + (price * days).toLocaleString("en-US") + "</td></tr>");
    }
    var disc = days > 10 ? total * 0.05 : 0;

    var out = "<h2>Booking Received</h2>";

    var nm = trimValue("#fullName");

    if (nm) {
         out += "<p>Hello " + nm + ", here is your booking summary:</p>"; 
    }
    out += "<table><tr><th>Car</th><th>Rental Period</th><th>Cost (SYP)</th></tr>" + lines.join("") + "</table>";
    out += "<p>Subtotal before discount: <b>" + total.toLocaleString("en-US") + "</b> SYP</p>";
    out += "<p>Discount (" + (disc > 0 ? "5% for rentals over 10 days" : "none") + "): <b>" + disc.toLocaleString("en-US") + "</b> SYP</p>";

    out += "<p>Final amount: <b>" + (total - disc).toLocaleString("en-US") + "</b> SYP</p>";
    $("#summary").html(out).hide().slideDown(400);

    $("html, body").animate({ scrollTop: $("#summary").offset().top - 20 }, 450);
}
