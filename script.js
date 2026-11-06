
// ======================================
// FRESHMART - SUPERMARKET WEBSITE
// ======================================


// PRODUCT DATABASE
const products = [

    {
        id: 1,
        name: "Fresh Red Apples 1kg",
        category: "Fruits",
        price: 1250,
        oldPrice: 1450,
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500",
        discount: "14%"
    },

    {
        id: 2,
        name: "Fresh Broccoli 500g",
        category: "Vegetables",
        price: 650,
        oldPrice: 750,
        image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=500",
        discount: "13%"
    },

    {
        id: 3,
        name: "Fresh Milk 1L",
        category: "Dairy",
        price: 450,
        oldPrice: 500,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500",
        discount: "10%"
    },

    {
        id: 4,
        name: "White Basmati Rice 1kg",
        category: "Grocery",
        price: 420,
        oldPrice: 480,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
        discount: "12%"
    },

    {
        id: 5,
        name: "Fresh Bananas 1kg",
        category: "Fruits",
        price: 350,
        oldPrice: 400,
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500",
        discount: "12%"
    },

    {
        id: 6,
        name: "Fresh Carrots 500g",
        category: "Vegetables",
        price: 280,
        oldPrice: 320,
        image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500",
        discount: "13%"
    },

    {
        id: 7,
        name: "Orange Juice 1L",
        category: "Beverages",
        price: 650,
        oldPrice: 750,
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500",
        discount: "13%"
    },

    {
        id: 8,
        name: "Chocolate Cookies",
        category: "Snacks",
        price: 450,
        oldPrice: 500,
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500",
        discount: "10%"
    },

    {
        id: 9,
        name: "Fresh Strawberries 250g",
        category: "Fruits",
        price: 950,
        oldPrice: 1100,
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500",
        discount: "14%"
    },

    {
        id: 10,
        name: "Fresh Eggs 10 Pack",
        category: "Dairy",
        price: 650,
        oldPrice: 700,
        image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500",
        discount: "7%"
    },

    {
        id: 11,
        name: "Dishwashing Liquid",
        category: "Household",
        price: 550,
        oldPrice: 650,
        image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500",
        discount: "15%"
    },

    {
        id: 12,
        name: "Shampoo 180ml",
        category: "Personal Care",
        price: 750,
        oldPrice: 850,
        image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500",
        discount: "12%"
    }

];


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
                product.category === selectedCategory
        );

    }


    // SEARCH FILTER

    if (searchText) {

        filteredProducts = filteredProducts.filter(
            product =>
                product.name.toLowerCase().includes(searchText)
        );

    }


    // PRICE FILTER

    const minPrice =
        Number(document.getElementById("minPrice").value) || 0;

    const maxInput =
        document.getElementById("maxPrice").value;

    const maxPrice =
        maxInput === "" ? Infinity : Number(maxInput);


    filteredProducts = filteredProducts.filter(
        product =>
            product.price >= minPrice &&
            product.price <= maxPrice
    );


    // SORT PRODUCTS

    const sortValue =
        document.getElementById("sortProducts").value;

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


    // EMPTY RESULT

    if (filteredProducts.length === 0) {

        productGrid.innerHTML = "";

        noProducts.hidden = false;

        return;

    }

    noProducts.hidden = true;


    // PRODUCT HTML

    productGrid.innerHTML = filteredProducts.map(product => `

        <div class="product-card">

            <span class="discount">
                ${product.discount} OFF
            </span>

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

                    <span class="product-old-price">
                        Rs. ${product.oldPrice.toLocaleString("en-LK")}
                    </span>

                </div>

                <button
                    class="add-cart"
                    onclick="addToCart(${product.id})">

                    + Add to Cart

                </button>

            </div>

        </div>

    `).join("");

}


// ======================================
// ADD TO CART
// ======================================

function addToCart(productId) {

    const product = products.find(
        item => item.id === productId
    );

    if (!product) return;

    const existingProduct = cart.find(
        item => item.id === productId
    );

    if (existingProduct) {

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
        (total, item) => total + Number(item.quantity || 0),
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


// CATEGORY CARDS

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
            .scrollIntoView({ behavior: "smooth" });

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
    .addEventListener("click", searchProducts);

searchInput.addEventListener("input", searchProducts);


// ======================================
// SORT PRODUCTS
// ======================================

document.getElementById("sortProducts")
    .addEventListener("change", displayProducts);


// ======================================
// PRICE FILTER
// ======================================

document.getElementById("applyFilter")
    .addEventListener("click", displayProducts);


// ======================================
// CATEGORY NAVIGATION BUTTON
// ======================================

document.getElementById("categoryToggle")
    .addEventListener("click", () => {

        document.getElementById("categories")
            .scrollIntoView({ behavior: "smooth" });

    });


// ======================================
// INITIALIZE WEBSITE
// ======================================

displayProducts();

updateCartCount();

console.log("FreshMart Website Loaded Successfully!");
