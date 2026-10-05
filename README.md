# 🍔 Food Delivery Website

A simple and user-friendly **Food Delivery Web Application** that allows users to browse restaurants, view food items, add items to a cart, and place orders.

## 📌 Project Overview

The Food Delivery Website is designed to provide an easy online food-ordering experience.

Users can:

- Create an account / Login
- Browse available restaurants
- View food items and prices
- Add food items to the cart
- Increase or decrease item quantities
- Remove items from the cart
- View the total order amount
- Place an order

The project focuses on implementing the basic workflow of an online food delivery platform using web technologies.

## ✨ Features

### 👤 User Authentication
- Login page
- User registration
- Basic authentication interface
- User-friendly navigation

### 🏪 Restaurant Section
- Display available restaurants
- Show restaurant information
- Browse food items offered by restaurants

### 🍕 Food Menu
- Food item name
- Food image
- Price
- Add to Cart functionality

### 🛒 Shopping Cart
- View selected food items
- Increase/decrease quantity
- Remove items
- Automatically calculate total price

### 📦 Order Placement
- Review selected items
- Display total amount
- Place order
- Order confirmation

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Development Tools
- Visual Studio Code
- Live Server
- Web Browser

## 📂 Project Structure

```text
Food-Delivery/
│
├── index.html
├── login.html
├── restaurants.html
├── menu.html
├── cart.html
├── checkout.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── script.js
│   ├── login.js
│   └── cart.js
│
└── images/
    ├── restaurant1.jpg
    ├── restaurant2.jpg
    ├── pizza.jpg
    ├── burger.jpg
    └── biryani.jpg
```

## 🔄 Application Workflow

```text
Home Page
    ↓
Login / Register
    ↓
Restaurants
    ↓
Select Restaurant
    ↓
Food Menu
    ↓
Add Food to Cart
    ↓
View Cart
    ↓
Checkout
    ↓
Place Order
    ↓
Order Confirmation
```

## 🖥️ Main Pages

### 1. Home Page
The home page provides an introduction to the food delivery service and allows users to navigate to restaurants and login.

### 2. Login Page
Users can enter their credentials to access the application.

### 3. Restaurant Page
Displays the restaurants available on the platform.

### 4. Menu Page
Displays food items available from the selected restaurant along with their prices and an **Add to Cart** button.

### 5. Cart Page
Users can review their selected items, modify quantities, remove items, and see the total price.

### 6. Checkout Page
Users can review their order and confirm the purchase.

## 🧮 Cart Calculation

The cart calculates the total amount based on:

```text
Total = Σ (Food Price × Quantity)
```

For example:

```text
Pizza       ₹250 × 2 = ₹500
Burger      ₹150 × 1 = ₹150
---------------------------
Total                 ₹650
```

## 🎯 Objectives

The main objectives of this project are:

1. To develop a simple online food ordering system.
2. To provide an easy-to-use interface for customers.
3. To implement restaurant and food-item browsing.
4. To implement cart management functionality.
5. To calculate order totals dynamically using JavaScript.
6. To understand the development of a multi-page web application.

## 🚀 How to Run the Project

1. Download or clone the project.
2. Open the project folder in **Visual Studio Code**.
3. Make sure all HTML, CSS, JavaScript, and image files are in their respective folders.
4. Open `index.html`.
5. Right-click and select **Open with Live Server**.
6. The application will open in your browser.

## 🔮 Future Enhancements

The project can be extended with:

- Online payment integration
- Real-time order tracking
- Restaurant search
- Food category filtering
- Customer reviews and ratings
- Delivery partner tracking
- User profile management
- Order history
- Backend database
- Admin dashboard
- Real authentication
- Mobile responsive design

## 👨‍💻 Project Purpose

This project was developed as an academic/practical web development project to demonstrate the use of **HTML, CSS, and JavaScript** in creating an interactive food delivery application.

## 📄 License

This project is created for educational purposes.
