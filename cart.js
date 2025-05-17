// auth.js

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

function addToCart(button) {
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

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingProduct = cart.find(item => item.id === product.id && item.size === product.size);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`Added to bag: ${product.name} (Size ${selectedSize})`);
}

