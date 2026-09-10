const ICONS = {
  hurdles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20V9"/><path d="M3 12h8"/><path d="M11 20V9"/><path d="M13 20v-8"/><path d="M13 14h8"/><path d="M21 20v-8"/><circle cx="8" cy="5.5" r="1.6" fill="currentColor"/><path d="M7 8.2c2.2-1 4.4.4 6.2-1.4"/></svg>',
  shooting: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  sprint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="15.5" cy="5" r="1.7" fill="currentColor"/><path d="M4 20l4.2-6.4 3.3 2.2L16 9"/><path d="M10 11.4 8 8.2"/><path d="M14.8 9.2 18 7.8"/></svg>',
  endurance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 13V8.5"/><path d="M12 13l3.4 2"/><path d="M9 3h6"/></svg>'
};

const EVENTS = [
  {
    id: "hurdles",
    title: "موانع",
    kind: "lower",
    unit: "رکورد",
    icon: "hurdles",
    reference: 240,
    pointsPerUnit: 7
  },
  {
    id: "shooting",
    title: "تیراندازی",
    kind: "higher",
    unit: "نمره",
    icon: "shooting",
    reference: 180,
    pointsPerUnit: 7
  },
  {
    id: "sprint",
    title: "دو سرعت",
    kind: "lower",
    unit: "ثانیه",
    icon: "sprint",
    reference: 31.5,
    pointsPerUnit: 23,
    step: "0.01"
  },
  {
    id: "endurance",
    title: "دو استقامت",
    kind: "time",
    unit: "دقیقه و ثانیه",
    icon: "endurance",
    referenceSeconds: 28 * 60,
    pointsPerSecond: 1
  }
];

const fa = (n) => Number(n).toLocaleString("fa-IR", { maximumFractionDigits: 1 });

function parseLocaleNumber(raw) {
  if (raw == null) return null;
  const mapped = String(raw)
    .trim()
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/,/g, ".")
    .replace(/٫/g, ".");
  if (mapped === "") return null;
  const value = Number(mapped);
  return Number.isNaN(value) ? null : value;
}

function calcScore(event, rawValue) {
  if (rawValue === null || Number.isNaN(rawValue)) return null;

  if (event.kind === "time") {
    return Math.round(1000 + event.pointsPerSecond * (event.referenceSeconds - rawValue));
  }

  const delta = event.kind === "higher"
    ? rawValue - event.reference
    : event.reference - rawValue;

  return Math.round(1000 + delta * event.pointsPerUnit);
}

function render() {
  const root = document.getElementById("events");
  root.innerHTML = EVENTS.map((event) => {
    const input = event.kind === "time"
      ? `<div class="time-fields">
           <div class="field">
             <label>دقیقه</label>
             <input class="num" data-id="${event.id}" data-part="minutes" inputmode="numeric" placeholder="28" />
           </div>
           <div class="field">
             <label>ثانیه</label>
             <input class="num" data-id="${event.id}" data-part="seconds" inputmode="decimal" placeholder="30" />
           </div>
         </div>`
      : `<div class="field">
           <label>${event.unit}</label>
           <input class="num" data-id="${event.id}" inputmode="decimal" step="${event.step || "1"}" placeholder="${event.reference}" />
         </div>`;

    return `<article class="event-card tone-${event.icon}" id="card-${event.id}">
      <div class="event-head">
        <div class="event-name">
          <span class="icon">${ICONS[event.icon]}</span>
          <h2>${event.title}</h2>
        </div>
      </div>
      <div class="fields">
        ${input}
        <div class="score-box">
          <span>امتیاز</span>
          <strong data-score="${event.id}">—</strong>
        </div>
      </div>
    </article>`;
  }).join("");
}

function readValue(event) {
  if (event.kind === "time") {
    const minutesRaw = document.querySelector(`[data-id="${event.id}"][data-part="minutes"]`).value;
    const secondsRaw = document.querySelector(`[data-id="${event.id}"][data-part="seconds"]`).value;
    if (minutesRaw === "" && secondsRaw === "") return null;
    return (parseLocaleNumber(minutesRaw) || 0) * 60 + (parseLocaleNumber(secondsRaw) || 0);
  }

  return parseLocaleNumber(document.querySelector(`[data-id="${event.id}"]`).value);
}

