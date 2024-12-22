const PORT = process.env.PORT || 5000;
const express = require('express');
const cors = require('cors');
const app = express();
const scraper = require('./scraper');

app.use(cors());
app.use(express.json()); // Middleware para procesar JSON
app.use(express.urlencoded({ extended: true })); // Para manejar solicitudes codificadas en URL

let ligaSeleccionada = 'https://www.promiedos.com.ar/espana'

app.get('/', function (req, res) {
    res.json('Web scraper para obtener datos de https://www.promiedos.com.ar/');
});

app.post('/set-liga', (req, res) => {
    const { liga } = req.body;
    if (liga) {
        ligaSeleccionada = liga;
        res.status(200).send('Liga seleccionada actualizada');
    } else {
        res.status(400).send('Liga no especificada');
    }
});

app.get('/posiciones', async (req, res) => {
    await scraper.getPosiciones(req, res, ligaSeleccionada);
});

app.get('/partido', async (req, res) => {
    await scraper.getFecha(req, res, ligaSeleccionada);
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
