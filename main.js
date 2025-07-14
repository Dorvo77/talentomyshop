document.addEventListener('DOMContentLoaded', () => {

        // --- REFERENCIAS A ELEMENTOS DEL DOM ---
        const productList = document.getElementById('product-list');
        const cartButton = document.getElementById('cart-button');
        const closeCartButton = document.getElementById('close-cart-button');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartCounter = document.getElementById('cart-counter');
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartTotalElement = document.getElementById('cart-total');
        const checkoutButton = document.getElementById('checkout-button');
        
        const loginModal = document.getElementById('login-modal');
        const closeLoginModalButton = document.getElementById('close-login-modal');
        const loginBackdrop = document.getElementById('login-backdrop');
        const loginForm = document.getElementById('login-form');

        const notificationToast = document.getElementById('notification-toast');
        const notificationMessage = document.getElementById('notification-message');

        // --- ESTADO DE LA APLICACIÓN ---
        let cart = []; // Almacena los productos en el carrito: { id, name, price, image, quantity }
        let isLoggedIn = false; // Simula el estado de sesión del usuario.
        let notificationTimer; // Para gestionar el temporizador de la notificación.

        // --- ESTRUCTURA DE DATOS DE PRODUCTOS (simulando una API) ---
        const products = [
            { id: 1, name: 'Elden Ring', price: 69.99, image: './image/elden.jpg' },
            { id: 2, name: 'Cyberpunk 2077', price: 59.99, image: './image/cyberpunk.jpg' },
            { id: 3, name: 'Baldur\'s Gate 3', price: 29.99, image: './image/baldursIII.webp' },
            { id: 4, name: 'Red Dead Redemption 2', price: 49.99, image: './image/redII.jpg' },
            { id: 5, name: 'God of War: Ragnarök', price: 69.99, image: './image/ragnar.jpg' },
            { id: 6, name: 'Starfield', price: 19.99, image: './image/starfield.jpg' },
            { id: 7, name: 'Tempest Rising', price: 24.99, image: './image/tempest.jpg' },
            { id: 8, name: 'The Expedition 33', price: 39.99, image: './image/expedition.jpg' },
            { id: 9, name: 'Stalker 2', price: 29.99, image: './image/stalker2.jpg' },
            { id: 10, name: 'Silent Hill 2', price: 19.99, image: './image/silent2.jpg' },
            { id: 11, name: 'Hogwarts Legacy', price: 39.99, image: './image/hogwarts.jpg' },
            { id: 12, name: 'Final Fantasy XVI', price: 59.99, image: './image/finalXVI.jpg' },
            { id: 13, name: 'Resident Evil 4 Remake', price: 49.99, image: './image/residentIV.jpg' }
        ];

        // --- FUNCIONES ---

        /**
         * Renderiza las tarjetas de productos en la página principal.
         * Utiliza un layout de grid responsivo.
         */
        function renderProducts() {
            productList.innerHTML = ''; 
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'card flex flex-col shadow-lg';
                productCard.innerHTML = `
                    <div class="relative">
                        <img src="${product.image}" alt="[Imagen de ${product.name}]" class="w-full h-80 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x500/1f2937/e5e7eb?text=Imagen+no+encontrada';">
                    </div>
                    <div class="p-5 flex flex-col flex-grow">
                        <h3 class="text-xl font-bold text-white mb-2 truncate">${product.name}</h3>
                        <p class="text-2xl font-semibold text-indigo-400 mb-4 mt-auto">$${product.price.toFixed(2)}</p>
                        <button class="add-to-cart-btn w-full mt-2 btn-primary font-bold py-2 px-4 rounded-lg" data-id="${product.id}">
                           <i class="fas fa-cart-plus mr-2"></i> Añadir al Carrito
                        </button>
                    </div>
                `;
                productList.appendChild(productCard);
            });
        }

        /**
         * Actualiza completamente la vista del carrito (items, total, contador).
         * Se llama cada vez que el carrito es modificado.
         */
        function updateCartView() {
            cartItemsContainer.innerHTML = ''; 

            if (cart.length === 0) {
                emptyCartMessage.style.display = 'block';
            } else {
                emptyCartMessage.style.display = 'none';
                cart.forEach(item => {
                    const cartItemElement = document.createElement('div');
                    cartItemElement.className = 'flex items-center justify-between mb-4 p-2 bg-gray-800 rounded-lg';
                    cartItemElement.innerHTML = `
                        <img src="${item.image}" alt="[Imagen de ${item.name}]" class="w-16 h-16 object-cover rounded-md mr-4" onerror="this.onerror=null;this.src='https://placehold.co/100x100/1f2937/e5e7eb?text=Img';">
                        <div class="flex-grow">
                            <p class="font-semibold text-white truncate">${item.name}</p>
                            <p class="text-sm text-gray-400">$${item.price.toFixed(2)}</p>
                        </div>
                        <div class="flex items-center">
                            <button class="quantity-change text-white bg-gray-700 rounded h-7 w-7 flex items-center justify-center hover:bg-gray-600 transition-colors" data-id="${item.id}" data-change="-1">-</button>
                            <span class="mx-3 font-bold text-lg">${item.quantity}</span>
                            <button class="quantity-change text-white bg-gray-700 rounded h-7 w-7 flex items-center justify-center hover:bg-gray-600 transition-colors" data-id="${item.id}" data-change="1">+</button>
                        </div>
                        <button class="remove-from-cart text-red-500 hover:text-red-400 ml-4 transition-colors" data-id="${item.id}">
                            <i class="fas fa-trash-alt fa-lg"></i>
                        </button>
                    `;
                    cartItemsContainer.appendChild(cartItemElement);
                });
            }

            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            cartCounter.textContent = totalItems;
            cartTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
        }

        /**
         * Añade un producto al carrito o incrementa su cantidad si ya existe.
         * @param {number} productId - El ID del producto a añadir.
         */
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const cartItem = cart.find(item => item.id === productId);

            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            updateCartView();
            showNotification(`¡Añadido: ${product.name}!`, 'success');
        }

        /**
         * Cambia la cantidad de un item en el carrito. Si la cantidad llega a 0, lo elimina.
         * @param {number} productId - El ID del producto a modificar.
         * @param {number} change - El cambio a aplicar (+1 o -1).
         */
        function changeQuantity(productId, change) {
            const cartItem = cart.find(item => item.id === productId);
            if (!cartItem) return;

            cartItem.quantity += change;

            if (cartItem.quantity <= 0) {
                removeFromCart(productId);
            } else {
                updateCartView();
            }
        }
        
        /**
         * Elimina un producto completamente del carrito.
         * @param {number} productId - El ID del producto a eliminar.
         */
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCartView();
        }
        
        /**
         * Muestra una notificación temporal (toast).
         * @param {string} message - El mensaje a mostrar.
         * @param {'success' | 'error'} type - El tipo de notificación para cambiar el color.
         */
        function showNotification(message, type = 'success') {
            clearTimeout(notificationTimer); // Limpia cualquier timer anterior
            notificationMessage.textContent = message;

            notificationToast.classList.remove('bg-green-500', 'bg-red-500');
            notificationToast.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500');
            
            notificationToast.classList.remove('opacity-0', 'translate-y-24');
            notificationTimer = setTimeout(() => {
                 notificationToast.classList.add('opacity-0', 'translate-y-24');
            }, 3000);
        }

        // --- MANEJADORES DE EVENTOS (usando delegación de eventos para eficiencia) ---
        
        // Abrir/Cerrar el carrito de compras
        cartButton.addEventListener('click', () => cartSidebar.classList.add('open'));
        closeCartButton.addEventListener('click', () => cartSidebar.classList.remove('open'));

        // Clics en la lista de productos para añadir al carrito
        productList.addEventListener('click', (e) => {
            const button = e.target.closest('.add-to-cart-btn');
            if (button) {
                const productId = parseInt(button.dataset.id);
                addToCart(productId);
            }
        });
        
        // Clics dentro del carrito para cambiar cantidad o eliminar
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const productId = parseInt(target.dataset.id);
            
            if (target.classList.contains('quantity-change')) {
                const change = parseInt(target.dataset.change);
                changeQuantity(productId, change);
            } else if (target.classList.contains('remove-from-cart')) {
                removeFromCart(productId);
            }
        });
        
        // Lógica del botón de "Comprar"
        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification("El carrito está vacío.", 'error');
                return;
            }

            if (isLoggedIn) {
                // Simulación de compra exitosa si ya ha iniciado sesión
                showNotification("¡Gracias por tu compra!", 'success');
                cart = []; // Vaciar carrito
                updateCartView();
                cartSidebar.classList.remove('open');
            } else {
                // Si no ha iniciado sesión, mostrar el modal
                loginModal.style.display = 'flex';
            }
        });
        
        // Cerrar el modal de login
        function closeLogin() {
             loginModal.style.display = 'none';
        }
        closeLoginModalButton.addEventListener('click', closeLogin);
        loginBackdrop.addEventListener('click', closeLogin);

        // Lógica del formulario de inicio de sesión (simulado)
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            isLoggedIn = true;
            closeLogin();
            showNotification("¡Inicio de sesión exitoso! Puedes continuar.", 'success');
            // Cambiar el botón para indicar que el siguiente paso es procesar el pedido
            checkoutButton.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Procesar Pedido';
        });

        // --- INICIALIZACIÓN DE LA APLICACIÓN ---
        renderProducts();
        updateCartView();
    });