import { country_list } from "./country-list.js";
import { currencyNames } from "./country-currency.js";

// load the latest conversion data
window.onload = () => {
    let latestData = JSON.parse(localStorage.getItem("conversionData"))
    amountInput.value = latestData.amount;
    fromInput.value = latestData.formCurrency;
    toInput.value = latestData.toCurrency;
    fromInput.style.width = latestData.inputWidth1 + "px";
    toInput.style.width = latestData.inputWidth2 + "px";
    if(country_list[latestData.formCurrency]){
        fromFlag.src = `https://flagsapi.com/${country_list[latestData.formCurrency]}/flat/64.png`;
    }
    if(country_list[latestData.toCurrency]){
        toFlag.src = `https://flagsapi.com/${country_list[latestData.toCurrency]}/flat/64.png`;
    }
    if(currencyNames[latestData.formCurrency]){
        countryCurrency1.innerHTML = currencyNames[latestData.formCurrency];
    }
    if(currencyNames[latestData.toCurrency]){
        countryCurrency2.innerHTML = currencyNames[latestData.toCurrency];   
    }

}

// select elements
let fromMenu = document.getElementById("from");
let toMenu = document.getElementById("to");

let fromInput = document.getElementById("from-input");
let toInput = document.getElementById("to-input");

let fromFlag = document.getElementById("from-flag");
let toFlag = document.getElementById("to-flag");

let amountInput = document.getElementById("amount");

let outputDiv = document.querySelector(".output");
let totalResult = document.querySelector(".total-result span");
let valuePerCurrSpan1 = document.querySelectorAll(".exchange-info span")[0];
let valuePerCurrSpan2 = document.querySelectorAll(".exchange-info span")[1];

let convertIcon = document.querySelector(".currency-lists i");

let textSpan1 = document.querySelector(".from-list .text-span");
let textSpan2 = document.querySelector(".to-list .text-span");

let countryCurrency1 = document.querySelector(".from-list .country-currency");
let countryCurrency2 = document.querySelector(".to-list .country-currency");
let rates = ""

let convertButton = document.querySelector(".convert");

// fetch an api
fetch('https://api.currencyfreaks.com/v2.0/rates/latest?apikey=3df2d6d2512c4d0c9701bd58f9f37d9c')
    .then((response) => {
        return response.json();
    })
    .then((currencies) => {
        rates = currencies.rates;
        addCurrencies(rates);
    })


function addCurrencies(rates) {

    // The for...in loop iterates over the keys (property names) of the object.
    for(let currencyCode in rates){
        
        // a DOM element cannot exist in two places at once—when you append it to the second menu, it gets removed from the first one.

        let option1 = document.createElement("option");
        option1.textContent = currencyCode;
        fromMenu.appendChild(option1);

        let option2 = document.createElement("option");
        option2.textContent = currencyCode;
        toMenu.appendChild(option2);        
    }

    // adding the flag of the selected currency
    fromInput.addEventListener("input", function() {
        const selectedCurrency = this.value;
        adjustWidth(fromInput, textSpan1);
        if(rates[selectedCurrency]){
            showResult();   
            updateResult();
        }
        updateFlag(selectedCurrency, fromFlag);
        currencyCountry(countryCurrency1, fromInput);   

    });

    toInput.addEventListener("input", function(){
        const selectedCurrency = this.value;
        adjustWidth(toInput, textSpan2);
        if(rates[selectedCurrency]){
            showResult();
            updateResult();
        }
        updateFlag(selectedCurrency, toFlag);
        currencyCountry(countryCurrency2, toInput);    
    })
}


function updateFlag(currency, imageFlag) {
    const flag = country_list[currency];
    if(flag) {
        imageFlag.src = `https://flagsapi.com/${flag}/flat/64.png`;
    }
    else {
        imageFlag.src = '';
    }
    saveDataToLocalStorage();
}


amountInput.oninput = updateResult;

function updateResult() {
    if(amountInput.value && fromInput.value && toInput.value){
        let amountValue = parseFloat(amountInput.value);
        let fromCurr = parseFloat(rates[fromInput.value]);
        let toDollar = amountValue / fromCurr;
        let toCurr = (toDollar * parseFloat(rates[toInput.value])).toFixed(3);
        totalResult.innerHTML = `${amountValue} ${fromInput.value} = ${toCurr} ${toInput.value}`;   
        saveDataToLocalStorage();            
    }
    else {
        totalResult.innerHTML = `0.00 ${fromInput.value} = 0.00 ${toInput.value}`;   
    }
    convertButton.style.display = 'none';
    outputDiv.style.display = 'block'; 
}

function showResult() {
    if(fromInput.value && toInput.value){
        let valuePerCurr1 = (1 / rates[fromInput.value]) * rates[toInput.value];
        let valuePerCurr2 = (1 / rates[toInput.value]) * rates[fromInput.value];
        valuePerCurrSpan1.innerHTML = `1 ${fromInput.value} = ${valuePerCurr1} ${toInput.value}`; 
        valuePerCurrSpan2.innerHTML = `1 ${toInput.value} = ${valuePerCurr2} ${fromInput.value}`;            
    }
}


convertIcon.onclick = () => {
    if(fromInput.value && toInput.value){
        let temp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = temp;    
        fromFlag.src = `https://flagsapi.com/${country_list[fromInput.value]}/flat/64.png`;
        toFlag.src = `https://flagsapi.com/${country_list[toInput.value]}/flat/64.png`;   
        countryCurrency1.innerHTML = currencyNames[fromInput.value];
        countryCurrency2.innerHTML = currencyNames[toInput.value];       
        updateResult(); 
        showResult();
    }
}


function saveDataToLocalStorage() {
    let conversionData = {
        amount:amountInput.value,
        formCurrency:fromInput.value,
        toCurrency:toInput.value,
        inputWidth1: fromInput.offsetWidth,
        inputWidth2: toInput.offsetWidth
    }
    localStorage.setItem("conversionData", JSON.stringify(conversionData));
}

function currencyCountry(span, input) {
    let currencyName = currencyNames[input.value];
    if(currencyName){
        span.innerHTML = `- ${currencyName}`;
    }
    else {
        span.innerHTML = ``;
    }
}



convertButton.onclick = () => {
    if(toInput.value && fromInput.value){
        updateResult();
        showResult();
        convertButton.style.display = 'none';   
        outputDiv.style.display = 'block';        
    }
}

// adjust the width of the input

function adjustWidth(input, span) {
    span.textContent = input.value || input.placeholder;
    let newWidth = span.offsetWidth + 30;
    input.style.width = `${newWidth}px`;        

    // another way to make the input take a width as match as its content and without using span
    // input.style.width = (input.value.length + 5) + "ch";
}