const STORAGE_KEY = "athletics-history";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function todayInputValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatFaDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEventValue(event, value) {
  if (value == null) return "—";
  if (event.kind === "time") {
    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60);
    return `${fa(minutes)}:${fa(seconds).padStart(2, "۰")}`;
  }
  return fa(value);
}

function collectRecord() {
  const athlete = document.getElementById("athlete").value.trim();
  const date = document.getElementById("recordDate").value || todayInputValue();
  const events = {};
  let total = 0;
  let filled = 0;

  EVENTS.forEach((event) => {
    const value = readValue(event);
    const score = calcScore(event, value);
    events[event.id] = {
      value,
      display: formatEventValue(event, value),
      score
    };
    if (score !== null) {
      total += score;
      filled += 1;
    }
  });

  return { athlete, date, events, total, filled };
}

function updateScores() {
  const scores = EVENTS.map((event) => {
    const score = calcScore(event, readValue(event));
    const card = document.getElementById(`card-${event.id}`);
    card.classList.toggle("is-filled", score !== null);
    document.querySelector(`[data-score="${event.id}"]`).textContent = score === null ? "—" : fa(score);
    return score;
  });

  const filled = scores.filter((s) => s !== null);
  document.getElementById("totalScore").textContent = filled.length ? fa(filled.reduce((a, b) => a + b, 0)) : "—";
  renderHistory();
}

function updateAthleteList() {
  const names = [...new Set(loadHistory().map((item) => item.athlete))].sort((a, b) => a.localeCompare(b, "fa"));
  document.getElementById("athleteList").innerHTML = names
    .map((name) => `<option value="${name.replace(/"/g, "&quot;")}"></option>`)
    .join("");
}

function renderHistory() {
  const root = document.getElementById("history");
  const currentName = document.getElementById("athlete").value.trim();
  const items = loadHistory()
    .filter((item) => !currentName || item.athlete === currentName)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  if (!items.length) {
    root.innerHTML = "";
    return;
  }

  const grouped = new Map();
  items.forEach((item) => {
    if (!grouped.has(item.athlete)) grouped.set(item.athlete, []);
    grouped.get(item.athlete).push(item);
  });

  root.innerHTML = [...grouped.entries()].map(([name, records]) => {
    const rows = records.map((item) => {
      const details = EVENTS.map((event) => {
        const entry = item.events[event.id];
        if (!entry || entry.score == null) return "";
        return `<span>${event.title}: ${entry.display} (${fa(entry.score)})</span>`;
      }).filter(Boolean).join("");

      return `<article class="history-row">
        <div>
          <strong>${formatFaDate(item.date)}</strong>
          <div class="history-details">${details}</div>
        </div>
        <div class="history-side">
          <b>${fa(item.total)}</b>
          <button type="button" class="ghost" data-delete="${item.id}">حذف</button>
        </div>
      </article>`;
    }).join("");

    return `<section class="history-group">
      <h3>${escapeHtml(name)}</h3>
      ${rows}
    </section>`;
  }).join("");
}

function saveRecord() {
  const record = collectRecord();
  if (!record.athlete) {
    document.getElementById("athlete").focus();
    return;
  }
  if (!record.filled) return;

  const items = loadHistory();
  items.push({
    id: String(Date.now()),
    athlete: record.athlete,
    date: record.date,
    events: record.events,
    total: record.total
  });
  saveHistory(items);
  updateAthleteList();
  renderHistory();
}

render();
document.getElementById("recordDate").value = todayInputValue();
updateAthleteList();
updateScores();

document.getElementById("events").addEventListener("input", updateScores);
document.getElementById("athlete").addEventListener("input", renderHistory);
document.getElementById("saveBtn").addEventListener("click", saveRecord);
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("athlete").value = "";
  document.getElementById("recordDate").value = todayInputValue();
  document.querySelectorAll("#events input").forEach((input) => { input.value = ""; });
  updateScores();
});
document.getElementById("history").addEventListener("click", (e) => {
  const button = e.target.closest("[data-delete]");
  if (!button) return;
  saveHistory(loadHistory().filter((item) => item.id !== button.dataset.delete));
  updateAthleteList();
  renderHistory();
});
