// =========================================================
// Buyza  
// =========================================================

// Run all setup functions only when the page has loaded
document.addEventListener("DOMContentLoaded", function () {
  initDropdowns();
  initCarousels();
  checkLoginStatus();
  renderCart();
  applyDarkModeOnLoad();
  renderSearchResults();
});

 
// 1. NAVBAR DROPDOWN (Categories menu)
 

function initDropdowns() {
  var allDropdowns = document.querySelectorAll(".nav-dropdown");

  for (var i = 0; i < allDropdowns.length; i++) {
    setupOneDropdown(allDropdowns[i], allDropdowns);
  }

  // Clicking anywhere outside a dropdown closes all of them
  document.addEventListener("click", function (event) {
    for (var i = 0; i < allDropdowns.length; i++) {
      if (!allDropdowns[i].contains(event.target)) {
        allDropdowns[i].classList.remove("open");
      }
    }
  });
}

function setupOneDropdown(dropdown, allDropdowns) {
  var toggleLink = dropdown.querySelector(".dropdown-toggle");
  if (!toggleLink) return;

  toggleLink.addEventListener("click", function (event) {
    event.preventDefault();
    var wasOpen = dropdown.classList.contains("open");

    for (var i = 0; i < allDropdowns.length; i++) {
      allDropdowns[i].classList.remove("open");
    }
    if (!wasOpen) dropdown.classList.add("open"); // acts like a toggle
  });
}

 
// 2. IMAGE CAROUSELS
 

function initCarousels() {
  var allCarousels = document.querySelectorAll(".carousel");
  for (var i = 0; i < allCarousels.length; i++) {
    setupOneCarousel(allCarousels[i]);
  }
}

function setupOneCarousel(carousel) {
  var track = carousel.querySelector(".carousel-track");
  var slides = carousel.querySelectorAll(".carousel-slide");
  var prevButton = carousel.querySelector(".carousel-btn.prev");
  var nextButton = carousel.querySelector(".carousel-btn.next");

  var totalSlides = slides.length;
  var currentSlide = 0;
  var autoplayDelay = parseInt(carousel.dataset.interval, 10) || 4000;
  var autoplayTimer = null;

  if (!track || totalSlides === 0) return;

  function showSlide(slideIndex) {
    // Wraps around: before slide 0 goes to the last slide, and vice versa
    currentSlide = (slideIndex + totalSlides) % totalSlides;
    track.style.transform = "translateX(-" + (currentSlide * 100) + "%)";
  }

  function goToNextSlide() { showSlide(currentSlide + 1); }
  function goToPrevSlide() { showSlide(currentSlide - 1); }

  function startAutoplay() {
    stopAutoplay(); // clear any old timer first
    autoplayTimer = setInterval(goToNextSlide, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      goToNextSlide();
      startAutoplay();
    });
  }
  if (prevButton) {
    prevButton.addEventListener("click", function () {
      goToPrevSlide();
      startAutoplay();
    });
  }

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);

  showSlide(0);
  startAutoplay();
}
 
// 3. DARK MODE
 
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  document.documentElement.classList.toggle("dark-mode");

  var isDarkModeOn = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkModeOn ? "true" : "false");

  updateThemeIcon();
}

function applyDarkModeOnLoad() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.documentElement.classList.add("dark-mode");
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  var themeButton = document.querySelector(".theme-btn");
  if (!themeButton) return;
  themeButton.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
}



 
// 4. LOGIN / PROFILE 
 

function toggleLogin() {
  togglePopup("loginOverlay");
}

function handleLogin(event) {
  event.preventDefault(); // stop the form from actually submitting/reloading

  localStorage.setItem("loggedIn", "true");

  closePopup("loginOverlay");
  showProfileMenu();
  renderCart(); // refresh the cart now that we're "logged in"

  return false;
}

function logOut() {
  localStorage.removeItem("loggedIn");
  hideProfileMenu();
}

function toggleDropdown() {
  document.getElementById("profileDropdown").classList.toggle("open");
}

function showProfileMenu() {
  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("profileMenu").classList.add("show");
}

function hideProfileMenu() {
  document.getElementById("profileMenu").classList.remove("show");
  document.getElementById("loginBtn").style.display = "inline-block";
  document.getElementById("profileDropdown").classList.remove("open");
}

function checkLoginStatus() {
  if (isLoggedIn()) showProfileMenu();
}

