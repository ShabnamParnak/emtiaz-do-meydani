const ICONS = {
  hurdles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20V9"/><path d="M3 12h8"/><path d="M11 20V9"/><path d="M13 20v-8"/><path d="M13 14h8"/><path d="M21 20v-8"/><circle cx="8" cy="5.5" r="1.6" fill="currentColor"/><path d="M7 8.2c2.2-1 4.4.4 6.2-1.4"/></svg>',
  shooting: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  swim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 11c1.6-2 3.2-2 4.8 0s3.2 2 4.8 0 3.2-2 4.8 0 3.2 2 4.8 0"/><path d="M3 16c1.6-2 3.2-2 4.8 0s3.2 2 4.8 0 3.2-2 4.8 0 3.2 2 4.8 0"/><circle cx="8" cy="6" r="1.6" fill="currentColor"/></svg>',
  endurance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 13V8.5"/><path d="M12 13l3.4 2"/><path d="M9 3h6"/></svg>',
  grenade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.2V4a2 2 0 0 1 2-2h.5"/><path d="M10.2 6.2c.6-1 1.6-1.6 2.8-1.6 1.3 0 2.4.7 3 1.8"/><ellipse cx="12.2" cy="14.2" rx="5.4" ry="6.2"/><path d="M8.4 12.2h7.6"/></svg>'
};

