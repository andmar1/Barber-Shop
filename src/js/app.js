let pagina = 1;  //Global para la paginacion

const cita = {
    nombre:'',
    fecha:'',
    hora:'',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function(){
    iniciarApp()
})

function iniciarApp(){
   
    mostrarServicios();

    //Resalta el div actual segun el tab que se presiona 
    mostrarSeccion();

    //Oculta o muestra una seccion segun el tab que se presiona 
    cambiarSeccion();

    // Paginacion siguiente y anterior
    paginaSiguiente();

    paginaAnterior();

    // Comprueba la pagina actual para ocultar o mostrar la paginacion 
    botonesPaginador();

    // Muestra el resumen de la cita o mensaje de error en caso de no pasar la validacion
    mostrarResumen();

    // Almacena el nombre de la cita en el objeto
    nombreCita();

    // Almacena la fecha de la cita en el objeto
    fechaCita();

    // Deshabilita dias pasados
    deshabilitarFechaAnterior();

    // Almacena la hora de la cita en el objeto
    horaCita();
}

function mostrarSeccion(){
    
    // Eliminar mostrar-seccion de la seccion anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if (seccionAnterior) {
            seccionAnterior.classList.remove('mostrar-seccion') 
    }

    const seccionActual = document.querySelector(`#paso-${pagina}`);  //seleccionar paso
    seccionActual.classList.add('mostrar-seccion');

    // eliminar la clase de actual en el tab anterior
    const tabAnterior = document.querySelector('.tabs .actual');
    if (tabAnterior) {
        tabAnterior.classList.remove('actual')
    }

    //Resalta el tab acutal de color azul
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion(){
    const enlaces = document.querySelectorAll('.tabs button');

    // como tenemos 3 elementos tenemos q iterar elemento por elemento
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', e =>{
            e.preventDefault();

            pagina = parseInt(e.target.dataset.paso);

            // Llamar la funcion de mostrarSeccion 
            mostrarSeccion();

            botonesPaginador();
        })
    })

}

async function mostrarServicios(){

    try {  
        const resultado = await fetch('./servicios.json')
        const db = await resultado.json()

        // const servicios = db.servicios   //sin destructuring
        const { servicios } = db;           //con destructuring
        
        // console.log(servicios)

        servicios.forEach( servicio => {
            const { id, nombre, precio} = servicio;

            //DOM scripting
            // generar nombre de servicio  
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio')
            
            // generar el precio del servicio  
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            // generar div contenedor de servicio
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;

            // selecciona un servicio para la cita 
            servicioDiv.onclick = seleccionarServicio;

            // inyectar precio y nombre de servicio al DIV servicio  
            servicioDiv.appendChild( nombreServicio )
            servicioDiv.appendChild( precioServicio )
            
            // inyectarlo en html por medio del id
            document.querySelector('#servicios').appendChild(servicioDiv);
        });

    } catch (error) {
        console.log(error)  //muestra el error 400
    }
}

function seleccionarServicio(e){
    let elemento;
    //Forzar que el elemento al cual le damos click sea el DIV y no las demas etiquetas
    if(e.target.tagName === 'P'){
        elemento = e.target.parentElement;
    }
    else{
        elemento = e.target;
    }
    // si el elemento ya contiene la clase seleccionado
    if (elemento.classList.contains('seleccionado')) {
        elemento.classList.remove('seleccionado');  //Si ya la tiene se la quitamos 

        const id = parseInt( elemento.dataset.idServicio);

        eliminarServicio( id );
    }else{
        elemento.classList.add('seleccionado');//si no tiene la clase seleccionado se la agrega

        // Creacion del objeto 
        const servicioObj ={
            id: parseInt( elemento.dataset.idServicio ),
            nombre: elemento.firstElementChild.textContent,   //acceder al primer elemento
            precio: elemento.firstElementChild.nextElementSibling.textContent //accede a segundo elemento
        }

        // console.log( servicioObj )
        agregarServicio( servicioObj );
    }

}

function eliminarServicio( id ){

    const { servicios } = cita;

    cita.servicios = servicios.filter( servicio => servicio.id !== id );
    console.log( cita )
}

function agregarServicio( servicioObj ){

    const { servicios } = cita;

    // esta sintaxis le agrega un nuevo servico al arreglo original
    cita.servicios = [...servicios, servicioObj]   //tomo una copia del arreglo "servicios" y agregamos nuevo objeto

    console.log(cita)
}   

function paginaSiguiente(){
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', ()=>{
        pagina++;
        // console.log( pagina )

        botonesPaginador();
    })
}

function paginaAnterior(){
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', ()=>{
        pagina--;
        // console.log( pagina )

        botonesPaginador();
    })       
}