function isLoggedIn() {
  return localStorage.getItem("loggedIn") === "true";
}
 
// 5. GENERIC POPUP HELPERS
//  open/close/toggle function used by every popup
 

function openPopup(popupId) {
  var popup = document.getElementById(popupId);
  if (popup) popup.classList.add("show");
}

function closePopup(popupId) {
  var popup = document.getElementById(popupId);
  if (popup) popup.classList.remove("show");
}

function togglePopup(popupId) {
  var popup = document.getElementById(popupId);
  if (popup) popup.classList.toggle("show");
}
 
// 6. SHOPPING CART (saved in localStorage)
 

// Reads the cart out of localStorage (empty list if none saved yet)
function getCart() {
  var cartText = localStorage.getItem("cart");
  return cartText ? JSON.parse(cartText) : [];
}

// Saves the cart list back into localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Finds an item in the cart by name (or null if not found)
function findItemInCart(cart, name) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].name === name) return cart[i];
  }
  return null;
}

// Adds up the price of everything in the cart
function getCartTotal(cart) {
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].qty;
  }
  return total;
}

// Adds an item to the cart, or increases its quantity if already there
function addToCart(event, name, price, img, url) {
  event.preventDefault();

  if (!isLoggedIn()) {
    toggleLogin();
    return;
  }

  var cart = getCart();
  var existingItem = findItemInCart(cart, name);

  if (existingItem) {
    existingItem.qty += 1;
    existingItem.img = img;
    existingItem.price = price;
    existingItem.url = url;
  } else {
    cart.push({ name: name, price: price, img: img, qty: 1, url: url });
  }

  saveCart(cart);
  showAddedToCart(name);
}

// Decreases quantity by 1, removing the item once it hits 0
function removeFromCart(index) {
  var cart = getCart();
  cart[index].qty -= 1;

  if (cart[index].qty <= 0) cart.splice(index, 1);

  saveCart(cart);
  renderCart();
}

// Removes an item completely, no matter its quantity
function removeItemCompletely(index) {
  var cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// Increases quantity by 1
function increaseQty(index) {
  var cart = getCart();
  cart[index].qty += 1;
  saveCart(cart);
  renderCart();
}

// "Remove All" button on the cart page
function clearCart() {
  if (!isLoggedIn()) {
    toggleLogin();
    return;
  }

  if (getCart().length === 0) {
    showEmptyCart("Your cart is already empty!");
    return;
  }

  openPopup("confirmRemoveOverlay");
}

// Called when the user confirms "Yes" on the Remove All popup
function confirmRemoveAll() {
  saveCart([]);
  renderCart();
  closePopup("confirmRemoveOverlay");
}


// 7. DRAWING THE CART ON SCREEN
 

function renderCart() {
  var container = document.getElementById("cartItemsList");
  if (!container) return; // this page doesn't have a cart list

  if (!isLoggedIn()) {
    container.innerHTML =
      "<h2>Please log in to view your cart</h2>" +
      '<button class="btn btn-warning" onclick="toggleLogin()">Login</button>';
    return;
  }

  var cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = "<h2>Your cart is empty</h2>";
    return;
  }

  var html = "";
  for (var i = 0; i < cart.length; i++) {
    html += buildCartRowHtml(cart[i], i);
  }
  html += '<h3 class="cart-total">Total: Rs.' + formatRs(getCartTotal(cart)) + "</h3>";

  container.innerHTML = html;
}

// Builds the HTML for one cart row (image, name, price, qty controls, remove button)
function buildCartRowHtml(item, index) {
  var itemUrl = item.url || "#";

  return (
    '<div class="cart-row">' +
      '<a href="' + itemUrl + '"><img src="' + item.img + '" class="cart-row-img"></a>' +
      '<div class="cart-row-info">' +
        '<h4><a href="' + itemUrl + '">' + item.name + "</a></h4>" +
        "<p>Rs." + formatRs(item.price) + " x " + item.qty + "</p>" +
        '<div class="qty-controls">' +
          '<button class="qty-btn minus" onclick="removeFromCart(' + index + ')">-</button>' +
          '<span class="qty-count">' + item.qty + "</span>" +
          '<button class="qty-btn plus" onclick="increaseQty(' + index + ')">+</button>' +
        "</div>" +
      "</div>" +
      '<button class="btn btn-sm btn-outline-danger" onclick="removeItemCompletely(' + index + ')">Remove</button>' +
    "</div>"
  );
}

 
// 8. CHECKOUT
 

