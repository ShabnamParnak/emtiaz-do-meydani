const ICONS = {
  hurdles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 19V8"/><path d="M4 12h7"/><path d="M11 19V8"/><path d="M13 19V11"/><path d="M13 14h7"/><path d="M20 19V11"/></svg>',
  shooting: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  sprint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h16M4 12h16M4 16h16"/></svg>',
  endurance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/></svg>'
};

const EVENTS = [
  {
    id: "hurdles",
    title: "موانع",
    meta: "هر ۱ واحد ۷ امتیاز · کمتر بهتر است",
    rule: "حد نصاب ۲۴۰ برابر ۱۰۰۰ امتیاز است. هر ۱ واحد کمتر، ۷ امتیاز زیاد و هر ۱ واحد بیشتر، ۷ امتیاز کم می‌شود.",
    kind: "lower",
    unit: "رکورد",
    badge: "حد نصاب ۲۴۰",
    icon: "hurdles",
    reference: 240,
    pointsPerUnit: 7,
    examples: [
      { label: "۲۴۰ → ۱۰۰۰", value: 240 },
      { label: "۲۵۰ → ۹۳۰", value: 250 },
      { label: "۲۳۹ → ۱۰۰۷", value: 239 }
    ]
  },
  {
    id: "shooting",
    title: "تیراندازی",
    meta: "نمره · هر ۱ نمره ۷ امتیاز",
    rule: "حد نصاب ۱۸۰ نمره برابر ۱۰۰۰ امتیاز است. هر ۱ نمره کمتر یا بیشتر، ۷ امتیاز کم یا زیاد می‌شود.",
    kind: "higher",
    unit: "نمره",
    badge: "حد نصاب ۱۸۰",
    icon: "shooting",
    reference: 180,
    pointsPerUnit: 7,
    examples: [
      { label: "۱۸۰ → ۱۰۰۰", value: 180 },
      { label: "۱۷۰ → ۹۳۰", value: 170 }
    ]
  },
  {
    id: "sprint",
    title: "دو سرعت",
    meta: "ثانیه · هر ثانیه ۲۳ امتیاز",
    rule: "حد نصاب ۳۱٫۵۰ ثانیه برابر ۱۰۰۰ امتیاز است. هر ۱ ثانیه کمتر یا بیشتر، ۲۳ امتیاز زیاد یا کم می‌شود.",
    kind: "lower",
    unit: "ثانیه",
    badge: "حد نصاب ۳۱٫۵۰",
    icon: "sprint",
    reference: 31.5,
    pointsPerUnit: 23,
    step: "0.01",
    examples: [
      { label: "۳۱٫۵۰ → ۱۰۰۰", value: 31.5 },
      { label: "۳۲٫۵۰ → ۹۷۷", value: 32.5 }
    ]
  },
  {
    id: "endurance",
    title: "دو استقامت",
    meta: "دقیقه و ثانیه · هر ثانیه ۱ امتیاز",
    rule: "حد نصاب ۲۸ دقیقه برابر ۱۰۰۰ امتیاز است. هر ۱ ثانیه کمتر یا بیشتر، ۱ امتیاز زیاد یا کم می‌شود.",
    kind: "time",
    unit: "دقیقه و ثانیه",
    badge: "حد نصاب ۲۸:۰۰",
    icon: "endurance",
    referenceSeconds: 28 * 60,
    pointsPerSecond: 1,
    examples: [
      { label: "۲۸:۰۰ → ۱۰۰۰", minutes: 28, seconds: 0 },
      { label: "۲۸:۳۰ → ۹۷۰", minutes: 28, seconds: 30 }
    ]
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

    const chips = event.examples.map((ex, index) =>
      `<button class="chip" type="button" data-example="${event.id}" data-index="${index}" data-value='${JSON.stringify(ex)}'>${ex.label}</button>`
    ).join("");

    return `<article class="event-card" id="card-${event.id}">
      <div class="event-head">
        <div class="event-name">
          <span class="icon">${ICONS[event.icon]}</span>
          <div class="title-wrap">
            <h2>${event.title}</h2>
            <p class="meta">${event.meta}</p>
          </div>
        </div>
        <span class="badge">${event.badge}</span>
      </div>
      <p class="rule">${event.rule}</p>
      <div class="fields">
        ${input}
        <div class="score-box">
          <span>امتیاز</span>
          <strong data-score="${event.id}">—</strong>
          <em class="delta" data-delta="${event.id}"></em>
        </div>
      </div>
      <div class="examples">${chips}</div>
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

function setDelta(eventId, score) {
  const el = document.querySelector(`[data-delta="${eventId}"]`);
  el.classList.remove("is-down", "is-even");
  if (score === null) {
    el.textContent = "در انتظار ورودی";
    return;
  }
  const diff = score - 1000;
  if (diff === 0) {
    el.textContent = "دقیقاً حد نصاب";
    el.classList.add("is-even");
  } else if (diff > 0) {
    el.textContent = `${fa(diff)} بالاتر از حد نصاب`;
  } else {
    el.textContent = `${fa(Math.abs(diff))} پایین‌تر از حد نصاب`;
    el.classList.add("is-down");
  }
}

function updateScores() {
  const scores = EVENTS.map((event) => {
    const score = calcScore(event, readValue(event));
    const card = document.getElementById(`card-${event.id}`);
    card.classList.toggle("is-filled", score !== null);
    document.querySelector(`[data-score="${event.id}"]`).textContent = score === null ? "—" : fa(score);
    setDelta(event.id, score);
    return score;
  });

  const filled = scores.filter((s) => s !== null);
  document.getElementById("totalScore").textContent = filled.length ? fa(filled.reduce((a, b) => a + b, 0)) : "—";
  document.getElementById("filledCount").textContent = filled.length
    ? `${filled.length.toLocaleString("fa-IR")} ماده از ۴ ماده`
    : "هنوز ماده‌ای وارد نشده";
}

function fillExample(event, example, index) {
  document.querySelectorAll(`[data-example="${event.id}"]`).forEach((chip, chipIndex) => {
    chip.classList.toggle("is-active", chipIndex === index);
  });
  if (event.kind === "time") {
    document.querySelector(`[data-id="${event.id}"][data-part="minutes"]`).value = example.minutes;
    document.querySelector(`[data-id="${event.id}"][data-part="seconds"]`).value = example.seconds;
  } else {
    document.querySelector(`[data-id="${event.id}"]`).value = example.value;
  }
  updateScores();
}

render();
updateScores();

document.getElementById("events").addEventListener("input", (e) => {
  const id = e.target.dataset.id;
  if (id) {
    document.querySelectorAll(`[data-example="${id}"]`).forEach((chip) => chip.classList.remove("is-active"));
  }
  updateScores();
});

document.getElementById("events").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-example]");
  if (!chip) return;
  const event = EVENTS.find((item) => item.id === chip.dataset.example);
  fillExample(event, JSON.parse(chip.dataset.value), Number(chip.dataset.index));
});

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("athlete").value = "";
  document.querySelectorAll("#events input").forEach((input) => { input.value = ""; });
  document.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("is-active"));
  updateScores();
});

if (new URLSearchParams(location.search).has("demo")) {
  document.getElementById("athlete").value = "نمونه ارزیابی";
  EVENTS.forEach((event) => fillExample(event, event.examples[1], 1));
}
