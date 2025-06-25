const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
  container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
  container.classList.remove("active");
});

// REGISTRO
document.getElementById("enviarreg").addEventListener("click", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("fullname").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const senha = document.getElementById("reg-senha").value;
  const confirmarSenha = document.getElementById("reg-confsenha").value;

  if (!nome || !email || !senha || !confirmarSenha) {
    alert("Preencha todos os campos.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  try {
    const response = await fetch("https://site-b3ke.onrender.com/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome, email, senha, confirmarSenha })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.mensagem || "Registrado com sucesso!");
      window.location.href = '/telaprin.html';
    } else {
      alert(data.erro || "Erro ao registrar.");
    }
  } catch (error) {
    alert("Erro de conexão com o servidor.");
    console.error(error);
  }
});

// LOGIN
document.getElementById("enviarlog").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("log-email").value.trim();
  const senha = document.getElementById("log-senha").value;

  if (!email || !senha) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const response = await fetch("https://site-b3ke.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login realizado com sucesso!");
      console.log("Usuário:", data.usuario);
      localStorage.setItem("usuarioNome", data.usuario.nome);
      window.location.href = '/telaprin.html'; 
    } else {
      alert(data.erro || "Erro ao fazer login.");
    }
  } catch (error) {
    alert("Erro de conexão com o servidor.");
    console.error(error);
  }
});
