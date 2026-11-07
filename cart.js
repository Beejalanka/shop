
// =====================================
// BEEJA.LK SHOPPING CART
// =====================================

const CART_KEY = "freshmartCart";

let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");


// SAVE CART

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


// FORMAT PRICE

function formatPrice(price) {
    return "Rs. " + Number(price).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// DISPLAY CART

function displayCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        emptyCart.hidden = false;
        cartItems.style.display = "none";

        updateSummary();

        return;
    }

    emptyCart.hidden = true;
    cartItems.style.display = "block";

    cart.forEach((item, index) => {

        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        const itemTotal = price * quantity;

        const image = item.image || "";

        const div = document.createElement("div");

        div.className = "cart-item";

        const img = document.createElement("img");
        img.src = image.startsWith("http")
            ? image
            : "../" + image.replace(/^\/+/, "");
        img.alt = item.name || "Product";
        img.onerror = function () {
            this.style.display = "none";
        };

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = item.name || "Product";

        const productPrice = document.createElement("div");
        productPrice.className = "product-price";
        productPrice.textContent = formatPrice(price);

        const quantityControl = document.createElement("div");
        quantityControl.className = "quantity-control";

        const minus = document.createElement("button");
        minus.textContent = "−";
        minus.type = "button";
        minus.addEventListener("click", () => changeQuantity(index, -1));

        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.value = quantity;

        if (Number(item.stock) > 0) {
            input.max = Number(item.stock);
        }

        input.addEventListener("change", () => {
            setQuantity(index, input.value);
        });

        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.type = "button";
        plus.addEventListener("click", () => changeQuantity(index, 1));

        quantityControl.append(minus, input, plus);

        info.append(name, productPrice, quantityControl);

        const right = document.createElement("div");
        right.className = "item-right";

        const total = document.createElement("div");
        total.className = "item-total";
        total.textContent = formatPrice(itemTotal);

        const remove = document.createElement("button");
        remove.className = "remove-btn";
        remove.textContent = "Remove";
        remove.type = "button";
        remove.addEventListener("click", () => removeItem(index));

        right.append(total, remove);

        div.append(img, info, right);

        cartItems.appendChild(div);

    });

    updateSummary();
}


// CHANGE QUANTITY

function changeQuantity(index, amount) {

    if (!cart[index]) return;

    const newQuantity = Number(cart[index].quantity) + amount;

    setQuantity(index, newQuantity);
}


// SET QUANTITY

function setQuantity(index, quantity) {

    if (!cart[index]) return;

    let newQuantity = parseInt(quantity, 10);

    if (!Number.isFinite(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
    }

    const stock = Number(cart[index].stock);

    if (stock > 0 && newQuantity > stock) {
        newQuantity = stock;
        alert("Only " + stock + " items available.");
    }

    cart[index].quantity = newQuantity;

    saveCart();
    displayCart();
}


// REMOVE PRODUCT

function removeItem(index) {

    cart.splice(index, 1);

    saveCart();
    displayCart();
}


// CLEAR CART

document.getElementById("clearCartBtn").addEventListener("click", () => {

    if (cart.length === 0) return;

    if (confirm("Are you sure you want to clear your cart?")) {

        cart = [];

        saveCart();
        displayCart();
    }

});


// CALCULATE TOTAL

function updateSummary() {

    let subtotal = 0;

    cart.forEach(item => {

        subtotal += Number(item.price) * Number(item.quantity);

    });

    document.getElementById("subtotal").textContent =
        formatPrice(subtotal);

    document.getElementById("total").textContent =
        formatPrice(subtotal);

    updateCartCount();
}


// UPDATE CART COUNT

function updateCartCount() {

    const totalQuantity = cart.reduce((total, item) => {
        return total + Number(item.quantity || 0);
    }, 0);

    const cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = totalQuantity;
    }

}


// PREVENT EMPTY CHECKOUT

document.getElementById("checkoutBtn").addEventListener("click", function(e) {

    if (cart.length === 0) {

        e.preventDefault();

        alert("Your shopping cart is empty!");

    }

});


// UPDATE WHEN OTHER TAB CHANGES CART

window.addEventListener("storage", function(e) {

    if (e.key === CART_KEY) {

        cart = JSON.parse(e.newValue) || [];

        displayCart();
    }

});


// INITIAL LOAD

displayCart();
