document.addEventListener('DOMContentLoaded', function() {

    const apiUrl = 'https://fakestoreapi.com/products';
    const tableBody = document.querySelector('#productsTable tbody');
    const loadingMessageElement = document.getElementById('loadingMessage');
    const grandTotalDisplay = document.getElementById('grandTotalDisplay');

    // --- Configuração da Promoção ---
    const PROMOTION_CHANCE = 0.3; // 30% de chance de um item estar em promoção
    const PROMOTION_DISCOUNT_PERCENT = 15; // 15% de desconto

    // Função para calcular e atualizar todos os totais
    function updateTotals() {
        let currentGrandTotal = 0;
        const quantityInputs = tableBody.querySelectorAll('.quantity-input');

        quantityInputs.forEach(input => {
            const productId = input.dataset.productId;
            // IMPORTANTE: O data-price agora SEMPRE contém o preço a ser usado (original ou com desconto)
            const effectivePrice = parseFloat(input.dataset.price);
            const quantity = parseInt(input.value, 10) || 0;

            const lineTotal = effectivePrice * quantity;

            const subtotalCell = document.getElementById(`subtotal-${productId}`);
            if (subtotalCell) {
                subtotalCell.textContent = `$${lineTotal.toFixed(2)}`;
            }

            currentGrandTotal += lineTotal;
        });

        if (grandTotalDisplay) {
            grandTotalDisplay.textContent = `$${currentGrandTotal.toFixed(2)}`;
        }
    }


    // Função para buscar os dados da API
    async function fetchProducts() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const products = await response.json();

            if(loadingMessageElement) {
                loadingMessageElement.parentElement.remove();
            }

            displayProducts(products);

        } catch (error) {
            console.error('Falha ao buscar produtos:', error);
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Erro ao carregar produtos: ${error.message}</td></tr>`;
            if (grandTotalDisplay) grandTotalDisplay.textContent = '$0.00';
        }
    }

    // Função para exibir os produtos na tabela
    function displayProducts(products) {
        tableBody.innerHTML = '';

        const productsToDisplay = products.slice(0, 10);

        if (productsToDisplay.length === 0) {
             tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum produto encontrado.</td></tr>';
             if (grandTotalDisplay) grandTotalDisplay.textContent = '$0.00';
             return;
        }

        productsToDisplay.forEach(product => {
            const row = tableBody.insertRow();

            // --- Células Quase Iguais ---
            row.insertCell().textContent = product.id;
            row.insertCell().innerHTML = `<img src="${product.image}" alt="${product.title}" class="img-fluid product-table-img">`;
            row.insertCell().textContent = product.title;

            // --- Célula Preço (Com Lógica de Promoção) ---
            const priceCell = row.insertCell();
            priceCell.classList.add('text-end'); // Alinhar conteúdo à direita

            const isOnSale = Math.random() < PROMOTION_CHANCE; // Verifica se está em promoção
            let effectivePrice = product.price; // Preço a ser usado no cálculo

            if (isOnSale) {
                const discountedPrice = product.price * (1 - PROMOTION_DISCOUNT_PERCENT / 100);
                effectivePrice = discountedPrice; // Atualiza o preço efetivo
                // Mostra ambos os preços: original riscado, promocional em destaque
                priceCell.innerHTML = `
                    <span class="original-price">$${product.price.toFixed(2)}</span>
                    <span class="promo-price">$${discountedPrice.toFixed(2)}</span>
                `;
            } else {
                // Mostra apenas o preço original
                priceCell.textContent = `$${product.price.toFixed(2)}`;
            }

            // --- Células Restantes (Categoria, Avaliação) ---
            row.insertCell().textContent = product.category;
            row.insertCell().textContent = `${product.rating.rate} (${product.rating.count} avaliações)`;

            // --- Célula Promoção (Indicativo) ---
            const promotionCell = row.insertCell();
            promotionCell.classList.add('text-center');
            if (isOnSale) {
                promotionCell.innerHTML = `<span class="badge bg-success">Sim (${PROMOTION_DISCOUNT_PERCENT}%)</span>`;
            } else {
                promotionCell.innerHTML = '<span class="badge bg-secondary">Não</span>';
            }

            // --- Célula Quantidade (Input) ---
            const quantityCell = row.insertCell();
            quantityCell.classList.add('text-center');
            quantityCell.innerHTML = `
                <input
                    type="number"
                    class="form-control form-control-sm quantity-input"
                    value="0"
                    min="0"
                    id="quantity-${product.id}"
                    data-product-id="${product.id}"
                    data-price="${effectivePrice.toFixed(2)}"  /* IMPORTANTE: Armazena o preço EFETIVO */
                    oninput="updateTotals()">`;

            // --- Célula Subtotal ---
            const subtotalCell = row.insertCell();
            subtotalCell.id = `subtotal-${product.id}`;
            subtotalCell.textContent = '$0.00';
            subtotalCell.classList.add('text-end');
        });

         // Calcula os totais iniciais
         updateTotals();
    }

    // Expõe a função updateTotals globalmente
    window.updateTotals = updateTotals;

    // Chama a função para iniciar a busca
    fetchProducts();
});