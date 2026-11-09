
// =====================================
// BEEJA.LK CHECKOUT SYSTEM
// =====================================


// CART SETTINGS

const CART_KEY = "freshmartCart";

const DELIVERY_FEE = 500;

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


// =====================================
// FORMAT PRICE
// =====================================

function formatPrice(price) {

    return "Rs. " + Number(price).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


// =====================================
// CALCULATE SUBTOTAL
// =====================================

function calculateSubtotal() {

    return cart.reduce((total, item) => {

        return total +
            (Number(item.price) * Number(item.quantity));

    }, 0);

}


// =====================================
// DISPLAY CHECKOUT PRODUCTS
// =====================================

function displayCheckout() {

    checkoutItems.innerHTML = "";

    if (cart.length === 0) {

        checkoutItems.innerHTML = `
            <p>Your cart is empty.</p>

            <a href="index.html">
                Continue Shopping
            </a>
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
// PLACE ORDER VIA WHATSAPP
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

    const selectedPayment =
        document.querySelector('input[name="payment"]:checked');

    if (!selectedPayment) {

        alert("Please select a payment method.");

        return;

    }

    const payment = selectedPayment.value;


    // VALIDATE PHONE

    if (!/^0[0-9]{9}$/.test(phone)) {

        alert("Please enter a valid 10-digit mobile number.");

        return;

    }


    // CHECK WHATSAPP NUMBER

    if (!/^94[0-9]{9}$/.test(WHATSAPP_NUMBER)) {

        alert("Invalid WhatsApp number.");

        return;

    }


    // CALCULATE TOTAL

    const subtotal = calculateSubtotal();

    const delivery = DELIVERY_FEE;

    const finalTotal = subtotal + delivery;


    // =====================================
    // CREATE WHATSAPP MESSAGE
    // =====================================

    let message = "";

    message += "🛒 *BEEJA.LK NEW ORDER*\n";

    message += "--------------------------\n\n";


    // CUSTOMER DETAILS

    message += "*CUSTOMER DETAILS*\n";

    message += "Name: " + customerName + "\n";

    message += "Phone: " + phone + "\n";

    message += "Address: " + address + "\n";

    message += "City: " + city + "\n\n";


    // ORDER PRODUCTS

    message += "*ORDER PRODUCTS*\n\n";


    cart.forEach((item, index) => {

        const price = Number(item.price) || 0;

        const quantity = Number(item.quantity) || 1;

        const total = price * quantity;


        message += (index + 1) + ". " + (item.name || "Product") + "\n";

        message += "Quantity: " + quantity + "\n";

        message += "Price: " + formatPrice(price) + "\n";

        message += "Total: " + formatPrice(total) + "\n\n";

    });


    // ORDER SUMMARY

    message += "--------------------------\n";

    message += "Subtotal: " + formatPrice(subtotal) + "\n";

    message += "Delivery: " + formatPrice(delivery) + "\n";

    message += "*FINAL TOTAL: " + formatPrice(finalTotal) + "*\n\n";


    // PAYMENT METHOD

    message += "*PAYMENT METHOD*\n";

    message += payment + "\n\n";


    if (payment === "Bank Transfer") {

        message += "I will make the bank transfer and send the payment receipt.";

    } else {

        message += "I prefer Cash on Delivery.";

    }


    // =====================================
    // OPEN WHATSAPP
    // =====================================

    const whatsappURL =
        "https://wa.me/" + WHATSAPP_NUMBER +
        "?text=" + encodeURIComponent(message);


    // OPEN WHATSAPP WINDOW

    const whatsappWindow = window.open(
        whatsappURL,
        "_blank"
    );


    // =====================================
    // CLEAR CART AFTER WHATSAPP OPENS
    // =====================================

    if (whatsappWindow) {

        // CLEAR LOCAL CART

        cart = [];

        localStorage.removeItem(CART_KEY);


        // UPDATE CHECKOUT DISPLAY

        displayCheckout();


        // SUCCESS MESSAGE

        alert(
            "Your order message is ready!\n\n" +
            "Please send your order through WhatsApp."
        );


        // REDIRECT TO HOME PAGE

        setTimeout(function () {

            window.location.href = "index.html";

        }, 2000);


    } else {

        alert(
            "WhatsApp could not open.\n\n" +
            "Please allow pop-ups in your browser and try again."
        );

    }

});


// =====================================
// UPDATE WHEN OTHER TAB CHANGES CART
// =====================================

window.addEventListener("storage", function (e) {

    if (e.key === CART_KEY) {

        cart = JSON.parse(e.newValue) || [];

        displayCheckout();

    }

});


// =====================================
// INITIAL LOAD
// =====================================

displayCheckout();