// Holds the single item being bought via "Buy Now" (null the rest of the time)
var buyNowItem = null;

function buyAll() {
  if (!isLoggedIn()) {
    toggleLogin();
    return;
  }

  var cart = getCart();
  if (cart.length === 0) {
    showEmptyCart();
    return;
  }

  document.getElementById("checkoutTotal").textContent = "Total: Rs." + formatRs(getCartTotal(cart));
  openPopup("checkoutOverlay");
}

function buyNow(event, name, price, img, url) {
  event.preventDefault();

  if (!isLoggedIn()) {
    toggleLogin();
    return;
  }

  buyNowItem = { name: name, price: price, img: img, qty: 1, url: url };

  document.getElementById("checkoutTotal").textContent = "Total: Rs." + formatRs(price);
  openPopup("checkoutOverlay");
}

function closeCheckout() {
  closePopup("checkoutOverlay");
  buyNowItem = null; // cancel any pending "Buy Now" purchase
}

function handleCheckout(event) {
  event.preventDefault();

  var total;

  if (buyNowItem) {
    // Buying a single product directly - the cart is left untouched
    total = buyNowItem.price * buyNowItem.qty;
    buyNowItem = null;
  } else {
    // Buying everything in the cart
    var cart = getCart();
    total = getCartTotal(cart);
    saveCart([]);
    renderCart();
  }

  document.getElementById("checkoutAddress").value = "";
  document.getElementById("checkoutPhone").value = "";

  closePopup("checkoutOverlay");
  showOrderConfirm(total);

  return false;
}

 
// 9. POPUP MESSAGES  
 

function showAddedToCart(name) {
  var textElement = document.getElementById("addedToCartText");
  if (textElement) textElement.textContent = name + " has been added to your cart.";
  openPopup("addedToCartOverlay");
}

function showEmptyCart(message) {
  var textElement = document.getElementById("emptyCartText");
  if (textElement) textElement.textContent = message || "Add some items to your cart.";
  openPopup("emptyCartOverlay");
}

function showOrderConfirm(total) {
  var textElement = document.getElementById("orderConfirmText");
  if (textElement) {
    textElement.textContent =
      "Your Order has been placed. Rs." + formatRs(total) +
      " has been deducted. Your order will arrive in 3 days.";
  }
  openPopup("orderConfirmOverlay");
}

 
function closeAddedToCart() { closePopup("addedToCartOverlay"); }
function closeEmptyCart() { closePopup("emptyCartOverlay"); }
function closeOrderConfirm() { closePopup("orderConfirmOverlay"); }
function closeConfirmRemove() { closePopup("confirmRemoveOverlay"); }

 

// 10. SMALL HELPERS

// Turns a number like 1990 into "1,990"
function formatRs(num) {
  return num.toLocaleString("en-IN");
}

 
// PRODUCT DATA (needed for search.html)
 

var allProducts = [
  { name: "Logitech G402 Mouse", desc: "One of the most popular budget Gaming Mouse.", displayPrice: "1,990", cartPrice: 1990, discount: "-69%", rating: "4.3", ratingCount: "200", img: "/Source/Shopping/Logitech Thumbnail.png", url: "item1.html" },
  { name: "Denver Perfume", desc: "Its the real secret of my and many more's success.", displayPrice: "450", cartPrice: 450, discount: "-30%", rating: "4.1", ratingCount: "85", img: "/Source/Shopping/Denver.jpg", url: "item2.html" },
  { name: "Omnitrix", desc: "It started when an alien device did what it did.", displayPrice: "1,200", cartPrice: 12000, discount: "-15%", rating: "4.6", ratingCount: "340", img: "/Source/Shopping/ben_10_OG_omnitrix.png", url: "item3.html" },
  { name: "Pixel Art", desc: "Some Pixel Art You Might Like", displayPrice: "120", cartPrice: 120, discount: "-25%", rating: "4.8", ratingCount: "140", img: "/Source/Shopping/Pixel Art.jpg", url: "item4.html" },
  { name: "PlayStation 5 Controller", desc: "The Orignal Controller for Play Station", displayPrice: "8,499", cartPrice: 8499, discount: "-10%", rating: "4.7", ratingCount: "512", img: "/Source/Shopping/PS 5 Controller.jpeg", url: "item5.html" },
  { name: "45-Piece Home Tool Kit", desc: "Everyday hand tools in a carry case.", displayPrice: "1,800", cartPrice: 1800, discount: "-15%", rating: "4.2", ratingCount: "58", img: "/Source/Shopping/45 (2).jpg", url: "item6.html" },
  { name: "Remote Control Car", desc: "High-speed RC car for kids and adults.", displayPrice: "1,200", cartPrice: 1200, discount: "-30%", rating: "4.6", ratingCount: "210", img: "/Source/Shopping/RC 3.jpg", url: "item7.html" },
  { name: "Building Blocks Set", desc: "Creative building blocks for all ages.", displayPrice: "950", cartPrice: 950, discount: "-10%", rating: "4.7", ratingCount: "180", img: "/Source/Shopping/MC 1.jpg", url: "item8.html" },
  { name: "Ceramic Vase Set", desc: "Handcrafted decorative vases, set of 2.", displayPrice: "1,450", cartPrice: 1450, discount: "-18%", rating: "4.5", ratingCount: "64", img: "/Source/Shopping/Vase 1.jpg", url: "item9.html" },
  { name: "Scented Candle Set", desc: "Enhance your home atmosphere with these Scented Candles.", displayPrice: "850", cartPrice: 850, discount: "-12%", rating: "4.3", ratingCount: "88", img: "/Source/Shopping/Scented Candle.webp", url: "item10.html" }
];
 

