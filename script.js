const summarizeBtn = document.getElementById("summarizeBtn");
const clearBtn = document.getElementById("clearBtn");
const summaryOutput = document.getElementById("summaryOutput");

const patientName = document.getElementById("patientName");
const hn = document.getElementById("hn");
const assessmentDate = document.getElementById("assessmentDate");
const limb = document.getElementById("limb");

const statuses = document.querySelectorAll(".status");
const notes = document.querySelectorAll(".note");

const criticalSigns = ["Pain", "Paresthesia", "Pressure", "Pulselessness", "Paralysis"];

function saveToLocal() {
  const data = {
    patientName: patientName.value,
    hn: hn.value,
    assessmentDate: assessmentDate.value,
    limb: limb.value,
    statuses: [...statuses].map((item) => ({
      label: item.dataset.label,
      value: item.value
    })),
    notes: [...notes].map((item) => ({
      label: item.dataset.label,
      value: item.value
    }))
  };

  localStorage.setItem("sevenPsAssessment", JSON.stringify(data));
}

function loadFromLocal() {
  const saved = localStorage.getItem("sevenPsAssessment");
  if (!saved) return;

  const data = JSON.parse(saved);

  patientName.value = data.patientName || "";
  hn.value = data.hn || "";
  assessmentDate.value = data.assessmentDate || "";
  limb.value = data.limb || "";

  statuses.forEach((select) => {
    const found = data.statuses?.find((item) => item.label === select.dataset.label);
    if (found) select.value = found.value;
  });

  notes.forEach((textarea) => {
    const found = data.notes?.find((item) => item.label === textarea.dataset.label);
    if (found) textarea.value = found.value;
  });
}

function formatStatus(value) {
  switch (value) {
    case "normal":
      return "ปกติ";
    case "abnormal":
      return "ผิดปกติ";
    case "not-assessed":
      return "ยังไม่ได้ประเมิน";
    default:
      return "ไม่ได้ระบุ";
  }
}

function generateSummary() {
  const patient = patientName.value.trim() || "-";
  const patientHN = hn.value.trim() || "-";
  const dateTime = assessmentDate.value ? new Date(assessmentDate.value).toLocaleString("th-TH") : "-";
  const limbValue = limb.value || "-";

  let abnormalList = [];
  let notAssessedList = [];
  let detailLines = [];

  statuses.forEach((statusElement) => {
    const label = statusElement.dataset.label;
    const value = statusElement.value;
    const noteElement = [...notes].find((n) => n.dataset.label === label);
    const noteText = noteElement?.value.trim() || "-";

    detailLines.push(`${label}: ${formatStatus(value)} | หมายเหตุ: ${noteText}`);

    if (value === "abnormal") {
      abnormalList.push(label);
    } else if (value === "not-assessed" || value === "") {
      notAssessedList.push(label);
    }
  });

  const hasCriticalAbnormal = abnormalList.some((item) => criticalSigns.includes(item));

  let summaryText = `
ชื่อผู้ป่วย: ${patient}
HN: ${patientHN}
วันที่ประเมิน: ${dateTime}
ตำแหน่งที่ประเมิน: ${limbValue}

ผลการประเมินรายข้อ
${detailLines.join("\n")}
  `.trim();

  let alertHTML = "";

  if (hasCriticalAbnormal) {
    alertHTML = `
      <div class="alert-box">
        <strong>สรุปเบื้องต้น:</strong> พบสัญญาณผิดปกติในข้อสำคัญของ 7Ps 
        ควรเฝ้าระวังภาวะ Compartment Syndrome อย่างใกล้ชิด และรายงานแพทย์/ผู้รับผิดชอบทันที
      </div>
    `;
  } else if (abnormalList.length > 0) {
    alertHTML = `
      <div class="alert-box">
        <strong>สรุปเบื้องต้น:</strong> พบความผิดปกติบางรายการ ควรติดตามประเมินซ้ำอย่างต่อเนื่อง
      </div>
    `;
  } else {
    alertHTML = `
      <div class="ok-box">
        <strong>สรุปเบื้องต้น:</strong> ยังไม่พบความผิดปกติเด่นชัดจากข้อมูลที่กรอก
      </div>
    `;
  }

  if (notAssessedList.length > 0) {
    alertHTML += `
      <div class="alert-box">
        <strong>ข้อที่ยังไม่ได้ประเมิน:</strong> ${notAssessedList.join(", ")}
      </div>
    `;
  }

  summaryOutput.innerHTML = `
    <pre style="white-space: pre-wrap; margin: 0; font-family: inherit;">${summaryText}</pre>
    ${alertHTML}
  `;
}

function clearAll() {
  patientName.value = "";
  hn.value = "";
  assessmentDate.value = "";
  limb.value = "";

  statuses.forEach((item) => (item.value = ""));
  notes.forEach((item) => (item.value = ""));

  localStorage.removeItem("sevenPsAssessment");

  summaryOutput.innerHTML = `<p>เมื่อกดปุ่ม “สรุปผล” ระบบจะแสดงผลการประเมินตรงนี้</p>`;
}

summarizeBtn.addEventListener("click", () => {
  generateSummary();
  saveToLocal();
});

clearBtn.addEventListener("click", clearAll);

[patientName, hn, assessmentDate, limb, ...statuses, ...notes].forEach((element) => {
  element.addEventListener("input", saveToLocal);
  element.addEventListener("change", saveToLocal);
});

loadFromLocal();
