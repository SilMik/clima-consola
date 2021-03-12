require('dotenv').config();

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {

    // const texto = await leerInput('Hola: ');
    
    let opt = '';
    const busquedas = new Busquedas();
    do {
        // imprimir el menú 
        opt = await inquirerMenu();

        switch (opt) {
            case '1':
                //mostrar mensaje
                const termino = await leerInput('Ciudad:');

                //buscar ciudad(es) 
                const lugares = await busquedas.ciudad( termino );
                
                
                //Seleccionar lugar
                const idSel= await listarLugares(lugares);
                if( idSel === '0') continue;

                const lugarSel= lugares.find( l => l.id === idSel);
                //guardar en db
                busquedas.agregarHistorial(lugarSel.nombre)
            
                // Clima
                const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng);
                //Mostrar resultados
                
                console.log('\nInformaciones de la ciudad\n'.green);
                console.log('Ciudad:',lugarSel.nombre.green);
                console.log('lat:', lugarSel.lat);
                console.log('lng:', lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Mínima:', clima.min);
                console.log('Máxima:', clima.max);
                console.log('El clima está:', clima.desc.green)
            break;

            case '2':
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i+1}.`.green
                    console.log(`${idx} ${ lugar}`);
                })
            break;    

        }
        await pausa();

    }while( opt !== '0');

}

main();
