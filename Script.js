// CYBERSHIELD FIREWALL SIMULATOR

// TRUSTED DEVICES
const trustedSources = [
    "192.168.1.10",
    "192.168.1.12",
    "192.168.1.15"
];

// ALLOWED PORTS
const allowedPorts = [80, 443, 53];

// COUNTERS
let total = 0;
let allowed = 0;
let blocked = 0;


// SCENARIO SELECTION

const scenario = document.getElementById("scenario");

const presets = {

    normal: {
        ip: "192.168.1.10",
        port: 443,
        protocol: "HTTPS",
        direction: "OUTBOUND"
    },

    unknown: {
        ip: "203.0.113.25",
        port: 443,
        protocol: "HTTPS",
        direction: "INBOUND"
    },

    restricted: {
        ip: "192.168.1.15",
        port: 23,
        protocol: "OTHER",
        direction: "OUTBOUND"
    },

    dns: {
        ip: "192.168.1.12",
        port: 53,
        protocol: "DNS",
        direction: "OUTBOUND"
    }

};


// AUTOMATICALLY FILL INPUTS

scenario.addEventListener("change", function () {

    const data = presets[scenario.value];

    if (!data) return;

    document.getElementById("sourceIp").value = data.ip;

    document.getElementById("destinationPort").value =
        data.port;

    document.getElementById("protocol").value =
        data.protocol;

    document.getElementById("direction").value =
        data.direction;

});


// FIREWALL RULE ENGINE

function inspectRequest(request) {

    // RULE 1: BLOCK RESTRICTED PORT

    if (request.port === 23) {

        return {
            allow: false,
            rule: "RULE 1 - Restricted Port",
            reason: "Port 23 is blocked."
        };

    }


    // RULE 2: CHECK TRUSTED SOURCE

    if (!trustedSources.includes(request.ip)) {

        return {
            allow: false,
            rule: "RULE 2 - Unknown Source",
            reason: "Unknown device detected."
        };

    }


    // RULE 3: ALLOW APPROVED OUTBOUND PORTS

    if (
        allowedPorts.includes(request.port) &&
        request.direction === "OUTBOUND"
    ) {

        return {
            allow: true,
            rule: "RULE 3 - Approved Traffic",
            reason: "Trusted device and permitted port."
        };

    }


    // RULE 4: DEFAULT DENY

    return {
        allow: false,
        rule: "RULE 4 - Default Deny",
        reason: "Request does not match an allowed rule."
    };

}


// FORM SUBMISSION

document.getElementById("trafficForm")
.addEventListener("submit", function (event) {

    event.preventDefault();

    const request = {

        ip: document.getElementById("sourceIp")
        .value.trim(),

        port: Number(
            document.getElementById("destinationPort").value
        ),

        protocol: document.getElementById("protocol").value,

        direction: document.getElementById("direction").value

    };


    // INPUT VALIDATION

    if (
        !request.ip ||
        !Number.isInteger(request.port) ||
        request.port < 1 ||
        request.port > 65535
    ) {

        alert("Enter a valid IP address and port number.");

        return;

    }


    // INSPECT REQUEST

    const result = inspectRequest(request);


    // DISPLAY RESULT

    showDecision(request, result);


    // UPDATE LOG

    addLog(request, result);

});


// SHOW FIREWALL DECISION

function showDecision(request, result) {

    const box = document.getElementById("decisionBox");

    box.className = "decision-box " +
        (result.allow ? "allow" : "block");


    document.getElementById("decisionIcon").textContent =
        result.allow ? "✅" : "⛔";


    document.getElementById("decisionTitle").textContent =
        result.allow ? "ACCESS ALLOWED" : "ACCESS BLOCKED";


    document.getElementById("decisionText").textContent =
        result.reason;


    document.getElementById("detailSource").textContent =
        request.ip;


    document.getElementById("detailPort").textContent =
        request.port + " / " + request.protocol;


    document.getElementById("detailRule").textContent =
        result.rule;

}


// UPDATE STATISTICS AND EVENT LOG

function addLog(request, result) {

    total++;

    if (result.allow) {

        allowed++;

    } else {

        blocked++;

    }


    document.getElementById("totalCount").textContent =
        total;

    document.getElementById("allowedCount").textContent =
        allowed;

    document.getElementById("blockedCount").textContent =
        blocked;


    const table = document.getElementById("eventLog");


    // REMOVE EMPTY MESSAGE

    if (table.querySelector(".empty-row")) {

        table.innerHTML = "";

    }


    // CREATE NEW TABLE ROW

    const row = document.createElement("tr");

    const values = [

        new Date().toLocaleTimeString(),

        request.ip,

        request.port,

        request.protocol

    ];


    values.forEach(function (value) {

        const cell = document.createElement("td");

        cell.textContent = value;

        row.appendChild(cell);

    });


    // DECISION BADGE

    const decisionCell = document.createElement("td");

    const badge = document.createElement("span");

    badge.className = "badge " +
        (result.allow ? "allow" : "block");

    badge.textContent =
        result.allow ? "ALLOWED" : "BLOCKED";

    decisionCell.appendChild(badge);

    row.appendChild(decisionCell);


    // RULE INFORMATION

    const ruleCell = document.createElement("td");

    ruleCell.textContent = result.rule;

    row.appendChild(ruleCell);


    // ADD TO TOP OF TABLE

    table.prepend(row);

}


// CLEAR ACTIVITY LOG

document.getElementById("clearLog")
.addEventListener("click", function () {

    document.getElementById("eventLog").innerHTML = `
        <tr class="empty-row">
            <td colspan="6">
                No network requests yet.
            </td>
        </tr>
    `;


    total = 0;
    allowed = 0;
    blocked = 0;


    document.getElementById("totalCount").textContent = 0;

    document.getElementById("allowedCount").textContent = 0;

    document.getElementById("blockedCount").textContent = 0;

});
