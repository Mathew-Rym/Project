document.addEventListener("DOMContentLoaded", function () {
    const openShopping = document.querySelector(".shopping");
    const closeShopping = document.querySelector(".closeShopping");
    const list = document.querySelector(".list");
    const listCart = document.querySelector(".listCart");
    const total = document.querySelector(".total");
    const body = document.querySelector("body");
    const quantity = document.querySelector(".quantity");
    const divCart = document.querySelector(".cart");

    openShopping.addEventListener("click", function () {
        body.classList.add("active");
    });

    closeShopping.addEventListener("click", function () {
        body.classList.remove("active");
    });

    function displayBikes() {
        fetch("https://json-server-bpjr.onrender.com/api/bikes")
            .then((resp) => resp.json())
            .then((bikes) => {
                bikes.forEach((bike) => {
                    displayBike(bike);
                });
            });
    }

    function displayBike(bike) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("item");
        newDiv.innerHTML = `
        <img src ="${bike.image}" alt="${bike.description}">
        <div class ="title">${bike.name}</div>
        <div class="price"><span>Ksh. </span>${bike.price}</div>
        <div class ="engine"><span>Engine: </span>${bike.engine}</div>
        <div class="topSpeed"><span>Top Speed: </span>${bike.top_speed}</div>
        <div class="category"><span>Type: </span>${bike.category}</div>
        <div class="button-container">
        <button class="add-btn" data-id="${bike.id}" data-name="${bike.name}" data-price="${bike.price}" data-image="${bike.image}">Add To Cart</button>
        <button class="like-btn" data-id="${bike.id}">&#10084; <span>${bike.likes}</span></button>
        </div>
        `;
        list.appendChild(newDiv);
    }

    displayBikes();

    let cart = [];

    // Event delegation for adding to cart & liking bikes
    list.addEventListener("click", function (event) {
        if (event.target.classList.contains("add-btn")) {
            let button = event.target;
            let id = button.getAttribute("data-id");
            let name = button.getAttribute("data-name");
            let price = button.getAttribute("data-price");
            let image = button.getAttribute("data-image");
            addToCart(id, name, price, image);
        } else if (event.target.classList.contains("like-btn")) {
            toggleLike(event.target.getAttribute("data-id"), event.target);
        }
    });

    function addToCart(id, name, price, image) {
        price = Number(price);
        let existingBike = cart.find((bike) => bike.id === id);

        if (existingBike) {
            existingBike.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }

        updateCart();
    }

    function toggleLike(bikeId, button) {
        fetch(`https://json-server-bpjr.onrender.com/api/bikes/${bikeId}`)
            .then((resp) => resp.json())
            .then((bike) => {
                let currentLikes = parseInt(button.querySelector("span").textContent);
                let newLikes = button.classList.contains("liked") ? currentLikes - 1 : currentLikes + 1;

                fetch(`https://json-server-bpjr.onrender.com/api/bikes/${bikeId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ likes: newLikes }),
                })
                    .then((resp) => resp.json())
                    .then((updatedBike) => {
                        button.querySelector("span").textContent = updatedBike.likes;
                        button.classList.toggle("liked");
                    });
            });
    }

    function updateCart() {
        listCart.innerHTML = "";
        let totalPrice = 0;
        let totalItems = 0;

        cart.forEach((bike) => {
            let li = document.createElement("li");
            li.innerHTML = `
            <img src="${bike.image}" width="50">
            <span>${bike.name}</span> 
            <span>Qty: ${bike.quantity}</span>
            <span> Ksh. ${Number(bike.price) * Number(bike.quantity)}</span>
            <div class ="button-container">
                <button type="button" class="remove-button" data-id="${bike.id}">Remove</button>
                <button type="button" class="checkout-button">Proceed to Checkout</button>
            </div>
            `;
            li.classList.add("cart-items");
            listCart.appendChild(li);

            totalPrice += Number(bike.price) * Number(bike.quantity);
            totalItems += bike.quantity;
        });

        total.innerText = `Total: Ksh. ${totalPrice}`;
        quantity.innerText = totalItems;
    }

    listCart.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-button")) {
            removeFromCart(event.target.getAttribute("data-id"));
        } else if (event.target.classList.contains("checkout-button")) {
            checkOut();
        }
    });

    function removeFromCart(id) {
        cart = cart.filter((bike) => bike.id !== id);
        updateCart();

        let existingForm = document.querySelector("form");
        if (existingForm) {
            existingForm.remove();
        }
    }

    function checkOut() {
        let existingForm = document.querySelector("form");
        if (existingForm) {
            existingForm.remove();
        }

        const form = document.createElement("form");

        form.innerHTML = `
        <div>
            <label for="name">Name</label>
            <input id="name" type="text" placeholder="Omondi Timon" required>
        </div>
        <div>
            <label for="number">Phone Number</label>
            <input id="number" type="text" placeholder="0712345678" required>
        </div>
        <button type="submit">Checkout</button>
        `;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const customer = {
                name: e.target.name.value,
                phone: e.target.number.value,
            };

            alert(`Congratulations ${customer.name}. Welcome to the Motor.Ke family 🥳`);
            cart = [];
            updateCart();
            form.remove();
            body.classList.remove("active");
        });

        divCart.appendChild(form);
        form.style.display = "block";
    }
});