// SEARCH
 

// Called when the search form is submitted on ANY page
function goToSearchPage(event) {
  event.preventDefault();

  var searchText = document.getElementById("searchInput").value.trim();
  window.location.href = "search.html?q=" + encodeURIComponent(searchText);

  return false;
}

// Runs on search.html to show the matching products
function renderSearchResults() {
  var container = document.getElementById("searchResultsList");
  if (!container) return; // not on the search page, do nothing

  var params = new URLSearchParams(window.location.search);
  var searchText = (params.get("q") || "").toLowerCase().trim();

  var heading = document.getElementById("searchHeading");
  if (heading) {
    heading.textContent = searchText ? 'Search results for "' + searchText + '"' : "All Products";
  }

  var matches = [];
  for (var i = 0; i < allProducts.length; i++) {
    if (searchText === "" || allProducts[i].name.toLowerCase().indexOf(searchText) !== -1) {
      matches.push(allProducts[i]);
    }
  }

  if (matches.length === 0) {
    container.innerHTML = "<h3>No products found.</h3>";
    return;
  }

  var html = "";
  for (var j = 0; j < matches.length; j++) {
    html += buildProductCardHtml(matches[j]);
  }
  container.innerHTML = html;
}

// Builds the HTML for one product card (same look as the cards on shopping.html)
function buildProductCardHtml(product) {
  return (
    '<div class="card">' +
      '<a href="' + product.url + '"><img src="' + product.img + '" class="card-img-top" alt="' + product.name + '"></a>' +
      '<div class="card-body">' +
        '<a href="' + product.url + '" style="text-decoration:none;"><h5 class="card-title">' + product.name + "</h5></a>" +
        '<p class="card-text">' + product.desc + "</p>" +
        '<div class="price-row">' +
          '<strong class="price">Rs.' + product.displayPrice + "</strong>" +
          '<p class="discount">' + product.discount + "</p>" +
        "</div>" +
        '<p class="rating-row">⭐ ' + product.rating + ' <em class="rating-count">(' + product.ratingCount + ")</em></p>" +
        '<a href="#" class="btn btn-sm btn-warning" onclick="addToCart(event, \'' + product.name + "', " + product.cartPrice + ", '" + product.img + "', '" + product.url + '\')">Add to Cart</a>' +
      "</div>" +
    "</div>"
  );
}


// 10. CONTACT FORM
 

function handleContact(event) {
  event.preventDefault(); // stop the form from actually submitting/reloading

  var name = document.getElementById("contactName").value;

  document.getElementById("contactName").value = "";
  document.getElementById("contactEmail").value = "";
  document.getElementById("contactSubject").value = "";
  document.getElementById("contactMessage").value = "";

  var textElement = document.getElementById("contactSentText");
  if (textElement) {
    textElement.textContent =
      "Thanks, " + name + "! Your message has been received. Our support team will get back to you soon.";
  }
  openPopup("contactSentOverlay");

  return false;
}

function closeContactSent() { closePopup("contactSentOverlay"); }