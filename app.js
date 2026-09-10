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
}

render();
updateScores();

document.getElementById("events").addEventListener("input", updateScores);

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("athlete").value = "";
  document.querySelectorAll("#events input").forEach((input) => { input.value = ""; });
  updateScores();
});
