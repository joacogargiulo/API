const axios = require('axios');
const cheerio = require('cheerio');
// const urlBase = "https://www.promiedos.com.ar/";
// const urls = {
//     espana : urlBase+"espana",
//     championsleague : urlBase+"championsleague",
//     inglaterra : urlBase+"inglaterra",
//     alemania : urlBase+"alemania"
// }


async function getPosiciones(req, res, liga) {
    const url = liga
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const tablaPuntos = []

        // Extraer la tabla con clase "tablesorter1"
        $('.tablesorter1 tbody tr').each(function () {
            const equipo = $(this).find('td').eq(1).text().trim();
            const escudo = $(this).find('td').eq(1).find('img').attr('src');
            const pts = parseInt($(this).find('td').eq(2).text().trim());
            const pj = parseInt($(this).find('td').eq(3).text().trim());
            const pg = parseInt($(this).find('td').eq(4).text().trim());
            const pe = parseInt($(this).find('td').eq(5).text().trim());
            const pp = parseInt($(this).find('td').eq(6).text().trim());
            const gf = parseInt($(this).find('td').eq(7).text().trim());
            const gc = parseInt($(this).find('td').eq(8).text().trim());
            const dif = parseInt($(this).find('td').eq(9).text().trim());

            tablaPuntos.push({
                equipo,
                escudo,
                pts,
                pj,
                pg,
                pe,
                pp,
                gf,
                gc,
                dif
            });
        });

        // Retornar las posiciones como respuesta
        res.json(tablaPuntos);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function getFecha(req, res, liga) {
    const url = liga
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        let found
        let lastInvalidMatch = null;
        const partidosEnJuego = []

        $('#fixturein table tr').each((index, element) => {
            const $row = $(element);
            
            const hora = $row.find('.game-time')?.text().trim();
            const enJuego = $row.find('.game-play')?.text().trim();
            const equipo1 = $row.find('.game-t1 .datoequipo[id^="t1_"]').text().trim();
            const equipo2 = $row.find('.game-t1 .datoequipo[id^="t2_"]').text().trim();
            
            // Guarda el último partido como inválido si no tiene hora
            if (equipo1 && equipo2) {
                lastInvalidMatch = { equipo1, equipo2 };
            }

            if (enJuego) {
                found = 'jugando'
                const resultado1 =  $row.find('[id^="r1_"]').text().trim();
                const resultado2 =  $row.find('[id^="r2_"]').text().trim();
                partidosEnJuego.push({equipo1, equipo2, resultado1, resultado2})
            }
            
            // Si se encuentra un partido válido, devuélvelo y marca como encontrado
            if (!found && hora && equipo1 && equipo2) {
                found = 'proximo';
                res.json({equipo1, equipo2})
                return false
            }
        })

        if (found === 'jugando') {
            res.status(201).json(partidosEnJuego)
        }

        // Si no se encuentra un partido válido, devuelve el último partido inválido
        if (!found) {
            if (lastInvalidMatch) {
                res.status(202).json(lastInvalidMatch);
            } else {
                res.status(404).json({ message: 'No se encontraron partidos.' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    getPosiciones,
    getFecha,
};
