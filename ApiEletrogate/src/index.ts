import express, { Application, Request, Response } from 'express';
import connectDB from './db';
import InfoEsp from './entidade';
import { format } from 'date-fns';
const cors = require('cors');

const app: Application = express();

app.use(cors());

connectDB();

app.use(express.json());

let formattedDateFns

type InfoEspResumo = {
  id: string;
  umidade: number;
  temperatura: number;
  data: Date;
};


app.post('/infoEsp', async (req: Request, res: Response) => {
  const { temperatura, umidade } = req.body;
  formattedDateFns = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

  try {
    const newInfoEsp = new InfoEsp({
      temperatura,
      umidade,
      data: formattedDateFns
    });

    const infoEsp = await newInfoEsp.save();

    const result: InfoEspResumo = {
      id: infoEsp.id,
      umidade: infoEsp.umidade,
      temperatura: infoEsp.temperatura,
      data: infoEsp.data
    };

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});


app.get('/infoEsp/all', async (req: Request, res: Response) => {
  try {
    const infos = await InfoEsp.find().sort({ data: 1 }); 

    const result: InfoEspResumo[] = infos.map(info => ({
      id: info.id, 
      umidade: info.umidade,
      temperatura: info.temperatura,
      data: info.data
    }));


    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});

app.get('/infoEsp', async (req: Request, res: Response) => {
  try {
    const infoEsp = await InfoEsp.findOne().sort({ id: -1 }); 
    if (!infoEsp) {
      return res.status(404).send('Nenhum dado encontrado');
    }

    const result: InfoEspResumo = {
      id: infoEsp.id,
      umidade: infoEsp.umidade,
      temperatura: infoEsp.temperatura,
      data: infoEsp.data
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
