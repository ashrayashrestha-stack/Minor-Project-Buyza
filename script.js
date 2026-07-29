// =========================================================
// Buyza
// =========================================================

// Run all the setup functions only when the page has fully loaded
document.addEventListener("DOMContentLoaded", function () {
  initDropdowns();
  initCarousels();
  checkLoginStatus();
  renderCart();
  applyDarkModeOnLoad();
});


// CATEGORIES DROPDOWN MENU

function initDropdowns() {
  var allDropdowns = document.querySelectorAll(".nav-dropdown");

  // Give every dropdown a click event so it can open/close
  for (var i = 0; i < allDropdowns.length; i++) {
    setupOneDropdown(allDropdowns[i], allDropdowns);
  }

  // If the user clicks anywhere outside a dropdown, close all of them
  document.addEventListener("click", function (event) {
    for (var i = 0; i < allDropdowns.length; i++) {
      var dropdown = allDropdowns[i];
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("open");
      }
    }
  });
}

function setupOneDropdown(dropdown, allDropdowns) {
  var toggleLink = dropdown.querySelector(".dropdown-toggle");
  if (!toggleLink) {
    return;
  }

  toggleLink.addEventListener("click", function (event) {
    event.preventDefault();

    var wasOpen = dropdown.classList.contains("open");

    // Close every dropdown first
    for (var i = 0; i < allDropdowns.length; i++) {
      allDropdowns[i].classList.remove("open");
    }

    // then reopen this one, unless it was already open (acts like a toggle).
    if (!wasOpen) {
      dropdown.classList.add("open");
    }
  });
}



// IMAGE CAROUSELS

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

  // Nothing to slide if there's no track or no slides.
  if (!track || totalSlides === 0) {
    return;
  }

  function showSlide(slideIndex) {
    //  makes the carousel "wrap around" instead of running
    // out of slides (e.g. going before slide 0 jumps to the last slide)
    currentSlide = (slideIndex + totalSlides) % totalSlides;
    track.style.transform = "translateX(-" + (currentSlide * 100) + "%)";
  }

  function goToNextSlide() {
    showSlide(currentSlide + 1);
  }

  function goToPrevSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoplay() {
    stopAutoplay(); // clear any existing timer first, so they don't stack up
    autoplayTimer = setInterval(goToNextSlide, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
    }
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      goToNextSlide();
      startAutoplay(); // restart the timer so it waits a full delay again
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      goToPrevSlide();
      startAutoplay();
    });
  }

  // Pause autoplay while the mouse is hovering over the carousel
  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);

  showSlide(0);
  startAutoplay();
}


/* =========================================================
   DARK MODE
========================================================= */
function toggleDarkMode(button) {
  document.body.classList.toggle("dark-mode");
  document.documentElement.classList.toggle("dark-mode");

  var isDarkModeOn = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkModeOn ? "true" : "false");

  updateThemeIcon();
}

function applyDarkModeOnLoad() {
  var savedPreference = localStorage.getItem("darkMode");

  if (savedPreference === "true") {
    document.body.classList.add("dark-mode");
    document.documentElement.classList.add("dark-mode");
  }

  updateThemeIcon();
}

function updateThemeIcon() {
  var themeButton = document.querySelector(".theme-btn");
  if (!themeButton) {
    return;
  }

  if (document.body.classList.contains("dark-mode")) {
    themeButton.textContent = "☀️";
  } else {
    themeButton.textContent = "🌙";
  }
}


/* =========================================================
   LOGIN / PROFILE (simulated - no real backend)
========================================================= */
function toggleLogin() {
  var overlay = document.getElementById("loginOverlay");
  overlay.classList.toggle("show");
}

function handleLogin(event) {
  event.preventDefault(); // stop the form from actually submitting/reloading

  localStorage.setItem("loggedIn", "true");

  toggleLogin();       // hide the login popup
  showProfileMenu();   // show the profile icon instead of the login icon
  renderCart();         // refresh the cart now that we're "logged in"

  return false;
}

function logOut() {
  localStorage.removeItem("loggedIn");
  hideProfileMenu();
}

function toggleDropdown() {
  var dropdown = document.getElementById("profileDropdown");
  dropdown.classList.toggle("open");
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
  if (isLoggedIn()) {
    showProfileMenu();
  }
}

function isLoggedIn() {
  return localStorage.getItem("loggedIn") === "true";
}


/* =========================================================
   SHOPPING CART (saved in localStorage)
========================================================= */

// Read the cart out of localStorage. If there isn't one yet, return an empty list
function getCart() {
  var cartText = localStorage.getItem("cart");

  if (!cartText) {
    return [];
  }

  return JSON.parse(cartText);
}

