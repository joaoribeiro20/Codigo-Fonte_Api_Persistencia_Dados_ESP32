// script.js

// Arrays de dados
let dataGlobal = [];   // Array para armazenar dados globais que serão recuperados do servidor

// Variável para armazenar o tipo de visualização atual
let currentView = 'dashboard'; // Define a visualização inicial como 'dashboard'
let data = []; // Array para armazenar dados filtrados para visualização

// Função para adicionar um novo item, recuperando dados do servidor
function addNewItem() {
    fetch('http://localhost:3000/infoEsp/all', {
        method: 'GET', // Método HTTP para recuperar dados (GET neste caso)
        headers: {
            'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON
        }
    })
    .then(response => response.json()) // Converte a resposta da requisição para JSON
    .then(data => {
        dataGlobal = data; // Atualiza o array global com os dados recebidos
        switch (currentView) {
            case 'atual':
                filteredData = data
                .sort((a, b) => b.id - a.id); // Ordena os dados por ID, do maior para o menor
                generateTable(filteredData); // Gera a tabela com os dados filtrados
                break;
            default:
                //console.log("Nenhuma visualização correspondente encontrada."); // Comentado para depuração
                break;
        }
    })
    .catch(error => {
        console.error('Erro:', error); // Exibe qualquer erro que ocorra durante a requisição
    });
}

// Função para mostrar dados com base no tipo de visualização
function showData(type) {
    const filterSection = document.querySelector('.filter-section'); // Seleciona a seção de filtros

    const tituloPagina = document.getElementById("tituloPag"); // Seleciona o elemento do título da página
    tituloPagina.textContent = type === "atual" ? "Medições Emitida pelo ESP32" : "Dashboard - Histórico"; // Atualiza o título da página com base no tipo

    currentView = type; // Atualiza a visualização atual

    switch (type) {
        case 'dashboard':
            addNewItem(); // Adiciona novos itens para a visualização do dashboard
            data = dataGlobal; // Define os dados para a visualização do dashboard
            filterSection.style.display = 'block'; // Exibe a seção de filtros
            break;
        case 'atual':
            data = dataGlobal
            .sort((a, b) => b.id - a.id); // Ordena os dados por ID, do maior para o menor
            filterSection.style.display = 'none'; // Oculta a seção de filtros
            break;
        default:
            break;
    }

    generateTable(data); // Gera a tabela com os dados para a visualização atual
}

// Define um intervalo para atualizar os dados a cada 60 segundos
setInterval(addNewItem, 60000);

// Função para gerar a tabela com dados fornecidos
function generateTable(data) {
    const tableBody = document.querySelector('#dataTable tbody'); // Seleciona o corpo da tabela
    tableBody.innerHTML = ''; // Limpa o corpo da tabela antes de adicionar novos dados
    
    data.forEach(item => { // Itera sobre cada item de dados
        const row = document.createElement('tr'); // Cria uma nova linha para a tabela

        // Formatação da data e da hora
        const itemDate = new Date(item.data); // Converte a string de data em um objeto Date
        const date = itemDate.toLocaleDateString(); // Obtém a data em formato local
        const time = itemDate.toLocaleTimeString(); // Obtém a hora em formato local

        const dateCell = document.createElement('td'); // Cria uma célula para a data
        dateCell.textContent = date; // Define o conteúdo da célula como a data
        row.appendChild(dateCell); // Adiciona a célula à linha

        const timeCell = document.createElement('td'); // Cria uma célula para a hora
        timeCell.textContent = time; // Define o conteúdo da célula como a hora
        row.appendChild(timeCell); // Adiciona a célula à linha

        const dataCellTemp = document.createElement('td'); // Cria uma célula para a temperatura
        dataCellTemp.textContent = `${item.temperatura}C`; // Define o conteúdo da célula como a temperatura com unidade
        row.appendChild(dataCellTemp); // Adiciona a célula à linha

        const dataCellUmi = document.createElement('td'); // Cria uma célula para a umidade
        dataCellUmi.textContent = `${item.umidade}%`; // Define o conteúdo da célula como a umidade com unidade
        row.appendChild(dataCellUmi); // Adiciona a célula à linha

        tableBody.appendChild(row); // Adiciona a linha ao corpo da tabela
    });
}

// Função para aplicar filtros gerais baseados em seleção
function applyFilters() {
    const filterSelect = document.getElementById('filterSelect').value; // Obtém o valor selecionado no filtro
    let filteredData = [...dataGlobal]; // Cria uma cópia dos dados globais

    if (filterSelect === 'maiorTemp') {
        // Ordena de forma decrescente pela temperatura (maior para menor)
        filteredData.sort((a, b) => b.temperatura - a.temperatura);
    } else if (filterSelect === 'menorTemp') {
        // Ordena de forma crescente pela temperatura (menor para maior)
        filteredData.sort((a, b) => a.temperatura - b.temperatura);
    } else if (filterSelect === 'maiorUmi') {
        // Ordena de forma decrescente pela umidade (maior para menor)
        filteredData.sort((a, b) => b.umidade - a.umidade);
    } else if (filterSelect === 'menorUmi') {
        // Ordena de forma crescente pela umidade (menor para maior)
        filteredData.sort((a, b) => a.umidade - b.umidade);
    }

    generateTable(filteredData); // Gera a tabela com os dados filtrados
}

// Função para aplicar filtro de data
function applyFiltersDate() {
    const filterDate = new Date(document.getElementById('filterDate').value); // Obtém a data do input e converte para objeto Date
    if (isNaN(filterDate.getTime())) {
        alert('Por favor, selecione uma data válida.'); // Alerta se a data não for válida
        return;
    }

    const filteredData = dataGlobal.filter(item => {
        const itemDate = new Date(item.data.split(" ")[0]); // Converte a string de data do item para objeto Date, apenas a parte da data
        return itemDate.toDateString() === filterDate.toDateString(); // Compara apenas a parte da data
    });

    generateTable(filteredData); // Gera a tabela com os dados filtrados por data
}

// Função para aplicar filtro de hora
function applyFiltersTime() {
    const filterTime = document.getElementById('filterTime').value; // Obtém a hora do input

    if (!filterTime) {
        alert('Por favor, selecione uma hora válida.'); // Alerta se a hora não for válida
        return;
    }

    const [filterHours, filterMinutes] = filterTime.split(':').map(Number); // Divide a hora em horas e minutos e converte para número

    const filteredData = dataGlobal.filter(item => {
        const itemDate = new Date(item.data); // Converte a string de data do item para objeto Date
        return itemDate.getHours() === filterHours && itemDate.getMinutes() === filterMinutes; // Compara hora e minuto
    });

    generateTable(filteredData); // Gera a tabela com os dados filtrados por hora
}

// Função para atualizar a tabela, se a condição for verdadeira
function updateTable(varify){
    if(varify == true){
        generateTable(dataGlobal); // Gera a tabela com os dados globais
    }
}

// Inicializa a visualização com 'Dashboard' quando a página é carregada
window.onload = () => {
    showData('dashboard'); // Inicializa com a visualização 'Dashboard'
};









