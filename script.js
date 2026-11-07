
// ======================================
// BEEJA.LK - GOOGLE SHEETS PRODUCT SYSTEM
// ======================================

const GOOGLE_SHEETS_API =
"https://script.google.com/macros/s/AKfycbzHjRl2lrsZz2_s0Ago1f_F-kFoXvBfsw-tokbhoHV_z_Y0woziBN3BH65zEohfNCCmew/exec";

let products = [];

// ======================================
// CART DATA
// ======================================

let cart = [];

try {
    const savedCart = JSON.parse(
        localStorage.getItem("freshmartCart")
    );

    if (Array.isArray(savedCart)) {
        cart = savedCart;
    }

} catch (error) {
    cart = [];
}

// ======================================
// GLOBAL FILTERS
// ======================================

let selectedCategory = "All";
let searchText = "";

// ======================================
// IMAGE URL
// ======================================

function getImageUrl(image) {

    if (!image) return "";

    image = String(image).trim();

    const match = image.match(
        /drive\.google\.com\/file\/d\/([^/?]+)/
    );

    if (match) {
        return "https://drive.google.com/uc?export=view&id=" + match[1];
    }

    return image;
}

// ======================================
// LOAD PRODUCTS FROM GOOGLE SHEETS
// ======================================

function loadProducts() {

    const productGrid =
        document.getElementById("productGrid");

    if (productGrid) {
        productGrid.innerHTML = "<p>Loading products...</p>";
    }

    window.receiveGoogleSheetProducts = function(data) {

        if (!Array.isArray(data)) {
            showError("Invalid product data from Google Sheets.");
            return;
        }

        products = data

            .filter(row => row.id !== "" && row.id != null)

            .map(row => ({

                id: Number(row.id),

                name: String(row.name || ""),

                category: String(row.category || ""),

                price: Number(row.price) || 0,

                oldPrice: Number(row.oldPrice) || 0,

                image: getImageUrl(row.image),

                discount: (() => {
                    const value = parseFloat(
                        String(row.discount || "").replace("%", "")
                    );

                    if (isNaN(value)) return "";

                    const percentage = value <= 1
                        ? value * 100
                        : value;

                    return Math.round(percentage) + "%";
                })(),
                
                stock: Number(row.stock) || 0

            }));

        displayProducts();

        console.log("Google Sheets Products Loaded:", products);
    };

    const oldScript = document.getElementById(
        "googleSheetsScript"
    );

    if (oldScript) oldScript.remove();

    const script = document.createElement("script");

    script.id = "googleSheetsScript";

    script.src =
        GOOGLE_SHEETS_API +
        "?callback=receiveGoogleSheetProducts&t=" +
        Date.now();

    script.onerror = function() {
        showError("Google Sheets connection failed.");
    };

    document.body.appendChild(script);

    setTimeout(() => {

        if (products.length === 0) {
            showError("No products loaded. Check Google Sheets connection.");
        }

    }, 20000);
}

// ======================================
// ERROR MESSAGE
// ======================================

function showError(message) {

    const productGrid =
        document.getElementById("productGrid");

    if (productGrid) {
        productGrid.innerHTML =
            "<p>" + message + "</p>";
    }

    console.error(message);
}

// ======================================
// DISPLAY PRODUCTS
// ======================================

