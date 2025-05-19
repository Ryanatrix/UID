// --- Existing code (login/signup/image/size selection etc) ---

window.onload = function () {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.email === currentUser);
    if (user) {
      alert("Welcome back, " + user.name + "!");
    }
  }
};

function toggleForms() {
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");

  if (signupForm && loginForm) {
    signupForm.style.display = signupForm.style.display === "none" ? "block" : "none";
    loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
  }
}

function signUp() {
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.find(u => u.email === email)) {
    alert("This email is already registered.");
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", email);
  alert("Sign up successful!");
  toggleForms();
}

function logIn() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", user.email);
    alert("Login successful! Welcome back, " + user.name + "!");
    window.location.href = "homepage.html"; // <--- Redirect here
  } else {
    alert("Invalid email or password.");
  }
}

let selectedSize = null;

function changeImage(element) {
  document.getElementById('mainImage').src = element.src;
  document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.classList.remove('active');
  });
  element.classList.add('active');
}

function selectSize(element) {
  document.querySelectorAll('.size-option').forEach(option => {
    option.classList.remove('selected');
  });
  element.classList.add('selected');
  selectedSize = element.textContent.trim();
}

// --- Add to Cart (used on product page) ---
// Now stores cart per user!
function addToCart(button) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Please log in to add items to the cart.");
    return;
  }

  if (!selectedSize) {
    alert('Please select a size before adding to bag!');
    return;
  }

  const product = {
    id: parseInt(button.dataset.id),
    name: button.dataset.name,
    price: parseFloat(button.dataset.price),
    size: selectedSize,
    quantity: 1,
    image: document.getElementById('mainImage').src
  };

  let userCarts = JSON.parse(localStorage.getItem('userCarts') || "{}");
  let cart = userCarts[currentUser] || [];

  const existingProduct = cart.find(item => item.id === product.id && item.size === product.size);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push(product);
  }

  userCarts[currentUser] = cart;
  localStorage.setItem('userCarts', JSON.stringify(userCarts));
  alert(`Added to bag: ${product.name} (Size ${selectedSize})`);
}

// --- Display Cart (used on cart page) ---
// Only displays cart for the logged in user!
function displayCart() {
  const cartContainer = document.getElementById('cart-container');
  if (!cartContainer) return;

  // Make the table much closer to the page edge
  cartContainer.style.padding = '0 2px';
  cartContainer.style.maxWidth = '1000px';
  cartContainer.style.margin = '0 auto';
  cartContainer.style.boxSizing = 'border-box';

  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    cartContainer.innerHTML = '<p>Please log in to view your cart.</p>';
    return;
  }

  let userCarts = JSON.parse(localStorage.getItem('userCarts') || "{}");
  let cart = userCarts[currentUser] || [];
  cartContainer.innerHTML = ''; // Clear previous contents

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p style="text-align: center;">Your cart is empty.</p>';
    return;
  }

  // Create a wrapper to center the table
  const wrapper = document.createElement('div');
  wrapper.style.justifyContent = 'center';
  wrapper.style.margin = '32px 0';

  const cartTable = document.createElement('table');
  cartTable.className = 'cart-table';
  cartTable.style.border = '3px solid #222';
  cartTable.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
  cartTable.style.background = '#fff';
  cartTable.style.borderRadius = '14px';
  cartTable.style.overflow = 'hidden';
  cartTable.style.margin = '0'; // Let the wrapper handle centering

  cartTable.innerHTML = `
    <thead>
      <tr style="background:#1a1a1a; color:#fff;">
        <th>Image</th>
        <th>Name</th>
        <th>Size</th>
        <th>Price</th>
        <th>Quantity</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  let totalPrice = 0;
  const tbody = cartTable.querySelector('tbody');

  cart.forEach(product => {
    const row = document.createElement('tr');
    const productTotal = product.price * product.quantity;
    totalPrice += productTotal;

    row.innerHTML = `
      <td><img src="${product.image}" alt="${product.name}" width="50" height="50" style="border-radius:8px;"/></td>
      <td>${product.name}</td>
      <td>${product.size}</td>
      <td>₹${product.price.toFixed(2)}</td>
      <td>${product.quantity}</td>
      <td>₹${productTotal.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  wrapper.appendChild(cartTable);
  cartContainer.appendChild(wrapper);

  // Total price
  const totalDiv = document.createElement('div');
  totalDiv.className = 'cart-total';
  totalDiv.style.textAlign = 'center';
  totalDiv.style.fontSize = '1.2rem';
  totalDiv.style.marginTop = '16px';
  totalDiv.innerHTML = `<strong>Total: ₹${totalPrice.toFixed(2)}</strong>`;
  cartContainer.appendChild(totalDiv);
}
// Function to append user's cart items to cartStack (for undo, etc.)
function appendCartToStack() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Please log in to manage your cart.");
    return;
  }

  let userCarts = JSON.parse(localStorage.getItem('userCarts') || "{}");

  // Load previous stack if it exists
  let prevStack = [];
  const stackKey = 'cartStack_' + currentUser;
  const savedStack = localStorage.getItem(stackKey);
  if (savedStack) {
    prevStack = JSON.parse(savedStack);
  }

  // Get current cart items
  let currentCart = [];
  if (userCarts[currentUser] && Array.isArray(userCarts[currentUser])) {
    currentCart = userCarts[currentUser];
  }

  // Append new items to previous stack (you can choose to push or unshift based on your stack logic)
  // Here, we add the current cart items to the end of the stack array.
  const newStack = prevStack.concat(currentCart);

  // Save the updated stack
  localStorage.setItem(stackKey, JSON.stringify(newStack));
}

