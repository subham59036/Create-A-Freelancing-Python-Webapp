const optedPaymentBtn = document.querySelectorAll('#opted-payment button');
const containerBox = document.querySelector('#container');
const paymentBox = document.querySelector('#payment-container');
const loadBox = document.querySelector('#load-container');
const payPrice = document.querySelector('#pay-price');
const payQr = document.querySelector('#pay-qr');

window.addEventListener('DOMContentLoaded',()=>{
    optedPaymentBtn.forEach(payBtn => {
        var paymentProcess = document.getElementById('payment-process').textContent.toLowerCase().replace(/\s+/g, '');
        if (payBtn.id == paymentProcess) {
            payBtn.style.display = 'flex';
        }
    });
});

function closePayment(){
    containerBox.style.display = 'flex';
    paymentBox.style.display = 'none';
};
function payPaypal(){
    var priceAmount = document.getElementById('order-price').textContent.split(' ')[1];
    containerBox.style.display = 'none';
    loadBox.style.display = 'flex';
    payQr.setAttribute('src', '../img/paypalqr.jpg');
    payPrice.textContent = priceAmount;
    loadBox.style.display = 'none';
    paymentBox.style.display = 'flex';
};
function payPayu(){
    var priceAmount = document.getElementById('order-price').textContent.split(' ')[1];
    containerBox.style.display = 'none';
    loadBox.style.display = 'flex';
    payQr.setAttribute('src', '../img/payuqr.jpg');
    payPrice.textContent = priceAmount;
    loadBox.style.display = 'none';
    paymentBox.style.display = 'flex';
};
function payUpi(){
    var priceAmount = document.getElementById('order-price').textContent.split(' ')[1];
    containerBox.style.display = 'none';
    loadBox.style.display = 'flex';
    payQr.setAttribute('src', '../img/upiqr.jpg');
    fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
    .then(response => response.json())
    .then(data => {
        var rate = data.rates.INR;
        payPrice.textContent = 'INR ' + Math.round(priceAmount * rate);
        loadBox.style.display = 'none';
        paymentBox.style.display = 'flex';
    });
};
function payCrypto(){
    var priceAmount = document.getElementById('order-price').textContent.split(' ')[1];
    containerBox.style.display = 'none';
    loadBox.style.display = 'flex';
    payQr.setAttribute('src', '../img/cryptoqr.jpg');
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd`)
    .then(response => response.json())
    .then(data => {
        var rate = data.tron.usd;
        payPrice.textContent = 'TRX ' + (priceAmount / rate).toFixed(2);
        loadBox.style.display = 'none';
        paymentBox.style.display = 'flex';
    });
};

function confirmPayment(){
    var inputEl = document.querySelector('input');
    var selectEl = document.querySelector('select');
    var orderId = document.querySelector('#order-id').textContent;
    var data = {};
    if (inputEl.value == '') {
        alert("All data must be provided");
    } else {
        data[inputEl.id] = inputEl.value;
    }
    data['order-id'] = orderId;
    data[selectEl.id] = selectEl.value;
    fetch('https://subham59036.pythonanywhere.com/u/confirm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 500) {
            alert("An error in the server occured");
        } else {
            alert("Payment confirmation request sent. The payment will be confirmed within 3 days")
        }
        return response.json();
    })
    .then(data => {
        console.log(`Success: ${data}`);
    })
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
};