function displayProducts() {

    const productGrid =
        document.getElementById("productGrid");

    const noProducts =
        document.getElementById("noProducts");

    if (!productGrid || !noProducts) return;

    let filteredProducts = [...products];

    // CATEGORY FILTER

    if (selectedCategory !== "All") {

        filteredProducts = filteredProducts.filter(
            product =>
                product.category.toLowerCase() ===
                selectedCategory.toLowerCase()
        );

    }

    // SEARCH FILTER

    if (searchText) {

        filteredProducts = filteredProducts.filter(
            product =>
                product.name.toLowerCase().includes(searchText) ||
                product.category.toLowerCase().includes(searchText)
        );

    }

    // PRICE FILTER

    const minPrice =
        Number(document.getElementById("minPrice")?.value) || 0;

    const maxInput =
        document.getElementById("maxPrice")?.value || "";

    const maxPrice =
        maxInput === "" ? Infinity : Number(maxInput);

    filteredProducts = filteredProducts.filter(
        product =>
            product.price >= minPrice &&
            product.price <= maxPrice
    );

    // SORT PRODUCTS

    const sortValue =
        document.getElementById("sortProducts")?.value || "default";

    if (sortValue === "low") {

        filteredProducts.sort(
            (a, b) => a.price - b.price
        );

    }

    else if (sortValue === "high") {

        filteredProducts.sort(
            (a, b) => b.price - a.price
        );

    }

    else if (sortValue === "name") {

        filteredProducts.sort(
            (a, b) => a.name.localeCompare(b.name)
        );

    }

    // NO PRODUCTS

    if (filteredProducts.length === 0) {

        productGrid.innerHTML = "";

        noProducts.hidden = false;

        noProducts.textContent = "No products found.";

        return;
    }

    noProducts.hidden = true;

    // PRODUCT CARDS

    productGrid.innerHTML = filteredProducts.map(product => {

        const outOfStock = product.stock <= 0;

        return `

        <div class="product-card">

            ${product.discount ? `
                <span class="discount">
                    ${product.discount} OFF
                </span>
            ` : ""}

            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                    onerror="this.style.display='none'"
                >

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.category}
                </span>

                <h3 class="product-name">
                    ${product.name}
                </h3>

                <div>

                    <span class="product-price">
                        Rs. ${product.price.toLocaleString("en-LK")}
                    </span>

                    ${product.oldPrice > 0 ? `
                        <span class="product-old-price">
                            Rs. ${product.oldPrice.toLocaleString("en-LK")}
                        </span>
                    ` : ""}

                </div>

                <p class="product-stock">
                  ${outOfStock 
                    ? "Out of Stock" 
                    : "In Stock"}
                </p>

                <button
                    class="add-cart"
                    onclick="addToCart(${product.id})"
                    ${outOfStock ? "disabled" : ""}
                >

                    ${outOfStock
                        ? "Out of Stock"
                        : "+ Add to Cart"}

                </button>

            </div>

        </div>

        `;

    }).join("");

}

// ======================================
// ADD TO CART
// ======================================

function addToCart(productId) {

    const product = products.find(
        item => item.id === Number(productId)
    );

    if (!product) return;

    if (product.stock <= 0) {

        alert("Product is out of stock!");

        return;
    }

    const existingProduct = cart.find(
        item => Number(item.id) === product.id
    );

    if (existingProduct) {

        if (existingProduct.quantity >= product.stock) {

            alert("Maximum available stock reached!");

            return;
        }

        existingProduct.quantity += 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            image: product.image,

            quantity: 1

        });

    }

    saveCart();

    alert(product.name + " added to cart!");

}

// ======================================
// SAVE CART
// ======================================

function saveCart() {

    localStorage.setItem(
        "freshmartCart",
        JSON.stringify(cart)
    );

    updateCartCount();

}

// ======================================
// UPDATE CART COUNT
// ======================================

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    const totalItems = cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );

    if (cartCount) {
        cartCount.textContent = totalItems;
    }

}

// ======================================
// CATEGORY FILTER
// ======================================

document.querySelectorAll(".filter-category")
.forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-category")
        .forEach(item => item.classList.remove("active"));

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        displayProducts();

    });

});

// ======================================
// CATEGORY CARDS
// ======================================

document.querySelectorAll(".category-card")
.forEach(button => {

    button.addEventListener("click", () => {

        selectedCategory = button.dataset.category;

        document.querySelectorAll(".filter-category")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.category === selectedCategory
            );

        });

        displayProducts();

        document.getElementById("products")
            ?.scrollIntoView({ behavior: "smooth" });

    });

});

// ======================================
// SEARCH
// ======================================

const searchInput =
    document.getElementById("searchInput");

function searchProducts() {

    searchText = searchInput.value
        .trim()
        .toLowerCase();

    displayProducts();

}

document.getElementById("searchBtn")
    ?.addEventListener("click", searchProducts);

searchInput?.addEventListener("input", searchProducts);

// ======================================
// SORT PRODUCTS
// ======================================

document.getElementById("sortProducts")
    ?.addEventListener("change", displayProducts);

// ======================================
// PRICE FILTER
// ======================================

document.getElementById("applyFilter")
    ?.addEventListener("click", displayProducts);

// ======================================
// CATEGORY NAVIGATION
// ======================================

document.getElementById("categoryToggle")
    ?.addEventListener("click", () => {

        document.getElementById("categories")
            ?.scrollIntoView({ behavior: "smooth" });

    });

// ======================================
// INITIALIZE WEBSITE
// ======================================

updateCartCount();

loadProducts();

console.log("Beeja.LK Website Loaded Successfully!");