// Function to empty the user's cart
function emptyUserCart() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Please log in to clear your cart.");
    return;
  }

  let userCarts = JSON.parse(localStorage.getItem('userCarts') || "{}");
  userCarts[currentUser] = [];
  localStorage.setItem('userCarts', JSON.stringify(userCarts));

  if (typeof displayCart === "function") {
    displayCart();
  }
  alert("Your cart has been emptied.");
}
/**
 * Removes the top (last added) element from the cart of the currently logged-in user.
 * If the cart is empty or no user is logged in, it shows an alert.
 */
function popTopCartItem() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Please log in to modify your cart.");
    return;
  }

  let userCarts = JSON.parse(localStorage.getItem('userCarts') || "{}");
  let cart = userCarts[currentUser] || [];

  if (cart.length === 0) {
    alert("Your cart is already empty.");
    return;
  }

  cart.pop(); // Remove the last item added
  userCarts[currentUser] = cart;
  localStorage.setItem('userCarts', JSON.stringify(userCarts));

  // Optionally update the cart display
  if (typeof displayCart === "function") {
    displayCart();
  }
  alert("Removed the last item from your cart.");
}
function displayCartStack() {
  const cartContainer = document.getElementById('cart-container');
  if (!cartContainer) return;

  // Make the table much closer to the page edge
  cartContainer.style.padding = '0 2px';
  cartContainer.style.maxWidth = '1000px';
  cartContainer.style.margin = '0 auto';
  cartContainer.style.boxSizing = 'border-box';

  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    cartContainer.innerHTML = '<p>Please log in to view your cart.</p>';
    return;
  }

  // Read cartStack from localStorage
  let cartStack = [];
  // Try to get the stack as saved by emptyCart
  const cartStackKey = 'cartStack_' + currentUser;
  const stackFromStorage = localStorage.getItem(cartStackKey);
  if (stackFromStorage) {
    cartStack = JSON.parse(stackFromStorage);
  } else {
    // Fallback: try userCarts[currentUser].cartStack 
    let userCarts = JSON.parse(localStorage.getItem('userCarts') || "{}");
    if (userCarts[currentUser]?.cartStack && Array.isArray(userCarts[currentUser].cartStack)) {
      cartStack = userCarts[currentUser].cartStack;
    }
  }

  cartContainer.innerHTML = ''; // Clear previous contents

  if (!cartStack || cartStack.length === 0) {
    cartContainer.innerHTML = '<p style="text-align: center;">No Orders so far.</p>';
    return;
  }

  // Create a wrapper to center the table
  const wrapper = document.createElement('div');
  wrapper.style.justifyContent = 'center';
  wrapper.style.margin = '32px 0';

  const cartTable = document.createElement('table');
  cartTable.className = 'cart-table';
  cartTable.style.border = '3px solid #222';
  cartTable.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
  cartTable.style.background = '#fff';
  cartTable.style.borderRadius = '14px';
  cartTable.style.overflow = 'hidden';
  cartTable.style.margin = '0'; // Let the wrapper handle centering

  cartTable.innerHTML = `
    <thead>
      <tr style="background:#1a1a1a; color:#fff;">
        <th>Image</th>
        <th>Name</th>
        <th>Size</th>
        <th>Price</th>
        <th>Quantity</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  let totalPrice = 0;
  const tbody = cartTable.querySelector('tbody');

  cartStack.forEach(product => {
    const row = document.createElement('tr');
    const productTotal = product.price * product.quantity;
    totalPrice += productTotal;

    row.innerHTML = `
      <td><img src="${product.image}" alt="${product.name}" width="50" height="50" style="border-radius:8px;"/></td>
      <td>${product.name}</td>
      <td>${product.size}</td>
      <td>₹${product.price.toFixed(2)}</td>
      <td>${product.quantity}</td>
      <td>₹${productTotal.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  wrapper.appendChild(cartTable);
  cartContainer.appendChild(wrapper);

  
}