function botonesPaginador(){
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');

    if (pagina === 1) {
        paginaAnterior.classList.add('ocultar');
    }
    else if(pagina === 3){
        paginaSiguiente.classList.add('ocultar')
        paginaAnterior.classList.remove('ocultar')  

        mostrarResumen();//Estamos en la pagina 3, carga el resumen de la cita

    }else{
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');

    }
    mostrarSeccion()   //Cambia la seccion que se muestra por la de la pagina
}

function mostrarResumen(){
    // Destructuring
    const { nombre, fecha, hora, servicios } = cita;

    // Seleccionar el resumen  
    const resumenDiv = document.querySelector('.contenido-resumen');

    // Limpia el html previo
    while ( resumenDiv.firstChild ) {
        resumenDiv.removeChild( resumenDiv.firstChild );
    }
    
    // Validacion del objeto
    if (Object.values( cita ).includes('')) {
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos del Servicios, hora, fecha o nombre';

        noServicios.classList.add('invalidar-cita');

        // agregar a resumen DIV  
        resumenDiv.appendChild(noServicios);
        
        return;
    }

    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita'

    // Mostrar el resumen  
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

    const serviciosCita = document.createElement('DIV');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios'
    serviciosCita.appendChild( headingServicios );

    // calcular total a pagar 
    let cantidad = 0;

    // Iterar sobre el arreglo de servicios  
    servicios.forEach(servicio =>{

        const { nombre, precio } = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio')

        // quitar signo de dolar de precio 
        const totalServicio = precio.split('$');
        // console.log( parseInt(totalServicio[1].trim()) )
        cantidad += parseInt(totalServicio[1].trim());
        
        // Colocar texto y precio en el DIV  
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
        
    });

    // Agregar al DIV  

    resumenDiv.appendChild( headingCita )
    resumenDiv.appendChild( nombreCita );
    resumenDiv.appendChild( fechaCita );
    resumenDiv.appendChild( horaCita );

    resumenDiv.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a Pagar: $</span> ${cantidad}`

    resumenDiv.appendChild( cantidadPagar );
}


function nombreCita(){
    const nombreInput = document.querySelector('#nombre');

    nombreInput.addEventListener('input', ( e )=>{
        const nombreTexto = e.target.value.trim();  //Trim elimina el espacio en blanco al inicio y al final, no los toma en cuenta 

        // Validacion de que nombre texto tiene que tener algo
        if ( nombreTexto === '' || nombreTexto.length < 3) {
                mostrarAlerta('Nombre no valido','error');
        }
        else{
            const alerta = document.querySelector('.alerta');
            if (alerta) {
                alerta.remove();
            }
            cita.nombre = nombreTexto;
        }
    })
}

function mostrarAlerta( mensaje, tipo ){

    //si hay una alerta previa, no crear otra
    const alertaPrevia = document.querySelector('.alerta');
    if (alertaPrevia) {
        return;   //Todo se deja de ejecutar con el return 
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if (tipo === 'error') {
        alerta.classList.add('error');
    }
    //Insertar en el HTML
    const formulario = document.querySelector('.formulario');
    formulario.appendChild( alerta );

    // Eliminar la alerta despues de 3 segundos
    setTimeout(() => {
        alerta.remove();
    }, 3000); 

}

function fechaCita(){
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('input', e =>{

        const dia = new Date(e.target.value).getUTCDay();

        // Verificar si es domingo o sabado
        if ([0, 6].includes(dia)) {
            e.preventDefault();
            fechaInput.value = ''; //Recetear el valor 
            mostrarAlerta('Fines de semana no son permitidos', 'error')
        }else{
            cita.fecha =  fechaInput.value;
            // console.log( cita )
        }
    })
}

function deshabilitarFechaAnterior(){
    const inputFecha = document.querySelector('#fecha');

    const fechaAhora = new Date();
    const year = fechaAhora.getFullYear();
    const mes = fechaAhora.getMonth()+1;
    const dia = fechaAhora.getDate()+1; //Si queremos las reservaciones el mismo dia quitar el +1

    // Formato deseado AAAA-MM-DD

    const fechaDeshabilitar = `${year}-${mes < 10 ? `0${mes}` : mes}-${dia}`

     inputFecha.min = fechaDeshabilitar;

    // valores que nos proporciona Date 
    // getFullYear() = año
    // getDate() = dia 
}

function horaCita(){
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', e =>{

        const horaCita = e.target.value;

        const hora = horaCita.split(':');

        if (hora[0] < 10 || hora[0]>18) {
            mostrarAlerta('Hora no valida','error');

            setTimeout(() => {
                inputHora.value = '';
            }, 3000);
        }
        else{
            cita.hora = horaCita;
            console.log( cita )
        }
    })
}