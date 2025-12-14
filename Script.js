document.addEventListener('DOMContentLoaded', () => {

    // --- VARIÁVEIS GLOBAIS (localStorage Keys) ---
    // ATENÇÃO: Essas chaves guardam dados sensíveis de forma insegura (apenas para simulação frontend).
    const USERS_KEY = 'flashpacks_users';
    const CADASTROS_KEY = 'flashpacks_cadastros';
    const LOGGED_IN_KEY = 'flashpacks_logged_in_user';
    
    // Pega a URL atual para saber em qual página estamos
    const currentPath = window.location.pathname;


    // --- FUNÇÕES DE UTILIDADE DE DADOS ---

    // Carrega usuários do localStorage, ou um array vazio se não houver
    const getUsers = () => {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    };

    // Salva a lista de usuários no localStorage
    const saveUsers = (users) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };

    // Pega o usuário logado atualmente (apenas o email)
    const getLoggedInUser = () => {
        return localStorage.getItem(LOGGED_IN_KEY);
    };

    // Armazena quem está logado (apenas o email)
    const setLoggedInUser = (email) => {
        localStorage.setItem(LOGGED_IN_KEY, email);
    };


    // =================================================================
    // =========== LÓGICA DE LOGIN, REGISTRO E REDEFINIÇÃO (login.html)
    // =================================================================

    if (currentPath.includes('login.html')) {
        
        // Função para abrir abas de formulário (Login, Registro, Redefinir)
        window.openLoginForm = function(evt, formName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tab-button");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(formName).style.display = "block";
            evt.currentTarget.className += " active";
        }

        // --- 1. REGISTRO (Criar Conta) ---
        document.getElementById('form-registro')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('registro-email').value;
            const senha = document.getElementById('registro-senha').value;
            const confirmarSenha = document.getElementById('registro-confirmar-senha').value;
            
            if (senha.length < 6) {
                alert('A senha deve ter no mínimo 6 caracteres.');
                return;
            }
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }

            let users = getUsers();
            if (users.find(u => u.email === email)) {
                alert('E-mail já cadastrado. Tente fazer login ou redefinir a senha.');
                return;
            }

            users.push({ email, senha }); 
            saveUsers(users);
            
            alert('✅ Conta criada com sucesso! Faça login.');
            e.target.reset();
            // Redireciona de volta para a aba de Login
            document.querySelector('.tab-button').click(); 
        });

        // --- 2. LOGIN ---
        document.getElementById('form-login')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;

            const users = getUsers();
            const user = users.find(u => u.email === email && u.senha === senha);
            
            if (user) {
                setLoggedInUser(email); // Armazena o usuário logado
                alert('Login bem-sucedido! Você será redirecionado para a Área do Cliente.');
                window.location.href = 'cadastro.html'; // Redireciona para a área restrita
            } else {
                alert('❌ E-mail ou senha incorretos.');
            }
        });

        // --- 3. REDEFINIR SENHA ---
        document.getElementById('form-redefinir')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('redefinir-email').value;
            const novaSenha = document.getElementById('redefinir-nova-senha').value;

            if (novaSenha.length < 6) {
                 alert('A nova senha deve ter no mínimo 6 caracteres.');
                 return;
            }
            
            let users = getUsers();
            const userIndex = users.findIndex(u => u.email === email);

            if (userIndex > -1) {
                users[userIndex].senha = novaSenha;
                saveUsers(users);
                alert('✅ Senha redefinida com sucesso! Faça login com a nova senha.');
                e.target.reset();
                // Volta para Login
                document.querySelector('.tab-button').click(); 
            } else {
                alert('❌ E-mail não encontrado nos nossos registros.');
            }
        });
        
        // Simula o clique inicial no Login para garantir que a aba correta esteja ativa ao carregar
        document.getElementById('login').style.display = 'block';
    }

    
    // =================================================================
    // =========== LÓGICA DE REDIRECIONAMENTO/AUTENTICAÇÃO (index.html)
    // =================================================================

    if (currentPath.includes('index.html')) {
        const botoesAssinar = document.querySelectorAll('.link-plano');
        
        botoesAssinar.forEach(botao => {
            botao.addEventListener('click', (e) => {
                const plano = botao.getAttribute('data-plano');
                const usuarioLogado = getLoggedInUser();

                if (plano === 'enterprise') {
                    alert('Você será redirecionado para a página de contato para customização do Plano Enterprise.');
                    // Deixa o redirecionamento para contato.html acontecer
                    return; 
                } 
                
                // --- Verificação de Login ---
                if (!usuarioLogado) {
                    e.preventDefault(); // Impede o redirecionamento
                    alert('Você precisa estar logado para assinar um plano. Redirecionando para Login/Cadastro.');
                    window.location.href = 'login.html';
                    return; 
                }

                // --- Confirmação de Plano (se logado) ---
                const confirmacao = confirm(`Confirmar assinatura do Plano ${plano.toUpperCase()}? Você será levado à página de pagamento.`);
                
                if (confirmacao) {
                    // Deixa o redirecionamento para checkout1.html ou checkout2.html acontecer
                } else {
                    e.preventDefault(); // Impede o redirecionamento se o usuário cancelar
                }
            });
        });
    }


    // =================================================================
    // =========== LÓGICA DE CADASTROS E LOGOUT (cadastro.html)
    // =================================================================
    
    if (currentPath.includes('cadastro.html')) {

        const usuarioLogado = getLoggedInUser();

        // Se não estiver logado, redireciona para o login
        if (!usuarioLogado) {
            alert('Acesso restrito. Faça login para acessar a Área do Cliente.');
            window.location.href = 'login.html';
            return;
        }

        // Função para carregar os cadastros do usuário logado
        const getCadastros = () => {
            const todosCadastros = JSON.parse(localStorage.getItem(CADASTROS_KEY) || '{}');
            // Retorna a lista de cadastros associada ao email do usuário logado
            return todosCadastros[usuarioLogado] || []; 
        };

        // Função para salvar os cadastros
        const saveCadastros = (cadastros) => {
            const todosCadastros = JSON.parse(localStorage.getItem(CADASTROS_KEY) || '{}');
            todosCadastros[usuarioLogado] = cadastros; // Salva a lista no slot do usuário
            localStorage.setItem(CADASTROS_KEY, JSON.stringify(todosCadastros));
        };

        // Função para renderizar os cadastros na tela
        const renderCadastros = () => {
            const listaDiv = document.getElementById('lista-cadastros');
            listaDiv.innerHTML = ''; // Limpa a lista atual
            const cadastros = getCadastros();

            if (cadastros.length === 0) {
                listaDiv.innerHTML = '<p style="text-align: center; color: #777;">Nenhum cadastro de transporte ou funcionário encontrado.</p>';
                return;
            }

            cadastros.forEach((item) => {
                const div = document.createElement('div');
                div.className = 'item-cadastro';
                
                let titulo, descricao;

                if (item.tipo === 'Transporte') {
                    titulo = `Transporte: ${item.placa}`;
                    descricao = `Modelo: ${item.modelo} | Tipo: ${item.tipoTransporte} | Chassi: ${item.chassi || 'N/A'}`;
                } else {
                    titulo = `Funcionário: ${item.nome}`;
                    descricao = `CPF/Registro: ${item.cpfRegistro}
                    | Cargo: ${item.cargo}
                    | Tel: ${item.telefone}`;
                }

                div.innerHTML = `
                    <h5>${titulo}</h5>
                    <p>${descricao}</p>
                    <small style="float: right; color: #999;">${item.tipo}</small>
                `;
                listaDiv.appendChild(div);
            });
        };

        // --- 1. Lógica para Abas de Formulário (já existe no código base) ---
        window.openTab = function(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tab-button");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }
        
        // Inicializa a primeira aba e a lista de cadastros
        const initialButton = document.querySelector('.tab-button.active');
        if (initialButton) {
            initialButton.click(); 
        }
        renderCadastros();


        // --- 2. Cadastro de Transporte ---
        document.getElementById('form-transporte')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const novoTransporte = {
                tipo: 'Transporte',
                placa: document.getElementById('placa').value,
                modelo: document.getElementById('modelo').value,
                tipoTransporte: document.getElementById('tipo-transporte').value,
                chassi: document.getElementById('chassi').value
            };

            const cadastros = getCadastros();
            cadastros.push(novoTransporte);
            saveCadastros(cadastros);

            alert(`✅ Transporte ${novoTransporte.placa} cadastrado com sucesso!`);
            e.target.reset();
            renderCadastros(); // Atualiza a lista na tela
        });

        // --- 3. Cadastro de Funcionário ---
        document.getElementById('form-funcionario')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const novoFuncionario = {
                tipo: 'Funcionário',
                nome: document.getElementById('nome-motorista').value,
                cpfRegistro: document.getElementById('cpf-registro').value,
                telefone: document.getElementById('telefone').value,
                cargo: document.getElementById('cargo').value
            };

            const cadastros = getCadastros();
            cadastros.push(novoFuncionario);
            saveCadastros(cadastros);

            alert(`✅ Funcionário ${novoFuncionario.nome} cadastrado com sucesso!`);
            e.target.reset();
            renderCadastros(); // Atualiza a lista na tela
        });

        // --- 4. Lógica de Logout ---
        document.getElementById('btn-logout')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair?')) {
                localStorage.removeItem(LOGGED_IN_KEY); // Remove o usuário logado
                alert('Sessão encerrada.');
                window.location.href = 'index.html'; // Redireciona para a home
            }
        });
    }

});