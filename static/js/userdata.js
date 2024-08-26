const containerTabs = document.querySelectorAll('.tab');
const btns = document.querySelectorAll('button');

function loadIcon(iconify) {
    iconify.setAttribute('icon', 'eos-icons:bubble-loading');
};
btns.forEach(btn => {
    btn.addEventListener("click",()=>{
        if (!btn.classList.contains('loading')){
            btn.innerHTML = '<iconify-icon icon="eos-icons:bubble-loading"></iconify-icon>';
            btn.classList.add('loading');
        }
    });
});
containerTabs.forEach(conttab => {
    conttab.addEventListener("click",()=>{
        var nowActive = document.querySelector(".tab.now");
        var nowShow = document.querySelector(".container.active");
        nowActive.classList.remove('now');
        conttab.classList.add('now');
        nowShow.classList.remove('active');
        document.getElementById(`${conttab.id.split('-tab')[0]}`).classList.add('active');
    });
});
document.getElementById("user-search").addEventListener("input", function() {
    var searchValue = this.value.toLowerCase().trim();
    var rows = document.querySelectorAll('#user-table tbody tr');
    rows.forEach(row => {
        var cells = row.querySelectorAll('td');
        var rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');

        if (searchValue === '') {
            row.classList.remove('hidden');
        } else if (rowText.includes(searchValue)) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
});
document.getElementById("order-search").addEventListener("input", function() {
    var searchValue = this.value.toLowerCase().trim();
    var rows = document.querySelectorAll('#order-table tbody tr');
    rows.forEach(row => {
        var cells = row.querySelectorAll('td');
        var rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');
        if (searchValue === '') {
            row.classList.remove('hidden');
        } else if (rowText.includes(searchValue)) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
});

function sendNewUserData() {
    var inputs = document.querySelectorAll('input.new');
    var textArea = document.querySelector('textarea.new');
    var data = {};
    inputs.forEach(input => {
        if (input.value == '') {
            alert("All data must be provided");
        } else {
            data[input.id] = input.value;
        }
    });
    if (textArea.value == '') {
        alert("All data must be provided");
    } else {
        data[textArea.id] = textArea.value.split('\n').join('*');
    }
    console.log(data);
    fetch('https://subham59036.pythonanywhere.com/m/neworder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 400){
            alert("Order ID already exists");
        } else if (response.status === 403) {
            alert("Password is incorrect");
        } else if (response.status === 500) {
            alert("An error in the server occured");
        }
        btns.forEach(btn => {
            if (btn.classList.contains('loading')) {
                btn.textContent = 'Submit';
                btn.classList.remove('loading');
            }
        });
        return response.json();
    })
    .then(data => {
        var orderIdVal = data.order_id;
        document.querySelector('input.auto-generated').value = orderIdVal;
        document.querySelector('input.auto-generated').focus();
    })
    .then(resdata => {
        console.log(`Success: ${resdata}`);
    })
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
};
function sendOldUserData() {
    var inputs = document.querySelectorAll('input.old');
    var select = document.querySelector('select');
    var data = {};
    inputs.forEach(input => {
        if (input.value == '') {
            alert("All data must be provided");
        } else {
            data[input.id] = input.value;
        }
    });
    data[select.id] = select.value;
    fetch('https://subham59036.pythonanywhere.com/m/oldorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 400){
            alert("Order ID doesnt exits");
        } else if (response.status === 403) {
            alert("Password is incorrect");
        } else if (response.status === 500) {
            alert("An error in the server occured");
        }
        btns.forEach(btn => {
            if (btn.classList.contains('loading')) {
                btn.textContent = 'Submit';
                btn.classList.remove('loading');
            }
        });
        return response.json();
    })
    .then(resdata => {
        console.log(`Success: ${resdata}`);
    })
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
};
function getOrderData() {
    var inputs = document.querySelectorAll('input.order');
    var data = {};
    inputs.forEach(input => {
        if (input.value == '') {
            alertContent.textContent = "All data must be provided";
            alertMsg.classList.add('show');
        } else {
            data[input.id] = input.value;
        }
    });
    fetch('https://subham59036.pythonanywhere.com/m/getorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 400){
            alert("Currently there are no active orders");
        } else if (response.status === 403) {
            alert("Password is incorrect");
        } else if (response.status === 500) {
            alert("An error in the server occured");
        }
        btns.forEach(btn => {
            if (btn.classList.contains('loading')) {
                btn.textContent = 'Submit';
                btn.classList.remove('loading');
            }
        });
        return response.json();
    })
    .then(data => {
        var tableBody = document.querySelector('#order-table tbody');
        tableBody.innerHTML = '';
        data.forEach(order => {
            var row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.order_id}</td>
                <td>${order.order_name}</td>
                <td>${order.order_price}</td>
                <td>${order.reciever_name}</td>
                <td>${order.order_benefit}</td>
                <td>${order.order_place}</td>
                <td>${order.order_delivery}</td>
                <td>${order.payment_process}</td>
                <td>${order.order_status}</td>
                <td>${order.payment_status}</td>
                <td><iconify-icon class="red" icon="subway:delete" id="${order.order_id}" onclick="deleteOrderData(this)"></iconify-icon></td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
};
function getUserData() {
    var inputs = document.querySelectorAll('input.user');
    var data = {};
    inputs.forEach(input => {
        if (input.value == '') {
            alertContent.textContent = "All data must be provided";
            alertMsg.classList.add('show');
        } else {
            data[input.id] = input.value;
        }
    });
    fetch('https://subham59036.pythonanywhere.com/m/getuser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 400){
            alert("Currently there are no recorded users");
        } else if (response.status === 403) {
            alert("Password is incorrect");
        } else if (response.status === 500) {
            alert("An error in the server occured");
        }
        btns.forEach(btn => {
            if (btn.classList.contains('loading')) {
                btn.textContent = 'Submit';
                btn.classList.remove('loading');
            }
        });
        return response.json();
    })
    .then(data => {
        var tableBody = document.querySelector('#user-table tbody');
        tableBody.innerHTML = '';
        data.forEach(reciever => {
            var row = document.createElement('tr');
            row.innerHTML = `
                <td>${reciever.reciever_name}</td>
                <td>${reciever.reciever_mobile}</td>
                <td>${reciever.reciever_email}</td>
                <td>${reciever.reciever_address}</td>
                <td><iconify-icon class="red" icon="subway:delete" id="${reciever.reciever_name}" onclick="deleteUserData(this)"></iconify-icon></td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    })
};
function deleteOrderData(icon) {
    loadIcon(icon);
    var orderId = icon.id;
    var data = {};
    data['order-id'] = orderId;
    fetch('https://subham59036.pythonanywhere.com/m/deleteorder', {
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
            var row = icon.parentNode.parentNode;
            row.parentNode.removeChild(row);    
        }
        btns.forEach(btn => {
            btn.textContent = 'Submit';
        });
        return response.json();
    })
    .then(data => {
        console.log(`Success: ${data}`);
    })
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
};
function deleteUserData(icon) {
    loadIcon(icon);
    var userName = icon.id;
    var data = {};
    data['reciever-name'] = userName;
    fetch('https://subham59036.pythonanywhere.com/m/deleteuser', {
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
            var row = icon.parentNode.parentNode;
            row.parentNode.removeChild(row);    
        }
        btns.forEach(btn => {
            btn.textContent = 'Submit';
        });
        return response.json();
    })
    .then(data => {
        console.log(`Success: ${data}`);
    })
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
};
function getConfirmData() {
    var inputs = document.querySelectorAll('input.confirm');
    var data = {};
    inputs.forEach(input => {
        if (input.value == '') {
            alert("All data must be provided");
        } else {
            data[input.id] = input.value;
        }
    });
    fetch('https://subham59036.pythonanywhere.com/m/getconfirm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 400){
            alert("Currently there are no confirmations");
        } else if (response.status === 403) {
            alert("Password is incorrect");
        } else if (response.status === 500) {
            alert("An error in the server occured");
        }
        btns.forEach(btn => {
            if (btn.classList.contains('loading')) {
                btn.textContent = 'Submit';
                btn.classList.remove('loading');
            }
        });
        return response.json();
    })
    .then(data => {
        var tableBody = document.querySelector('#confirm-table tbody');
        tableBody.innerHTML = '';
        data.forEach(confirm => {
            var row = document.createElement('tr');
            row.innerHTML = `
                <td>${confirm.order_id}</td>
                <td>${confirm.reciever_name}</td>
                <td>${confirm.confirm_process}</td>
                <td>${confirm.confirm_data}</td>
                <td><iconify-icon class="green" icon="el:check" id="${confirm.order_id}" onclick="confirmPaymentData(this)"></iconify-icon> / <iconify-icon class="red" icon="icomoon-free:cancel-circle" id="${confirm.order_id}" onclick="declinePaymentData(this)"></iconify-icon></td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    })
};
function confirmPaymentData(icon){
    loadIcon();
    var orderId = icon.id;
    var data = {};
    data['order-id'] = orderId;
    fetch('https://subham59036.pythonanywhere.com/m/confirmpayment', {
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
            var row = icon.parentNode.parentNode;
            row.parentNode.removeChild(row);    
        }
        btns.forEach(btn => {
            btn.textContent = 'Submit';
        });
        return response.json();
    })
    .then(data => {
        console.log(`Success: ${data}`);
    })
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
};
function declinePaymentData(icon){
    loadIcon();
    var orderId = icon.id;
    var data = {};
    data['order-id'] = orderId;
    fetch('https://subham59036.pythonanywhere.com/m/declinepayment', {
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
            var row = icon.parentNode.parentNode;
            row.parentNode.removeChild(row);    
        }
        btns.forEach(btn => {
            btn.textContent = 'Submit';
        });
        return response.json();
    })
    .then(data => {
        console.log(`Success: ${data}`);
    })
    .catch((error) => {
        console.log(`Error: ${error}`);
    });
};