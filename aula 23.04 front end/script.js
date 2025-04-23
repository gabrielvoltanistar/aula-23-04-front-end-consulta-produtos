// Espera o conteúdo da página HTML carregar completamente
document.addEventListener('DOMContentLoaded', function() {

    const apiUrl = 'https://fakestoreapi.com/products';
    const tableBody = document.querySelector('#productsTable tbody'); // Seleciona o corpo da tabela
    const loadingMessageElement = document.getElementById('loadingMessage'); // Seleciona a célula de carregamento

    // Função para buscar os dados da API
    async function fetchProducts() {
        try {
            const response = await fetch(apiUrl);

            // Verifica se a requisição foi bem sucedida
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`); // Lança um erro se a resposta não for ok
            }

            const products = await response.json(); // Converte a resposta para JSON

            // Remove a mensagem de "Carregando..."
            if(loadingMessageElement) {
                loadingMessageElement.remove();
            }

            displayProducts(products); // Chama a função para exibir os produtos

        } catch (error) {
            console.error('Falha ao buscar produtos:', error);
            // Mostra uma mensagem de erro na tabela
            if(loadingMessageElement) { // Se a célula de carregamento ainda existe
                 loadingMessageElement.textContent = `Erro ao carregar produtos: ${error.message}`;
                 loadingMessageElement.classList.add('text-danger'); // Adiciona cor vermelha
            } else { // Se a célula já foi removida, adiciona uma nova linha de erro
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar produtos: ${error.message}</td></tr>`;
            }
        }
    }

    // Função para exibir os produtos na tabela
    function displayProducts(products) {
        // Limpa qualquer conteúdo prévio (exceto se for a mensagem de erro)
        if (!loadingMessageElement || loadingMessageElement.textContent.startsWith('Carregando')) {
             tableBody.innerHTML = ''; // Limpa o corpo da tabela
        }

        // Pega apenas os 10 primeiros produtos
        const productsToDisplay = products.slice(0, 10);

        // Verifica se há produtos para exibir
        if (productsToDisplay.length === 0) {
             tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum produto encontrado.</td></tr>';
             return;
        }

        // Itera sobre os 10 produtos usando um loop 'for' (como na inspiração W3Schools)
        for (let i = 0; i < productsToDisplay.length; i++) {
            const product = productsToDisplay[i]; // Pega o produto atual

            // Cria uma nova linha (tr)
            const row = tableBody.insertRow();

            // Insere as células (td) na linha
            const cellId = row.insertCell();
            const cellImage = row.insertCell();
            const cellTitle = row.insertCell();
            const cellPrice = row.insertCell();
            const cellCategory = row.insertCell();
            const cellRating = row.insertCell();

            // Preenche as células com os dados do produto
            cellId.textContent = product.id;

            // Adiciona a imagem
            cellImage.innerHTML = `<img src="${product.image}" alt="${product.title}" class="img-fluid product-table-img">`; // img-fluid do Bootstrap torna a imagem responsiva

            // Adiciona o título
            cellTitle.textContent = product.title;

            // Formata e adiciona o preço
            cellPrice.textContent = `$${product.price.toFixed(2)}`; // Formata para duas casas decimais
            cellPrice.style.textAlign = 'right'; // Alinha o preço à direita

            // Adiciona a categoria
            cellCategory.textContent = product.category;

            // Adiciona a avaliação (rate e count)
            cellRating.textContent = `${product.rating.rate} (${product.rating.count} avaliações)`;
        }
    }

    // Chama a função para iniciar a busca quando o script rodar
    fetchProducts();

});