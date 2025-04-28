
# 🛋️ Better Call Sofa - E-commerce Furniture Store

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Edwiyyin/Better-Call-Sofa) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![Repo Size](https://img.shields.io/github/repo-size/Edwiyyin/Better-Call-Sofa)](https://github.com/Edwiyyin/Better-Call-Sofa)

---

A full-stack e-commerce platform for modern furniture, built with **Node.js/Express** backend and **vanilla HTML/CSS/JS** frontend.  
Features a product catalog, cart, wishlist, and checkout flow.

---

## 🚀 Getting Started

### Prerequisites

- Update your system (Linux recommended):  
  sudo apt update && sudo apt upgrade -y
- Install a code editor (e.g., VS Code).
- Install Git (Linux):  
  sudo apt install git  
  Verify installation: git --version

---

### Setup

1. Clone the repository:  
   git clone https://github.com/Edwiyyin/Better-Call-Sofa.git  
   cd Better-Call-Sofa

2. Navigate to backend:  
   cd backend

3. Start the server (Node modules are pre-installed):  
   npm start

4. Open in your browser:  
   Visit 👉 http://localhost:3000

---

## 🛋️ Features

- **Product Catalog:** Filter/sort 20+ furniture items.
- **Shopping Cart:** Add/remove items with quantity control.
- **Wishlist:** Save favorites with priority sorting.
- **Checkout Flow:** Address selection and order confirmation.
- **Responsive Design:** Optimized for mobile, tablet, and desktop.

---

## 📚 API Documentation

### User Identification

Users are identified via a `user-id` header.

Example:  
headers: { 'user-id': 'guest123' }

---

### Error Handling

| Code | Status        | Response Format                         |
|:----:|:--------------|:----------------------------------------|
| 200  | OK            | { success: true, data: {} }             |
| 400  | Bad Request   | { success: false, message: "Error" }    |
| 500  | Server Error  | { success: false, message: "Error" }    |

---

## 🛠️ Troubleshooting

| Issue                    | Solution                                 |
|---------------------------|-----------------------------------------|
| Port 3000 in use          | kill -9 $(lsof -t -i:3000)               |
| Missing JSON data         | Check backend/data/ file permissions    |
| API returns 404           | Ensure server is running (npm start)    |
| Page not loading properly | Clear browser cache (Ctrl+Shift+R)      |

---

## 💬 Contributions

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
