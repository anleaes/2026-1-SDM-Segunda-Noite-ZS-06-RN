import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  // Lista do banco
  const [usuarios, setUsuarios] = useState([])
  const [erro, setErro] = useState(null)

  // Função que busca do Django
  const carregarUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:8000/usuarios/')
      setUsuarios(response.data) // Guarda os dados recebidos
    } catch (err) {
      setErro("Não foi possível conectar ao backend. Verifique o CORS!")
      console.error(err)
    }
  }

  // useEffect faz a função rodar quando a página abre
  useEffect(() => {
    carregarUsuarios()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>🎮 Sistema de Gerenciamento - A3</h1>
      <hr />

      {/* Exibição de Erro, se houver */}
      {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}

      <h2>Lista de Usuários (Vindo do Oracle)</h2>
      
      {/* Mostra a lista na tela */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {usuarios.length > 0 ? (
          usuarios.map((user) => (
            <div key={user.id} style={{ 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <strong>Usuário:</strong> {user.username} <br />
              <small>E-mail: {user.email}</small>
            </div>
          ))
        ) : (
          <p>Nenhum usuário encontrado ou carregando...</p>
        )}
      </div>
    </div>
  )
}

export default App