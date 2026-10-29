"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // Opcional: tu número con indicativo (ej. "573001234567").
    // Si lo dejas vacío, no se muestra el enlace de WhatsApp.
    const NUMERO_WHATSAPP = "573233149680";

    const $ = (id) => document.getElementById(id);
    const reducirMovimiento =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- Elementos ----------
    const musica = $("musica");
    const controlMusica = $("controlMusica");
    const iconoMusica = $("iconoMusica");
    const textoMusica = $("textoMusica");
    const estadoMusica = $("estadoMusica");
    const fondo = $("fondo");
    const encabezado = $("encabezado");
    const seccionSobre = $("seccionSobre");
    const sobre = $("sobre");
    const abrirSobre = $("abrirSobre");
    const carta = $("carta");
    const mostrarSecretos = $("mostrarSecretos");
    const secretos = $("secretos");
    const mensajeSecreto = $("mensajeSecreto");
    const progresoSecretos = $("progresoSecretos");
    const continuar = $("continuar");
    const pregunta = $("pregunta");
    const respuestaSi = $("respuestaSi");
    const respuestaFinal = $("respuestaFinal");
    const volverInicio = $("volverInicio");

    const requeridos = {
        musica, controlMusica, iconoMusica, textoMusica, fondo, encabezado,
        seccionSobre, sobre, abrirSobre, carta, mostrarSecretos, secretos,
        mensajeSecreto, progresoSecretos, continuar, pregunta, respuestaSi,
        respuestaFinal, volverInicio
    };
    const faltantes = Object.keys(requeridos).filter((k) => !requeridos[k]);
    if (faltantes.length) {
        console.error("Faltan estos ID en index.html:", faltantes.join(", "));
        return;
    }

    // ---------- Estado ----------
    let sobreAbierto = false;
    let cartaVisible = false;
    let musicaDisponible = true;

    const botonesSecretos = Array.from(document.querySelectorAll(".corazon-secreto"));
    const descubiertos = new Set();

    const textoSi = respuestaSi.textContent.trim();
    const textoInicialSecreto = mensajeSecreto.textContent.trim();

    // ---------- Música ----------
    musica.volume = 0.5;   // volumen suave al abrir el sobre
    function actualizarBotonMusica() {
        controlMusica.hidden = !musicaDisponible || !sobreAbierto;
        const sonando = !musica.paused;
        iconoMusica.textContent = sonando ? "❚❚" : "▶";
        textoMusica.textContent = sonando ? "Pausar música" : "Reproducir música";
    }

    function marcarMusicaNoDisponible() {
        musicaDisponible = false;
        actualizarBotonMusica();
        console.warn("No se pudo cargar audio/cancion.mp3.");
    }

    async function reproducirMusica() {
        if (!musicaDisponible) return;
        try {
            await musica.play();
        } catch (error) {
            // NotSupportedError = archivo ausente o formato inválido.
            if (error.name === "NotSupportedError") marcarMusicaNoDisponible();
        }
        actualizarBotonMusica();
    }

    // El evento "error" ocurre en <source>, no en <audio>.
    const fuente = musica.querySelector("source");
    if (fuente) fuente.addEventListener("error", marcarMusicaNoDisponible);
    musica.addEventListener("error", marcarMusicaNoDisponible);
    musica.addEventListener("play", actualizarBotonMusica);
    musica.addEventListener("pause", actualizarBotonMusica);

    controlMusica.addEventListener("click", () => {
        if (musica.paused) reproducirMusica();
        else musica.pause();
    });

    // ---------- Navegación entre secciones ----------
    function mostrarSeccion(elemento) {
        elemento.hidden = false;
        window.setTimeout(() => {
            elemento.scrollIntoView({
                behavior: reducirMovimiento ? "auto" : "smooth",
                block: "start"
            });
        }, 80);
    }

    function abrirCarta() {
        if (sobreAbierto) return;
        sobreAbierto = true;

        reproducirMusica();           // sin await: no frena la animación
        actualizarBotonMusica();

        sobre.classList.add("abierto");
        abrirSobre.disabled = true;
        abrirSobre.textContent = "Abriendo tu carta... 💌";
        crearExplosionCorazones();

        window.setTimeout(() => {
            encabezado.hidden = true;
            seccionSobre.hidden = true;
            cartaVisible = true;
            mostrarSeccion(carta);
        }, 850);
    }

    abrirSobre.addEventListener("click", abrirCarta);
    sobre.addEventListener("click", abrirCarta);
    sobre.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirCarta();
        }
    });

    mostrarSecretos.addEventListener("click", () => {
        if (!cartaVisible) return;
        carta.hidden = true;
        mostrarSeccion(secretos);
    });

    // ---------- Mensajes secretos ----------
    function actualizarProgreso() {
        const total = botonesSecretos.length;
        const hechos = descubiertos.size;

        continuar.disabled = total === 0 || hechos < total;
        progresoSecretos.textContent = hechos === total && total > 0
            ? `¡Descubriste todos los mensajes! (${total}/${total}) 💌`
            : `Has descubierto ${hechos} de ${total} mensajes ❤️`;
    }

    botonesSecretos.forEach((boton, indice) => {
        boton.setAttribute("aria-pressed", "false");
        boton.addEventListener("click", () => {
            descubiertos.add(indice);
            boton.classList.add("descubierto");
            boton.setAttribute("aria-pressed", "true");
            mensajeSecreto.textContent = boton.dataset.mensaje || "";
            crearCorazones(5);
            actualizarProgreso();
        });
    });

    continuar.addEventListener("click", () => {
        if (descubiertos.size < botonesSecretos.length) return;
        secretos.hidden = true;
        mostrarSeccion(pregunta);
        crearExplosionCorazones();
    });

    // ---------- Respuestas ----------
    function mostrarRespuesta(titulo, parrafos, destacado) {
        respuestaFinal.replaceChildren();

        const h3 = document.createElement("h3");
        h3.textContent = titulo;
        respuestaFinal.append(h3);

        parrafos.forEach((texto) => {
            const p = document.createElement("p");
            p.textContent = texto;
            respuestaFinal.append(p);
        });

        if (destacado) {
            const p = document.createElement("p");
            const fuerte = document.createElement("strong");
            fuerte.textContent = destacado;
            p.append(fuerte);
            respuestaFinal.append(p);
        }

        respuestaFinal.hidden = false;
        volverInicio.hidden = false;
        respuestaFinal.scrollIntoView({
            behavior: reducirMovimiento ? "auto" : "smooth",
            block: "center"
        });
    }

    respuestaSi.addEventListener("click", () => {
        mostrarRespuesta(
            "¡Me haces muy feliz! ❤️",
            [
                "Gracias por darme la oportunidad de construir algo bonito contigo, mi ingeniera.",
                "Quiero que lo nuestro esté lleno de cariño, confianza, respeto, risas y momentos que podamos recordar con una sonrisa."
            ],
            "Este puede ser el comienzo de una historia muy nuestra. 🌹"
        );

        if (NUMERO_WHATSAPP) {
            const enlace = document.createElement("a");
            enlace.className = "boton boton-secundario";
            enlace.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent("Sí, quiero ❤️")}`;
            enlace.target = "_blank";
            enlace.rel = "noopener";
            enlace.textContent = "Avísame por WhatsApp 💌";
            respuestaFinal.append(enlace);
        }

        respuestaSi.disabled = true;
        crearExplosionCorazones();
    });

    volverInicio.addEventListener("click", () => {
        sobreAbierto = false;
        cartaVisible = false;
        descubiertos.clear();

        [carta, secretos, pregunta, respuestaFinal, volverInicio]
            .forEach((el) => { el.hidden = true; });

        respuestaSi.disabled = false;
        respuestaSi.textContent = textoSi;

        botonesSecretos.forEach((b) => {
            b.classList.remove("descubierto");
            b.setAttribute("aria-pressed", "false");
        });
        mensajeSecreto.textContent = textoInicialSecreto;

        sobre.classList.remove("abierto");
        abrirSobre.disabled = false;
        abrirSobre.textContent = "Abrir mi carta ❤️";

        encabezado.hidden = false;
        actualizarProgreso();
        actualizarBotonMusica();
        mostrarSeccion(seccionSobre);   // la música sigue sonando
    });

    // ---------- Corazones y pétalos ----------
    const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];

    function crearParticula(tipo = "corazon") {
        if (reducirMovimiento) return;

        const p = document.createElement("span");

        if (tipo === "petalo") {
            p.className = "petalo";
        } else {
            p.className = tipo === "estrella" ? "particula" : "corazon-flotante";
            p.textContent = elegir(tipo === "estrella" ? ["✦", "✧", "♡"] : ["♥", "♡", "❤"]);
            p.style.fontSize = `${15 + Math.random() * 20}px`;
        }

        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDuration = `${6 + Math.random() * 7}s`;
        p.style.animationDelay = `${Math.random() * 1.5}s`;

        fondo.append(p);
        p.addEventListener("animationend", () => p.remove(), { once: true });
    }

    function crearCorazones(cantidad = 8) {
        for (let i = 0; i < cantidad; i++) {
            crearParticula(Math.random() > 0.75 ? "petalo" : "corazon");
        }
    }

    function crearExplosionCorazones() {
        for (let i = 0; i < 22; i++) {
            crearParticula(Math.random() > 0.65 ? "estrella" : "corazon");
        }
    }

    window.setInterval(() => {
        if (!document.hidden && fondo.childElementCount < 35) {
            crearParticula(Math.random() > 0.8 ? "petalo" : "corazon");
        }
    }, 850);

    // ---------- Estado inicial ----------
    [carta, secretos, pregunta, respuestaFinal, volverInicio]
        .forEach((el) => { el.hidden = true; });
    actualizarProgreso();
    actualizarBotonMusica();
});