const exchangeData = {
  target: { code: "usd", rate: 0 },
  source: { code: "rub", rate: 0 },
  direction: "toTarget",
};

const isConnected = () => navigator.onLine;

const elements = {
  tabs: {
    target: document.querySelectorAll(".buy .currency-tabs li"),
    source: document.querySelectorAll(".sell .currency-tabs li"),
  },
  inputs: {
    target: document.querySelector(".buy .currency-result input"),
    source: document.querySelector(".sell .currency-result input"),
  },
  infos: {
    target: document.querySelector(".buy .currency-result p"),
    source: document.querySelector(".sell .currency-result p"),
  },
  errorMsg: document.querySelector(".error-message"),
};

const patterns = { number: /^[0-9]*\.?[0-9]*$/ };

function updateExchangeInfo() {
  const { target, source } = exchangeData;
  elements.infos.target.textContent = `1 ${target.code.toUpperCase()} = ${target.rate.toFixed(4)} ${source.code.toUpperCase()}`;
  elements.infos.source.textContent = `1 ${source.code.toUpperCase()} = ${(1 / target.rate).toFixed(4)} ${target.code.toUpperCase()}`;
}

async function fetchRate(from, to) {
  try {
    const res = await fetch(`https://latest.currency-api.pages.dev/v1/currencies/${from}.json`);
    const data = await res.json();
    elements.errorMsg.textContent = "";
    return data[from]?.[to] ?? null;
  } catch {
    elements.errorMsg.textContent = "Failed to retrieve rates.";
    return null;
  }
}

function calculateValues() {
  const { target, source, direction } = exchangeData;
  const sourceValue = parseFloat(elements.inputs.source.value) || 0;
  const targetValue = parseFloat(elements.inputs.target.value) || 0;

  if (direction === "toTarget") {
    elements.inputs.target.value = (sourceValue * source.rate).toFixed(4);
  } else {
    elements.inputs.source.value = (targetValue * target.rate).toFixed(4);
  }
}

function handleCurrencyChange(type, selectedCode) {
  const oppositeType = type === "target" ? "source" : "target";
  const currentCurrency = exchangeData[type];
  const oppositeCurrency = exchangeData[oppositeType];

  currentCurrency.code = selectedCode;

  if (isConnected()) {
    if (selectedCode === oppositeCurrency.code) {
      currentCurrency.rate = oppositeCurrency.rate = 1;
    } else {
      fetchRate(selectedCode, oppositeCurrency.code).then((rate) => {
        if (rate) {
          currentCurrency.rate = rate;
          oppositeCurrency.rate = 1 / rate;
        }
        calculateValues();
        updateExchangeInfo();
      });
    }
  }
}

function initializeTabs() {
  Object.entries(elements.tabs).forEach(([type, tabs]) => {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((el) => el.classList.remove("active"));
        tab.classList.add("active");
        handleCurrencyChange(type, tab.getAttribute("data-currency"));
      });
    });
  });
}

function handleInputChange(inputType, value) {
  value = value.replace(/,/g, ".");
  if (!patterns.number.test(value)) return;

  exchangeData.direction = inputType === "target" ? "toSource" : "toTarget";
  calculateValues();
}

function initializeInputs() {
  Object.entries(elements.inputs).forEach(([type, input]) => {
    input.addEventListener("input", (e) => handleInputChange(type, e.target.value));
  });
}

function monitorConnectionStatus() {
  window.addEventListener("online", () => {
    elements.errorMsg.textContent = "";
  });

  window.addEventListener("offline", () => {
    elements.errorMsg.textContent = "Нет подключения к интернету.";
  });
}

function setupConverter() {
  if (isConnected()) {
    fetchRate(exchangeData.source.code, exchangeData.target.code).then((rate) => {
      if (rate) {
        exchangeData.source.rate = rate;
        exchangeData.target.rate = 1 / rate;
        elements.inputs.source.value = 5000;
        calculateValues();
        updateExchangeInfo();
      }
    });
  }
}

function initializeApp() {
  initializeTabs();
  initializeInputs();
  monitorConnectionStatus();
  setupConverter();
}

initializeApp();