// Save the cart list back into localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Look through the cart for an item with this name
// Returns the item if found, or null if it isn't in the cart
function findItemInCart(cart, name) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].name === name) {
      return cart[i];
    }
  }
  return null;
}

// Add up the price of everything in the cart.
function getCartTotal(cart) {
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].qty;
  }
  return total;
}

function addToCart(event, name, price, img) {
  event.preventDefault();

  if (!isLoggedIn()) {
    toggleLogin();
    return;
  }

  var cart = getCart();
  var existingItem = findItemInCart(cart, name);

  if (existingItem) {
    // Already in the cart - just add one more.
    existingItem.qty += 1;
    existingItem.img = img;     // keep the image path up to date
    existingItem.price = price; // keep the price up to date
  } else {
    // New item - add it to the cart.
    cart.push({ name: name, price: price, img: img, qty: 1 });
  }

  saveCart(cart);
  alert("Added to Cart!");
}

function removeFromCart(index) {
  var cart = getCart();

  cart[index].qty -= 1;

  // If we've removed the last one, take the whole item out of the cart.
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
}

function clearCart() {
  if (!isLoggedIn()) {
    toggleLogin();
    return;
  }

  var cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is already empty!");
    return;
  }

  var userConfirmed = confirm("Remove all items from your cart?");
  if (userConfirmed) {
    saveCart([]);
    renderCart();
  }
}

// Draws the cart items onto the cart page.
function renderCart() {
  var container = document.getElementById("cartItemsList");
  if (!container) {
    return; // this page doesn't have a cart list, so there's nothing to do
  }

  if (!isLoggedIn()) {
    container.innerHTML =
      "<h2>Please log in to view your cart</h2>" +
      '<button class="btn btn-warning" onclick="toggleLogin()">Login</button>';
    return;
  }

  var cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<h2>Your cart is empty</h2>";
    return;
  }

  // Build one row of HTML for each item in the cart.
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var row = buildCartRow(item, i);
    container.appendChild(row);
  }

  var totalRow = document.createElement("h3");
  totalRow.className = "cart-total";
  totalRow.textContent = "Total: Rs." + formatRs(getCartTotal(cart));
  container.appendChild(totalRow);
}

// Creates one <div class="cart-row"> element for a single cart item.
function buildCartRow(item, index) {
  var row = document.createElement("div");
  row.className = "cart-row";

  var image = document.createElement("img");
  image.src = item.img;
  image.className = "cart-row-img";

  var info = document.createElement("div");
  info.className = "cart-row-info";
  info.innerHTML =
    "<h4>" + item.name + "</h4><p>Rs." + formatRs(item.price) + " x " + item.qty + "</p>";

  var removeButton = document.createElement("button");
  removeButton.className = "btn btn-sm btn-outline-warning";
  removeButton.textContent = "Remove";
  removeButton.onclick = function () {
    removeFromCart(index);
  };

  row.appendChild(image);
  row.appendChild(info);
  row.appendChild(removeButton);

  return row;
}


// CheckOut

function buyAll() {
  if (!isLoggedIn()) {
    toggleLogin();
    return;
  }

  var cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  var total = getCartTotal(cart);
  document.getElementById("checkoutTotal").textContent = "Total: Rs." + formatRs(total);
  document.getElementById("checkoutOverlay").classList.add("show");
}

function closeCheckout() {
  document.getElementById("checkoutOverlay").classList.remove("show");
}

function handleCheckout(event) {
  event.preventDefault();

  var addressInput = document.getElementById("checkoutAddress");
  var phoneInput = document.getElementById("checkoutPhone");

  var cart = getCart();
  var total = getCartTotal(cart);

  // Clear the form fields.
  addressInput.value = "";
  phoneInput.value = "";

  closeCheckout();

  // Order "placed" - empty the cart.
  saveCart([]);
  renderCart();

  showOrderConfirm(total);

  return false;
}

function showOrderConfirm(total) {
  var textElement = document.getElementById("orderConfirmText");
  if (textElement) {
    textElement.textContent =
      "Your Order has been placed. Rs." + formatRs(total) +
      " has been deducted. Your order will arrive in 3 days.";
  }

  var overlay = document.getElementById("orderConfirmOverlay");
  if (overlay) {
    overlay.classList.add("show");
  }
}

function closeOrderConfirm() {
  var overlay = document.getElementById("orderConfirmOverlay");
  if (overlay) {
    overlay.classList.remove("show");
  }
}


// Turns a number like 1990 into "1,990"  
function formatRs(num) {
  return num.toLocaleString('en-IN');
}