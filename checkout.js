// =====================================
// BEEJA.LK CHECKOUT SYSTEM
// =====================================

// CART SETTINGS

const CART_KEY = "freshmartCart";

const DELIVERY_FEE = 500;

// IMPORTANT:
// Replace this with your Beeja.LK WhatsApp number.
// Sri Lankan number format: 947XXXXXXXX

const WHATSAPP_NUMBER = "94764960463";


// GET CART

let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];


// GET HTML ELEMENTS

const checkoutItems = document.getElementById("checkoutItems");

const checkoutSubtotal = document.getElementById("checkoutSubtotal");

const deliveryFee = document.getElementById("deliveryFee");

const checkoutTotal = document.getElementById("checkoutTotal");

const checkoutForm = document.getElementById("checkoutForm");

const bankDetails = document.getElementById("bankDetails");

const placeOrderBtn = document.getElementById("placeOrderBtn");


// FORMAT PRICE

function formatPrice(price) {

    return "Rs. " + Number(price).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


// CALCULATE SUBTOTAL

function calculateSubtotal() {

    return cart.reduce((total, item) => {

        return total +
            (Number(item.price) * Number(item.quantity));

    }, 0);

}


// DISPLAY ORDER

function displayCheckout() {

    checkoutItems.innerHTML = "";

    if (cart.length === 0) {

        checkoutItems.innerHTML = `
            <p>Your cart is empty.</p>
            <a href="index.html">Continue Shopping</a>
        `;

        checkoutSubtotal.textContent = formatPrice(0);

        deliveryFee.textContent = formatPrice(0);

        checkoutTotal.textContent = formatPrice(0);

        placeOrderBtn.disabled = true;

        placeOrderBtn.style.opacity = "0.5";

        return;
    }


    let subtotal = 0;


    cart.forEach(item => {

        const price = Number(item.price) || 0;

        const quantity = Number(item.quantity) || 1;

        const itemTotal = price * quantity;

        subtotal += itemTotal;


        const product = document.createElement("div");

        product.className = "checkout-product";


        // PRODUCT IMAGE

        const img = document.createElement("img");

        img.src = item.image || "";

        img.alt = item.name || "Product";

        img.onerror = function () {
            this.style.display = "none";
        };


        // PRODUCT INFORMATION

        const info = document.createElement("div");

        info.className = "checkout-product-info";

        const name = document.createElement("h4");

        name.textContent = item.name || "Product";

        const qty = document.createElement("p");

        qty.textContent = "Quantity: " + quantity;


        info.append(name, qty);


        // PRODUCT TOTAL

        const total = document.createElement("strong");

        total.textContent = formatPrice(itemTotal);


        product.append(img, info, total);

        checkoutItems.appendChild(product);

    });


    // DELIVERY FEE

    const delivery = DELIVERY_FEE;


    // FINAL TOTAL

    const finalTotal = subtotal + delivery;


    checkoutSubtotal.textContent = formatPrice(subtotal);

    deliveryFee.textContent = formatPrice(delivery);

    checkoutTotal.textContent = formatPrice(finalTotal);

}


// =====================================
// PAYMENT METHOD
// =====================================

document.querySelectorAll('input[name="payment"]').forEach(radio => {

    radio.addEventListener("change", function () {

        if (this.value === "Bank Transfer") {

            bankDetails.hidden = false;

        } else {

            bankDetails.hidden = true;

        }

    });

});


// =====================================
// PLACE ORDER
// =====================================

checkoutForm.addEventListener("submit", function (e) {

    e.preventDefault();


    // CHECK EMPTY CART

    if (cart.length === 0) {

        alert("Your shopping cart is empty!");

        window.location.href = "cart.html";

        return;

    }


    // CUSTOMER DETAILS

    const customerName =
        document.getElementById("customerName").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const address =
        document.getElementById("address").value.trim();

    const city =
        document.getElementById("city").value.trim();


    // PAYMENT METHOD

    const payment =
        document.querySelector('input[name="payment"]:checked').value;


    // VALIDATE PHONE

    if (!/^0[0-9]{9}$/.test(phone)) {

        alert("Please enter a valid 10-digit Sri Lankan mobile number.");

        return;

    }


    // CALCULATE TOTAL

    const subtotal = calculateSubtotal();

    const delivery = DELIVERY_FEE;

    const finalTotal = subtotal + delivery;


    // CREATE ORDER MESSAGE

    let message = "";

    message += "🛒 *BEEJA.LK NEW ORDER*%0A";

    message += "--------------------------%0A%0A";


    message += "*CUSTOMER DETAILS*%0A";

    message += "Name: " + encodeURIComponent(customerName) + "%0A";

    message += "Phone: " + encodeURIComponent(phone) + "%0A";

    message += "Address: " + encodeURIComponent(address) + "%0A";

    message += "City: " + encodeURIComponent(city) + "%0A%0A";


    message += "*ORDER PRODUCTS*%0A";


    cart.forEach((item, index) => {

        const price = Number(item.price) || 0;

        const quantity = Number(item.quantity) || 1;

        const total = price * quantity;


        message += (index + 1) + ". ";

        message += encodeURIComponent(item.name || "Product");

        message += "%0A";

        message += "Qty: " + quantity + "%0A";

        message += "Price: " + encodeURIComponent(formatPrice(price));

        message += "%0A";

        message += "Total: " + encodeURIComponent(formatPrice(total));

        message += "%0A%0A";

    });


    message += "--------------------------%0A";

    message += "Subtotal: " + encodeURIComponent(formatPrice(subtotal)) + "%0A";

    message += "Delivery: " + encodeURIComponent(formatPrice(delivery)) + "%0A";

    message += "*FINAL TOTAL: " + encodeURIComponent(formatPrice(finalTotal)) + "*%0A%0A";


    message += "Payment Method: " + encodeURIComponent(payment) + "%0A%0A";


    if (payment === "Bank Transfer") {

        message += "I will make the bank transfer and send the payment receipt.";

    } else {

        message += "I prefer Cash on Delivery.";

    }


    // CHECK WHATSAPP NUMBER

    if (!/^94[0-9]{9}$/.test(WHATSAPP_NUMBER)) {

        alert("Please configure your Beeja.LK WhatsApp number in checkout.js");

        return;

    }


// =====================================
// OPEN WHATSAPP & CLEAR CART
// =====================================

const whatsappURL =
    "https://wa.me/" + WHATSAPP_NUMBER +
    "?text=" + message;


// OPEN WHATSAPP

const whatsappWindow = window.open(whatsappURL, "_blank");


// CHECK WHATSAPP OPENED

if (whatsappWindow) {

    // CLEAR CART

    cart = [];

    localStorage.removeItem(CART_KEY);

    // UPDATE CART DISPLAY

    alert("Order message is ready! Please send your order through WhatsApp.");

    // REDIRECT AFTER 2 SECONDS

    setTimeout(function () {

        window.location.href = "index.html";

    }, 2000);

} else {

    alert("Please allow pop-ups to open WhatsApp.");

}


// =====================================
// INITIAL LOAD
// =====================================

displayCheckout();