const EVENTS = [
  {
    id: "hurdles",
    title: "موانع",
    kind: "time",
    unit: "دقیقه و ثانیه",
    icon: "hurdles",
    referenceSeconds: 2 * 60 + 40,
    pointsPerSecond: 7,
    placeholderMinutes: "2",
    placeholderSeconds: "40"
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
    id: "grenade",
    title: "نارنجک",
    kind: "higher",
    unit: "نمره",
    icon: "grenade",
    reference: 170,
    pointsPerUnit: 4
  },
  {
    id: "swim",
    title: "شنا",
    kind: "time",
    unit: "ثانیه",
    icon: "swim",
    referenceSeconds: 31.5,
    pointsPerSecond: 24,
    timeParts: "secondsHundredths",
    placeholderSeconds: "31",
    placeholderHundredths: "50",
    decimalSeconds: true
  },
  {
    id: "endurance",
    title: "دو استقامت",
    kind: "time",
    unit: "دقیقه و ثانیه",
    icon: "endurance",
    referenceSeconds: 28 * 60,
    pointsPerSecond: 1,
    placeholderMinutes: "28",
    placeholderSeconds: "00"
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

  let score;
  if (event.kind === "time") {
    score = 1000 + event.pointsPerSecond * (event.referenceSeconds - rawValue);
  } else {
    const delta = event.kind === "higher"
      ? rawValue - event.reference
      : event.reference - rawValue;
    score = 1000 + delta * event.pointsPerUnit;
  }

  return Math.max(0, Math.round(score));
}

function render() {
  const root = document.getElementById("events");
  root.innerHTML = EVENTS.map((event) => {
    const input = event.kind === "time"
      ? event.timeParts === "secondsHundredths"
        ? `<div class="time-fields">
             <div class="field">
               <label>ثانیه</label>
               <input class="num" data-id="${event.id}" data-part="seconds" inputmode="numeric" placeholder="${event.placeholderSeconds || "31"}" />
             </div>
             <div class="field">
               <label>صدم ثانیه</label>
               <input class="num" data-id="${event.id}" data-part="hundredths" inputmode="numeric" placeholder="${event.placeholderHundredths || "50"}" />
             </div>
           </div>`
        : `<div class="time-fields">
             <div class="field">
               <label>دقیقه</label>
               <input class="num" data-id="${event.id}" data-part="minutes" inputmode="numeric" placeholder="${event.placeholderMinutes || "0"}" />
             </div>
             <div class="field">
               <label>ثانیه</label>
               <input class="num" data-id="${event.id}" data-part="seconds" inputmode="decimal" step="${event.step || "1"}" placeholder="${event.placeholderSeconds || "0"}" />
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
  if (event.kind === "time" && event.timeParts === "secondsHundredths") {
    const secondsRaw = document.querySelector(`[data-id="${event.id}"][data-part="seconds"]`).value;
    const hundredthsRaw = document.querySelector(`[data-id="${event.id}"][data-part="hundredths"]`).value;
    if (secondsRaw === "" && hundredthsRaw === "") return null;
    const seconds = parseLocaleNumber(secondsRaw) || 0;
    const hundredths = parseLocaleNumber(hundredthsRaw);
    if (hundredths == null) return seconds;
    return seconds + Math.min(99, Math.max(0, hundredths)) / 100;
  }

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
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return items.map((item) => {
      if (item.events?.sprint && !item.events.swim) {
        item.events.swim = item.events.sprint;
      }
      const swim = item.events?.swim;
      if (swim && swim.value != null && !String(swim.display || "").includes(":")) {
        swim.score = Math.max(0, Math.round(1000 + 24 * (31.5 - Number(swim.value))));
        swim.display = formatEventValue(EVENTS.find((event) => event.id === "swim"), Number(swim.value));
      }
      const hurdles = item.events?.hurdles;
      if (hurdles && hurdles.value != null && !String(hurdles.display || "").includes(":")) {
        const raw = Number(hurdles.value);
        const minutes = Math.floor(raw / 100);
        const seconds = raw % 100;
        if (raw >= 100 && seconds < 60) {
          hurdles.value = minutes * 60 + seconds;
          hurdles.score = Math.max(0, Math.round(1000 + 7 * ((2 * 60 + 40) - hurdles.value)));
          hurdles.display = `${fa(minutes)}:${fa(seconds).padStart(2, "۰")}`;
          item.total = EVENTS.reduce((sum, event) => {
            const entry = event.id === "hurdles" ? hurdles : item.events?.[event.id];
            return sum + (entry?.score ?? 0);
          }, 0);
        }
      }
      item.total = recordTotal(item);
      return item;
    });
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
    const seconds = value % 60;
    if (event.decimalSeconds) {
      return Number(value).toLocaleString("fa-IR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return `${fa(minutes)}:${fa(Math.round(seconds)).padStart(2, "۰")}`;
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
  renderTable();
}

function updateAthleteList() {
  const names = [...new Set(loadHistory().map((item) => item.athlete))].sort((a, b) => a.localeCompare(b, "fa"));
  document.getElementById("athleteList").innerHTML = names
    .map((name) => `<option value="${name.replace(/"/g, "&quot;")}"></option>`)
    .join("");
}

function eventEntry(item, eventId) {
  if (item.events?.[eventId]) return item.events[eventId];
  if (eventId === "swim") return item.events?.sprint || null;
  return null;
}

function recordTotal(item) {
  return EVENTS.reduce((sum, event) => sum + (eventEntry(item, event.id)?.score ?? 0), 0);
}

function renderSummaryTable(items) {
  const head = EVENTS.map((event) => `<th>${event.title}</th>`).join("");
  const rows = items.map((item) => {
    const cells = EVENTS.map((event) => {
      const entry = eventEntry(item, event.id);
      if (!entry || entry.score == null) return `<td>—</td>`;
      return `<td><b>${fa(entry.score)}</b><small>${entry.display}</small></td>`;
    }).join("");

    return `<tr>
      <th>${escapeHtml(item.athlete)}</th>
      <td>${formatFaDate(item.date)}</td>
      ${cells}
      <td class="total-cell"><b>${fa(item.total ?? recordTotal(item))}</b></td>
      <td><button type="button" class="ghost" data-delete="${item.id}">حذف</button></td>
    </tr>`;
  }).join("");

  return `<section class="table-card summary-table">
    <h2>جمع‌بندی</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ورزشکار</th>
            <th>تاریخ</th>
            ${head}
            <th>جمع</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>`;
}

function renderTable() {
  const root = document.getElementById("historyTable");
  const items = loadHistory().sort((a, b) => b.date.localeCompare(a.date) || a.athlete.localeCompare(b.athlete, "fa"));

  if (!items.length) {
    root.innerHTML = `<p class="table-empty">هنوز رکوردی ثبت نشده</p>`;
    return;
  }

  const eventTables = EVENTS.map((event) => {
    const rows = items.filter((item) => {
      const entry = eventEntry(item, event.id);
      return entry && entry.score != null;
    });

    const body = rows.length
      ? rows.map((item) => {
          const entry = eventEntry(item, event.id);
          return `<tr>
            <th>${escapeHtml(item.athlete)}</th>
            <td>${formatFaDate(item.date)}</td>
            <td>${entry.display}</td>
            <td><b>${fa(entry.score)}</b></td>
            <td><button type="button" class="ghost" data-delete="${item.id}">حذف</button></td>
          </tr>`;
        }).join("")
      : `<tr><td class="table-empty" colspan="5">هنوز رکوردی برای این ماده نیست</td></tr>`;

    return `<section class="table-card event-table tone-${event.icon}">
      <h2><span class="icon">${ICONS[event.icon]}</span>${event.title}</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ورزشکار</th>
              <th>تاریخ</th>
              <th>${event.unit}</th>
              <th>امتیاز</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </section>`;
  }).join("");

  root.innerHTML = renderSummaryTable(items) + eventTables;
}

function setTab(tab) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  });
  document.getElementById("entryPanel").hidden = tab !== "entry";
  document.getElementById("tablePanel").hidden = tab !== "table";
  document.body.classList.toggle("tab-table", tab === "table");
  if (tab === "table") renderTable();
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
    total: recordTotal({ events: record.events })
  });
  saveHistory(items);
  updateAthleteList();
  setTab("table");
}

render();
document.getElementById("recordDate").value = todayInputValue();
updateAthleteList();
updateScores();

document.getElementById("events").addEventListener("input", updateScores);
document.getElementById("saveBtn").addEventListener("click", saveRecord);
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("athlete").value = "";
  document.getElementById("recordDate").value = todayInputValue();
  document.querySelectorAll("#events input").forEach((input) => { input.value = ""; });
  updateScores();
});
document.getElementById("tabs").addEventListener("click", (e) => {
  const button = e.target.closest("[data-tab]");
  if (button) setTab(button.dataset.tab);
});
document.getElementById("historyTable").addEventListener("click", (e) => {
  const button = e.target.closest("[data-delete]");
  if (!button) return;
  saveHistory(loadHistory().filter((item) => item.id !== button.dataset.delete));
  updateAthleteList();
  renderTable();
});
