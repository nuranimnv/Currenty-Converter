const buyCurrency = { code: "usd", rate: 0 };
const sellCurrency = { code: "rub", rate: 0 };

let isBuying = true;
let isOnline = true;

const buyCurrencyBtns = document.querySelectorAll(".buy .currency-tabs li");
const sellCurrencyBtns = document.querySelectorAll(".sell .currency-tabs li");

const buyAmountInput = document.querySelector(".buy .currency-result input");
const sellAmountInput = document.querySelector(".sell .currency-result input");

const buyInfoText = document.querySelector(".buy .currency-result p");
const sellInfoText = document.querySelector(".sell .currency-result p");

const errorMessage = document.querySelector(".error-message");

function updateCurrencyInfo() {
  buyInfoText.textContent = `1 ${buyCurrency.code.toUpperCase()} = ${buyCurrency.rate.toFixed(
    4
  )} ${sellCurrency.code.toUpperCase()}`;
  sellInfoText.textContent = `1 ${sellCurrency.code.toUpperCase()} = ${(
    1 / buyCurrency.rate
  ).toFixed(4)} ${buyCurrency.code.toUpperCase()}`;
}

async function fetchCurrencyRate(from, to) {
  try {
    const response = await fetch(
      `https://latest.currency-api.pages.dev/v1/currencies/${from}.json`
    );
    const data = await response.json();
    errorMessage.textContent = "";
    return data[from][to];
  } catch (error) {
    errorMessage.textContent = "Error retrieving data";
    return null;
  }
}

function performCalculation() {
  if (isBuying) {
    buyAmountInput.value = (sellAmountInput.value * sellCurrency.rate).toFixed(
      4
    );
  } else {
    sellAmountInput.value = (buyAmountInput.value * buyCurrency.rate).toFixed(
      4
    );
  }
}

buyCurrencyBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    buyCurrencyBtns.forEach((button) => button.classList.remove("active"));
    btn.classList.add("active");
    const selectedCurrency = btn.getAttribute("data-currency");
    buyCurrency.code = selectedCurrency;

    if (isOnline) {
      const activeSellBtn = Array.from(sellCurrencyBtns).find((btn) =>
        btn.classList.contains("active")
      );
      const selectedSellCurrency = activeSellBtn.getAttribute("data-currency");

      if (selectedCurrency === selectedSellCurrency) {
        buyCurrency.rate = 1;
        sellCurrency.rate = 1;
        performCalculation();
        updateCurrencyInfo();
      } else {
        fetchCurrencyRate(selectedCurrency, selectedSellCurrency).then(
          (rate) => {
            if (rate) {
              buyCurrency.rate = rate;
              sellCurrency.rate = 1 / rate;
              performCalculation();
              updateCurrencyInfo();
            }
          }
        );
      }
    }
  });
});

sellCurrencyBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    sellCurrencyBtns.forEach((button) => button.classList.remove("active"));
    btn.classList.add("active");
    const selectedCurrency = btn.getAttribute("data-currency");
    sellCurrency.code = selectedCurrency;

    if (isOnline) {
      const activeBuyBtn = Array.from(buyCurrencyBtns).find((btn) =>
        btn.classList.contains("active")
      );
      const selectedBuyCurrency = activeBuyBtn.getAttribute("data-currency");

      if (selectedCurrency === selectedBuyCurrency) {
        buyCurrency.rate = 1;
        sellCurrency.rate = 1;
        performCalculation();
        updateCurrencyInfo();
      } else {
        fetchCurrencyRate(selectedCurrency, selectedBuyCurrency).then(
          (rate) => {
            if (rate) {
              sellCurrency.rate = rate;
              buyCurrency.rate = 1 / rate;
              performCalculation();
              updateCurrencyInfo();
            }
          }
        );
      }
    }
  });
});

const amountPattern = /^[0-9]*\.?[0-9]*$/;

buyAmountInput.addEventListener("input", () => {
  buyAmountInput.value = buyAmountInput.value.replace(/,/g, ".");

  if (!amountPattern.test(buyAmountInput.value)) {
    buyAmountInput.value = buyAmountInput.value.slice(0, -1);
    return;
  }

  isBuying = false;
  performCalculation();
});

sellAmountInput.addEventListener("input", () => {
  sellAmountInput.value = sellAmountInput.value.replace(/,/g, ".");

  if (!amountPattern.test(sellAmountInput.value)) {
    sellAmountInput.value = sellAmountInput.value.slice(0, -1);
    return;
  }

  isBuying = true;
  performCalculation();
});

window.addEventListener("online", () => {
  errorMessage.textContent = "";
  isOnline = true;
});

window.addEventListener("offline", () => {
  errorMessage.textContent = "Нет подключения к интернету";
  isOnline = false;
});

function initialize() {
  if (isOnline) {
    fetchCurrencyRate(sellCurrency.code, buyCurrency.code).then((rate) => {
      if (rate) {
        sellCurrency.rate = rate;
        buyCurrency.rate = 1 / rate;
        sellAmountInput.value = 5000;
        performCalculation();
        updateCurrencyInfo();
      }
    });
  }
}

initialize();
