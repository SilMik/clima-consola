const fs = require('fs');


const axios = require('axios');

class Busquedas {

    historial = [];

    dbPath = './db/database.json';
    constructor(){
        //TODO: leer DB si existe
        this.leerBD();
    }

    get paramsMapBox(){
        return {
            
                'access_token': process.env.MAPBOX_KEY,
                'limit': 5,
                'language': 'es'
            
        }
    }

    get historialCapitalizado(){

        //puede usarse loaddash u otro.

        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase()+ p.substring(1));

            return palabras.join(' ')
        });
    }

    get paramsOpenWeather(){
        return {
            
            'appid': process.env.OPEMWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }
    //servicio asuncrono para obtener el servicio http
    async ciudad(lugar = '') {
        //Peticion http
        try {
            
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox
            });

            const resp = await instance.get();

            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))
    
            
            
        } catch (error) {
            return [];    
        }
        // console.log('ciudad', lugar);
    }

    async climaLugar( lat, lon) {

        try {
            // instancia de axios.create()
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather,lat,lon }
            })
            // resp.data extraer la data de la respuesta

            const resp = await instance.get();
            const {weather, main} = resp.data
 

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial( lugar = '') {


        if( this.historial.includes( lugar.toLowerCase())){
            return;
        }

        this.historial = this.historial.splice(0,5);
        //TODO: prevenir duplicados
        this.historial.unshift(lugar.toLocaleLowerCase());

        //grabar en DB
        this.guardarDB();
    }
    
    guardarDB() {
        const payload = {
            historial: this.historial
        }
        fs.writeFileSync( this.dbPath, JSON.stringify(payload))
    }

    leerBD(){
        
        // verificar si existe
        if( !fs.existsSync(this.dbPath) ){
            return;
        }
         
        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse( info );
        
        this.historial = data.historial;
    }
    

}

module.exports = Busquedas;