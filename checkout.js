```javascript
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

    if (!/^94[0-9]{9}$/.test(WHATSAPP
