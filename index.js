const form = document.querySelector("form");
form.noValidate = true;

const successMessage = document.querySelector(".succes-message");
const errorMessages = Array.from(document.querySelectorAll(".error-message"));
const radioOptions = Array.from(
  document.querySelectorAll(".query-type-option")
);

function getErrorElementForField(field) {
  if (!field) return null;
  if (field.name === "query")
    return form.querySelector(".query-type + .error-message");
  if (field.type === "checkbox")
    return field.closest("label")?.nextElementSibling ?? null;
  let sib = field.nextElementSibling;
  while (sib) {
    if (sib.classList?.contains("error-message")) return sib;
    sib = sib.nextElementSibling;
  }
  return field.parentElement?.querySelector(".error-message") ?? null;
}

function getSpacingElementForField(field) {
  if (!field) return null;
  if (field.name === "query") return radioOptions;
  if (field.type === "checkbox") return field.closest("label");
  return field;
}

function showErrorField(field) {
  const err = getErrorElementForField(field);
  let spacingEls = getSpacingElementForField(field);
  if (!spacingEls) spacingEls = [];
  if (!Array.isArray(spacingEls)) spacingEls = [spacingEls];

  spacingEls.forEach((el) => {
    if (!el.dataset.origMargin)
      el.dataset.origMargin =
        window.getComputedStyle(el).marginBottom || "24px";
    el.style.marginBottom = "0px";
  });

  if (err) {
    err.classList.remove("hidden");
    if (spacingEls.length)
      err.style.marginBottom = spacingEls[0].dataset.origMargin;
  }

  if (field.type !== "radio" && field.type !== "checkbox")
    field.style.borderColor = "hsl(0, 66%, 54%)";
  field?.setAttribute("aria-invalid", "true");
}

function hideErrorField(field) {
  const err = getErrorElementForField(field);
  let spacingEls = getSpacingElementForField(field);
  if (!spacingEls) spacingEls = [];
  if (!Array.isArray(spacingEls)) spacingEls = [spacingEls];

  spacingEls.forEach((el) => {
    el.style.marginBottom = "";
    delete el.dataset.origMargin;
  });

  if (err) {
    err.classList.add("hidden");
    err.style.marginBottom = "";
  }

  if (field.type !== "radio" && field.type !== "checkbox")
    field.style.borderColor = "";
  field?.removeAttribute("aria-invalid");
}

function restoreAllSpacing() {
  const allEls = new Set();
  form.querySelectorAll("input, textarea").forEach((el) => {
    const se = getSpacingElementForField(el);
    if (se) {
      if (Array.isArray(se)) se.forEach((e) => allEls.add(e));
      else allEls.add(se);
    }
  });
  allEls.forEach((el) => {
    el.style.marginBottom = "";
    delete el.dataset.origMargin;
    if (el.type !== "radio" && el.type !== "checkbox")
      el.style.borderColor = "";
  });
  errorMessages.forEach((m) => {
    m.classList.add("hidden");
    m.style.marginBottom = "";
  });
}

errorMessages.forEach((m) => m.classList.add("hidden"));

form.addEventListener("submit", (e) => {
  e.preventDefault();
  restoreAllSpacing();

  let firstInvalid = null;

  const firstName = form.querySelector("#first-name");
  const lastName = form.querySelector("#last-name");
  const email = form.querySelector("#email");
  const message = form.querySelector("#message");
  const checkbox = form.querySelector('input[type="checkbox"]');
  const queryRadios = Array.from(form.querySelectorAll('input[name="query"]'));

  if (!firstName.value.trim())
    showErrorField(firstName), (firstInvalid ??= firstName);
  if (!lastName.value.trim())
    showErrorField(lastName), (firstInvalid ??= lastName);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim()))
    showErrorField(email), (firstInvalid ??= email);

  if (!queryRadios.some((r) => r.checked))
    showErrorField(queryRadios[0]), (firstInvalid ??= queryRadios[0]);

  if (!message.value.trim())
    showErrorField(message), (firstInvalid ??= message);

  if (!checkbox.checked) showErrorField(checkbox), (firstInvalid ??= checkbox);

  if (firstInvalid) {
    if (firstInvalid.name === "query") queryRadios[0].focus();
    else firstInvalid.focus();
    return;
  }

  successMessage.classList.remove("hidden");
  setTimeout(() => successMessage.classList.add("hidden"), 5000);

  form.reset();
  restoreAllSpacing();
  radioOptions.forEach((opt) => opt.classList.remove("selected"));
});

form.querySelectorAll("input, textarea").forEach((el) => {
  const ev = el.type === "checkbox" || el.type === "radio" ? "change" : "input";
  el.addEventListener(ev, () => {
    if (el.name === "query") {
      const radios = form.querySelectorAll('input[name="query"]');
      if (Array.from(radios).some((r) => r.checked)) {
        hideErrorField(radios[0]);
        radioOptions.forEach((opt) => opt.classList.remove("selected"));
        el.closest(".query-type-option")?.classList.add("selected");
      }
    } else hideErrorField(el);
  });
});

radioOptions.forEach((option) => {
  const input = option.querySelector("input[type='radio']");
  input?.addEventListener("change", () => {
    radioOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
  });
});
