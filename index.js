import express from 'express';
import { PrismaClient } from '@prisma/client'
import cors from 'cors'

const prisma = new PrismaClient()
const app = express();
app.use(express.json());

// Configuração da porta
const port = process.env.PORT || 3333;

app.use(cors({
  origin: 'http://localhost:5173', // Endereço do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


// Criar usuário
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
  
    try {
      const user = await prisma.administrator.create({
        data: { name, email, password },
      });
      res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  });
  
  // Endpoint de login
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Verificar se o usuário existe e se a senha está correta
      const user = await prisma.administrator.findUnique({
        where: { email },
      });
  
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }
  
      // Se o login for bem-sucedido
      res.status(200).json({ message: 'Login bem-sucedido', user });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  });
  

//Listar usuários
app.get('/listar', async (req, res) => {
  
    const admin = await prisma.administrator.findMany()

    res.status(201).json(admin)
})

//Atualizar usuários
app.put('/atualizar/:id', async (req, res ) => {

    await prisma.administrator.update({
        where:{
            id:req.params.id
        },

     data:{
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
     }

    })
    res.status(201).json(req.body)
})
//Deletar usuários

app.delete('/excluir/:id', async (req, res) => {
     await prisma.administrator.delete({
        where: {
            id:req.params.id
        }
     })

     res.status(200).json({ message: "Usuário deletado com Sucesso!!"})
})



app.post('/expenses', async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    // Passar o objeto Date diretamente
    const expense = await prisma.expense.create({
      data: { title, amount, category, date: new Date(date) },
    });
    res.json(expense);
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});



// Listar todas as despesas
app.get('/expenses', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany();
    res.json(expenses);
  } catch (error) {
    console.error('Erro ao listar despesas:', error);
    res.status(500).json({ error: 'Failed to list expenses' });
  }
});

// Ler uma única despesa por ID
app.get('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({
      where: { id },
    });
    res.json(expense);
  } catch (error) {
    console.error('Erro ao ler despesa:', error);
    res.status(500).json({ error: 'Failed to get expense' });
  }
});

// Atualizar uma despesa
app.put('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date } = req.body;
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { title, amount, category, date: new Date(date) },
    });
    res.json(updatedExpense);
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Excluir uma despesa
app.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await prisma.expense.delete({
      where: { id },
    });
    res.json(deletedExpense);
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});


app.get('/report', async (req, res) => {
  try {
    // Buscando todas as despesas e agrupando por categoria
    const report = await prisma.expense.groupBy({
      by: ['category'],
      _sum: {
        amount: true,
      },
    });

    // Formatando o relatório para enviar como resposta
    const formattedReport = report.map(item => ({
      category: item.category,
      totalAmount: item._sum.amount,
    }));

    res.json({
      status: 'success',
      data: formattedReport,
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de despesas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao gerar relatório de despesas',
    });
  }
});


// Porta para iniciar servidor

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
