// --- SCRIPT.JS COMPLETO Y CORREGIDO (VERSIÓN FINAL) ---
// Contiene: Lógica del Chat con IA, Registro en Make.com y Lógica del Formulario de Pasos.
document.addEventListener('DOMContentLoaded', function() {

    // ==================================================================
    // == LÓGICA DEL CHAT - GEMINI + REGISTRO EN MAKE.COM ==
    // ==================================================================
    
    // --- CONFIGURACIÓN ---
    // ¡¡¡ ATENCIÓN 1/2 !!! Pega aquí tu Clave de API de Google.
    const GOOGLE_API_KEY = 'AIzaSyCoSJrU2POi_8pFHzgro5XlCIIPsa1lt5M';
    const AI_MODEL = 'gemini-1.5-flash.
*   La lógica para que **JavaScript construya el historial del chat completo**, quitándole esa carga a la IA.
*   La corrección del **scroll** en el chat.
*   La solución para **evitar mensajes duplicados**.
*   El arreglo para que los datos lleguen **correctamente separados** a Make.com (sin `no-cors`).

---

### **Descarga el Archivo `script.js` Completo**

Haz clic en el siguiente enlace para descargar el archivo `script.js` final.

[**➡️ Descargar script.js ⬅️**](data:text/javascript;charset=utf-8,%2F%2F%20---%20SCRIPT.JS%20FINAL%20Y%20CORREGIDO%20---%0A%2F%2F%20---%20COMPLETO%20CON%20IA%2C%20REGISTRO%20EN%20MAKE.COM%20Y%20L%C3%93GICA%20DE%20FORMULARIO%20---%0A%0Adocument.addEventListener('DOMContentLoaded'%2C%20function()%20%7B%0A%0A%20%20%20%20%2F%2F%20%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%0A%20%20%20%20%2F%2F%20%3D%3D%20L%C3%93GICA%20DEL%20CHAT%20-%20DIRECTO%20A%20GEMINI%20%2B%20REGISTRO%20EN%20MAKE.COM%20%3D%3D%0A%20%20%20%20%2F%2F%20%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%-latest';
    // ¡¡¡ ATENCIÓN 2/2 !!! Pega aquí la URL del webhook de Make.com.
    const makeWebhookLoggerUrl = 'PEGA_AQUI_TU_NUEVA_URL_DE_WEBHOOK_DE_MAKE';

    // --- ELEMENTOS DEL DOM ---
    const chatWidget = document.getElementById('chat-widget');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const assistantButtonChat = document.getElementById('btn-assistant-header');

    // --- ESTADO DE LA CONVERSACIÓN (PROMPT FINAL Y OPTIMIZADO) ---
    let conversationHistory = [
        { role: "user", parts: [{ text: `
          REGLAS ESTRICTAS DEL SISTEMA:
          1.  **Rol y Tono:** Eres "Alex", un asistente profesional de "Autopartes Express Cuenca".
          2.  **Misión Principal:** Tu único objetivo es recopilar 5 datos obligatorios (Marca, Modelo, Año, Repuesto, Teléfono) y 3 datos opcionales (Nombre, Ciudad, Provincia) si el cliente los menciona.
          3.  **REGLA DE ORO - ACCIÓN FINAL:**
              - **CUANDO TENGAS LOS 5 DATOS OBLIGATORIOS**, tu siguiente y ÚLTIMA respuesta debe ser NADA MÁS QUE EL OBJETO JSON.
              - **NO ESCRIBAS NADA ANTES NI DESPUÉS DEL JSON.** Tu respuesta debe empezar con "{" y terminar con "}".
              - **Rellena los campos del JSON así:**
                  - Para 'nombre_cliente', 'ciudad', y 'provincia', extrae la información si el cliente la dio. Si no, pon el texto "No proporcionado".
              - **La estructura del JSON debe ser EXACTAMENTE esta:**
                {
                  "accion": "registrar_cotizacion",
                  "datos": {
                    "nombre_cliente": "El nombre extraído o 'No proporcionado'",
                    "contacto_cliente": "El teléfono recopilado",
                    "marca_vehiculo": "La marca recopilada",
                    "modelo_vehiculo": "El modelo recopilado",
                    "año_vehiculo": "El año recopilado",
                    "repuesto_solicitado": "La pieza que el cliente necesita",
                    "numero_de_parte": "El número si lo dieron, o 'No proporcionado'",
                    "ciudad": "La ciudad si la dieron, o 'No proporcionado'",
                    "provincia": "La provincia si la dieron, o 'No proporcionado'",
                    "resumen_chat": "Un resumen muy breve y profesional de la solicitud."
                  }
                }
              - **IMPORTANTE:** El sistema se encargará de añadir el historial completo del chat. Tú NO necesitas incluir un campo "texto_chat_completo".
        `}]},
        { role: "model", parts: [{ text: "Entendido. Soy Alex. Para iniciar su cotización, por favor, indíqueme la marca, modelo y año de su vehículo, y el repuesto que necesita." }]}
    ];

    // --- FUNCIONES DEL CHAT ---
    function addMessage(sender, text, isThinking = false) {
        if (!chatMessages) return;
        const existingThinkingMessage = document.getElementById('thinking-message');
        if (existingThinkingMessage) existingThinkingMessage.remove();
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        if (isThinking) {
            messageElement.innerHTML = '<span class="thinking-dots"><span>.</span><span>.</span><span>.</span></span>';
            messageElement.id = 'thinking3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%0A%20%20%20%20%0A%20%20%20%20%2F%2F%20---%20CONFIGURACI%C3%93N%20---%0A%20%20%20%20%2F%2F%20%C2%A1%C2%A1%C2%A1%20ATENCI%C3%93N%201%2F2%20!!!%20Pega%20aqu%C3%AD%20tu%20Clave%20de%20API%20de%20Google.%0A%20%20%20%20const%20GOOGLE_API_KEY%20%3D%20'AIzaSyCoSJrU2POi_8pFHzgro5XlCIIPsa1lt5M'%3B%0A%20%20%20%20const%20AI_MODEL%20%3D%20'gemini-1.5-flash-latest'%3B%0A%20%20%20%20%2F%2F%20%C2%A1%C2%A1%C2%A1%20ATENCI%C3%93N%202%2F2%20!!!%20Pega%20aqu%C3%AD%20la%20NUEVA%20URL%20del%20webhook%20de%2-message';
        } else {
            messageElement.textContent = text;
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    }

    function typeMessage(sender, text) {
        const messageElement = addMessage(sender, '');
        let i = 0;
        const speed = 30;
        function type() {
            if (i < text.length) {
                messageElement.textContent += text.charAt(i);
                i++;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                setTimeout(type, speed);
            }
        }
        type();
    }
    
    async function handleSendMessage() {
        if (!chatInput || chatInput.value.trim() === '' || chatSendBtn.disabled) return;
        if (GOOGLE_API_KEY === 'PEGA_AQUI_TU_CLAVE_DE_API_RESTRINGIDA' || GOOGLE_API_KEY.includes('8pFHzgro5XlCIIPsa1lt5M')) {
            addMessage('assistant', 'Error: La clave de API de Google no ha sido configurada.');
            return;
        }
        const messageText = chatInput.value.trim();
        addMessage('user', messageText);
        conversationHistory.push({ role: 'user', parts: [{ text: messageText }] });
        chatInput.value = '';
        chatSendBtn.disabled = true;
        
        addMessage('assistant', '', true);
        
        setTimeout(async () => {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: conversationHistory }),
                });
                
                const existingThinkingMessage = document.getElementById('thinking-message');
                if (existingThinkingMessage) existingThinkingMessage.remove();

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error ${response.status}: ${errorData.error.message}`);
                }

                const data = await response.json();
                if (!data.candidates || data.candidates.length === 0) {
                    throw new Error("La respuesta de la API no contiene candidatos.");
                }
                const aiResponseText = data.candidates[0].content.0Make.com%20para%20registrar%20los%20datos.%0A%20%20%20%20const%20makeWebhookLoggerUrl%20%3D%20'PEGA_AQUI_TU_NUEVA_URL_DE_WEBHOOK_DE_MAKE'%3B%0A%0A%20%20%20%20%2F%2F%20---%20ELEMENTOS%20DEL%20DOM%20---%0A%20%20%20%20const%20chatWidget%20%3D%20document.getElementById('chat-widget')%3B%0A%20%20%20%20const%20chatCloseBtn%20%3D%20document.getElementById('chat-close-btn')%3B%0A%20%20%20%20const%20chatMessages%20%3D%20document.getElementById('chat-messages')%3B%0A%20%20%20%20const%20chatInput%20%3D%20document.getElementById('chat-input')%3B%0A%20%20%20%20const%20chatSendBtn%20%3parts[0].text;
                
                try {
                    const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const jsonString = jsonMatch[0];
                        const responseObject = JSON.parse(jsonString);

                        if (responseObject.accion === 'registrar_cotizacion' && responseObject.datos) {
                            const confirmationMessage = "Excelente. He registrado su solicitud. Un experto le enviará la cotización a su número en breve.";
                            conversationHistory.push({ role: 'model', parts: [{ text: confirmationMessage }] });
                            typeMessage('assistant', confirmationMessage);
                            await logDataToMake(responseObject.datos, conversationHistory); // Le pasamos el historial
                            D%20document.getElementById('chat-send-btn')%3B%0A%20%20%20%20const%20assistantButtonChat%20%3D%20document.getElementById('btn-assistant-header')%3B%0A%0A%20%20%20%20%2F%2F%20---%20ESTADO%20DE%20LA%20CONVERSACI%C3%93N%20(PROMPT%20FINAL%20Y%20CORREGIDO)%20---%0A%20return; 
                        }
                    }
                } catch (e) {
                    console.warn("Se intentó procesar un JSON pero falló:", e);
                }
                
                conversationHistory.push({ role: 'model', parts: [{ text: aiResponseText }] });
                typeMessage('assistant', aiResponseText);

            } catch (error) {
                console.error('Error crítico al llamar a la API de Gemini:', error);
                const existingThinkingMessage = document.getElementById('thinking-message');
                if (existing%20%20%20let%20conversationHistory%20%3D%20%5B%0A%20%20%20%20%20%20%20ThinkingMessage) existingThinkingMessage.remove();
                typeMessage('assistant', 'Lo siento, no puedo responder en este momento. Hubo un problema de conexión.');
            } finally {
                chatSendBtn.disabled = false;
                if(chatInput) chatInput.focus();
            }
        }, 1200);
    }

    async function logDataToMake(data, fullConversationHistory) {
        if (!makeWebhookLoggerUrl || makeWebhookLoggerUrl === 'PEGA_AQUI_TU_NUEVA_URL%20%7B%20role%3A%20%22user%22%2C%20parts%3A%20%5B%7B%20text%3A%20%60%0A%20%20%20%20%20%_DE_WEBHOOK_DE_MAKE') {
            console.error("URL del webhook de registro de Make.com no configurada.");
            return;
        }
        try {
            const chatText = full20%20%20%20%20REGLAS%20ESTRICTAS%20DEL%20SISTEMA%3A%0A%20%20%20ConversationHistory
                .filter(msg => !(msg.role === 'user' && msg.parts[0].text.%20%20%20%20%20%20%201.%20%20**Rol%20y%20Tono%3A**%20Eres%20%22Alex%22%2C%20un%20asistente%20includes('REGLAS ESTRICTAS DEL SISTEMA')))
                .map(msg => {
                    const prefix = msg.role === 'user' ? 'Cliente:' : 'Alex:';
                    return `${prefix} ${msg.parts[profesional%20de%20%22Autopartes%20Express%20Cuenca%22.%0A%20%20%20%20%20%0].text}`;
                })
                .join('\n');

            const now = new Date();
            const fullData20%20%20%20%202.%20%20**Misi%C3 = { 
                ...data, 
                texto_chat_completo: chatText,
                fecha: now%B3n%20Principal%3A**%20Tu%20%C3%BAnico%20objetivo%20es%20recopilar%205%20datos.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' }), 
                hora: now.toLocaleTimeString('es-EC', { timeZone: 'America/Guayaquil' }) 
            };

            await fetch(makeWebhookLoggerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullData)
            %20obligatorios%20(Marca%2C%20Modelo%2C%20A});
            console.log("Datos enviados a Make.com para registro.");
        } catch (error) {
            console.error("Error al enviar datos de registro a Make.com:", error);
        }
    }

    let chatListenersAdded = false;
    function addChatListeners() {
        if (chatListenersAdded || !chatSendBtn || !chatInput) return;
        chatSendBtn.addEventListener('click', handleSendMessage);
        chat%C3%B1o%2C%20Repuesto%2C%20Tel%C3%A9fono)%20y%203%20datos%20opcionales%20(Nombre%2C%20Ciudad%2C%20Provincia)%20si%20el%20cliente%20los%20menciona.%0A%20%20%Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
            }
        });
        chatListenersAdded = true;
    }

    if (assistantButtonChat) {
        assistantButtonChat.addEventListener('click', () => {
            if (!chatWidget) return;
            chatWidget.classList.remove('hidden');
            if (20%20%20%20%20%20%20%203.%20%20**REGLA%20DE%20ORO%20-%20ACCI%C3%93N%20FINAL%3A**%0A%20%20%20%20%20%20%20%20%20%chatMessages && chatMessages.children.length === 0) {
                 // El mensaje inicial ahora lo pone el propio historial de la IA.
                 typeMessage('assistant', conversationHistory[1].parts[0].text);
            }
20%20%20%20%20-%20**CUANDO%20TENGAS%20LOS%205%20DATOS%20OBLIGATORIOS**%2C%20tu%20siguiente%20y%20%C3%9ALTIMA%            addChatListeners();
            if(chatInput) chatInput.focus();
        });
    }

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => {
            if20respuesta%20debe%20ser%20NADA%20M%C3%81S%20QUE%20EL%20OBJETO%20JSON.%0A%20%20%20%20%20%20%20%20 (chatWidget) chatWidget.classList.add('hidden');
        });
    }

    // ==================================================================
    // == LÓGICA DEL FORMULARIO DE VARIOS PASOS (CÓDIGO ORIGINAL%20%20%20%20%20%20-%20**NO%20ESC COMPLETO) ==
    // ==================================================================
    const form = document.getElementById('sparePartsForm');
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps =RIBAS%20NADA%20ANTES%20NI%20DESPU%C3%89S%20DEL%20JSON.**%20Tu%20respuesta%20debe%20empezar%20con%20%22%7B%22%20y%20terminar%20con%20%22%7D%22 document.querySelectorAll('.progress-step');
    const marcaInput = document.getElementById('marca');
    const modelo.%0A%20%20%20%20%20%20%20Select = document.getElementById('modelo');
    const anioSelect = document.getElementById('anio');
    const logosContainer = document.getElementById('logos-container');
    const otroMarcaContainer = document.getElementById('otra-%20%20%20%20%20%20%20-%20marca-container');
    const otroModeloContainer = document.getElementById('otro-modelo-container');
    const otroAnioContainer = document.getElementById('otro-anio-container');
    const otraMarcaInput = document.getElementById('otra-marca');
    const otroModeloInput = document.getElementById('otro-modelo');
    const otroAnioInput = document.getElementById('otro-anio');
    const brandDisplay = document.getElementById('selected**Rellena%20los%20campos%20del%20JSON%20as%C3%AD%3A**%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20-%20Para%20%60nombre_cliente%60%2C%20%60ciudad%60%2C%2-brand-display');
    const brandDisplayLogoContainer = document.querySelector('.display-logo-container');
    const brandDisplayLogo = document.getElementById('selected-brand-display-logo');
    const brandDisplayName = document.getElementById('selected-brand-name');
    const displayModelo = document.getElementById('display-modelo');
    0y%20%60provincia%60%2C%20extrae%20la%20informaci%C3%B3n%20si%20el%20cliente%20la%20dio.%20Si%20no%2C%20pon%20el%20texto%20%22No%20proporcionado%22.%0A%20%20%20%20%20%20%20const displayAnio = document.getElementById('display-anio');
    const displayVin = document.getElementById('display-vin');
    const displayNombre = document.getElementById('display-nombre');
    const displayTelefono = document.getElementById('display-telefono');
    const displayDescripcion = document.getElementById('display-descripcion');
    const descripcionTextarea = document.getElementById('descripcion');
    const vinInput = document.getElementById('vin');
    const nombreInput = document.getElementById('nombre');
    const telefonoInput = document.getElementById('telefono');
    const sendPrompt = document.getElementById('send-prompt');
    const bgVideo = document.getElementById('bg-%20%20%20%20%20%20%20-%20**La%20estructura%20del%20JSON%20debe%20ser%20EXACTAMENTE%20esta%3A**%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2video');
    const validationPopup = document.getElementById('validation-popup');
    const errorList = document.getElementById('error-list');
    const imageRefButton = document.getElementById('image-ref-button');
    let currentStep = 0;
    let popupTimeout;
    const marcasPopulares = ["Chevrolet", "Kia", "Toyota", "Hyundai", "Suzuki", "Renault", "Great Wall", "Mazda", "Nissan", "Ford", "Volkswagen", "Mitsubishi"];
    const marcasFullList = { "Chevrolet": ["Onix", "Onix RS", "Onix Turbo Sedán", "Joy HB", "Joy Sedán", "Aveo", "0%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22accion%22%3A%20%22registrar_cotizacion%22%2C%0A%20%20%20%20%20%20%Spark GT", "Spark Life", "Beat", "Sail", "Cavalier", "Cruze", "Bolt", "Bolt-EUV", "Groove", "Tracker", "Captiva", "Captiva XL", "Equinox-EV", "Blazer-RS-EV", "Tahoe", "Trailblazer", "Montana", "D-Max (varias gen.)", "Colorado", "Silverado", "Blazer (hist.)", "Trooper", "L20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22datos%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20UV", "Luv-D-Max", "Rodeo", "Gemini", "Corsa", "Esteem", "Forsa", "Vitara (3 puertas)", "Vitara (5 puertas)", "Grand Vitara", "Blue-Bird", "chasis MR-buses"], "Kia": ["Picanto", "Rio", "Rio-5", "Soluto", "Cerato", "K3", "Carens", "Carnival", "Stonic",%20%20%20%20%20%20%22nombre_cliente%22%3A%20%22El%20nombre%20extra%C3%ADdo%20o%20'No%20proporcionado'%22%2C%0A%20%20%20%20%20%20%20 "Stonic Hybrid", "Seltos", "Sonet", "Sportage", "Sorento", "Niro", "Niro-EV", "EV6", "EV5", "EV9", "Soul-EV"], "Toyota": ["Agya", "Yaris", "Yaris Sport", "Yaris Cross", "Corolla%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22contacto_cliente%22%3A%20%22El%20tel%C3%A9fono%20recopilado%22%2C%0", "Corolla Híbrido", "Corolla Cross Híbrido", "C-HR", "Raize", "RAV4", "Rush", "Prius", "Prius-C", "Innova", "Hilux", "Tacoma", "Fortuner", "Land Cruiser Prado", "Land Cruiser 200", "Land Cruiser 300", "4Runner", "FJ Cruiser", "Starlet", "Tercel", "Celica"], "Hyundai": ["AccentA%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2", "Grand i10", "Elantra", "Sonata", "Venue", "Kona", "Kona Hybrid", "Tucson", "Santa Fe", "Creta", "Staria"], "Chery": ["QQ3", "QQ6", "Nice-A1", "Van-Pass", "XCross", "Arrizo-0%22marca_vehiculo%22%3A%20%22La%20marca%20recopilada%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%3", "Arrizo-5", "Tiggo", "Tiggo-2", "Tiggo-2 Pro", "Tiggo-3", "Tiggo-4", "Tiggo-20%20%20%20%20%20%20%20%20%20%20%20%20%22modelo_vehiculo%22%3A%20%22El%20modelo%20recopilado%225", "Tiggo-7", "Tiggo-7 Pro", "Tiggo-8", "Tiggo-8 Pro"], "Suzuki": ["Swift", "Baleno", "Celerio", "Ignis", "Vitara", "Grand Vitara", "Jimny", "XL7", "Ertiga%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20", "S-Cross", "SX4"], "Renault": ["Kwid", "Sandero", "Logan", "Stepway", "Duster", "Captur", "Koleos", "Oroch", "Kangoo", "Symbol", "Meg%20%20%20%20%20%20%20%20%20%20%22a%C3%B1o_vehiculo%22%3Aane", "Fluence"], "Great Wall": ["Wingle-1", "Wingle-2", "Wingle-3", "Poer", "Haval H2", "Haval H6", "Haval H%20%22El%20a%C3%B1o%20recopilado%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%29", "Haval Jolion", "Haval F7", "M4", "ORA Good-Cat", "Tank-300"], "JAC": ["J2", "J4", "J5", "S2", "S3", "S5", "S7", "T40", "T600%20%20%20%20%20%20%20%20%20%20%20%22repuesto_solicitado%22%3A%20%22La%20pieza%20que%20el%20cliente", "V7", "HFC-1037"], "DFSK": ["Glory-500", "Glory-560", "Glory-580", "F5", "Mini Truck", "C31", "C52", "EC35", "K05", "K07"], "Volkswagen%20necesita%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20": ["Gol", "Escarabajo (Tipo-1)", "Voyage", "Polo", "Virtus", "T-Cross", "Tiguan", "Taigo", "Jetta", "Passat", "Amarok"], "Nissan": ["March", "Versa", "Sentra", "Kicks", "X-Trail", "%20%20%20%20%20%22numero_de_parte%22%3A%20%22El%20n%C3%BAmero%20si%20lo%20dieron%2C%20o%20'No%2Frontier", "NV350", "Pathfinder", "Note", "Micra"], "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-9", "CX-50", "CX-90", "BT-500proporcionado'%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20"], "Dongfeng": ["Rich-6", "Rich-7", "Rich-12", "S30", "Husky", "EQ2030", "EQ2050", "580", "58%20%20%20%20%20%20%20%20%20%20%20%20%22ciudad%22%3A%20%22La%20ciudad%20si%20la%20dieron%2C0 Pro", "mini-van Q30"], "Sinotruk": ["Howo-7", "Howo-9", "A7", "G7", "T5G", "ZZ1257",%20o%20'No%20proporcionado'%22%2C%0A%20%20%20%20%20%20%20%20 "ZZ1325", "ZZ1507", "ZZ3317", "ZZ4251"], "Jetour": ["X70", "X90", "X95", "T1", "T5", "T8", "Dasheng", "Cruiser", "XC", "Cool%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22provincia%22%3A%20%22La%20provincia%er"], "Ford": ["Fiesta", "EcoSport", "Ranger", "Explorer", "Mustang", "Transit", "Everest", "Bronco", "F-150", "Edge"], "Changan": ["CS35", "CS55", "CS75", "CS85", "Alsvin", "20si%20la%20dieron%2C%20o%20'No%20proporcionado'%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20UNI-T", "Eado", "Eado Xt", "Benni", "CS15"], "BYD": ["Atto-3", "Dolphin", "Seal", "Song-Plus", "Tang", "Yuan-EV", "Qin", "e1", "e2", "Han"], "Subaru": ["Impreza", "%20%20%20%20%20%22resumen_chat%22%3A%20%22Un%20resumen%20muy%20breve%20y%20profesional%20de%20la%20solicitudXV", "Forester", "Outback", "WRX", "Crosstrek", "Legacy", "BRZ", "Solterra", "Ascent"], "Citroen": ["C3", "C3 A.%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20ircross", "C4", "C5 Aircross", "Berlingo", "C-Elysée", "C4 Cactus", "Spacetourer", "Jumpy", "Jumper"], "Fiat": ["500", "Panda", "Punto", "Tipo", "Toro", "Strada", "Ar%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20go", "Uno", "Ducato", "Fiorino"], "Jeep": ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator", "Avenger", "Commander", "Wagoneer", "Patriot"], "Honda": ["Fit", "City", "Civic", "Accord", "CR%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20-%20**IMPORTANTE-V", "HR-V", "Pilot", "BR-V", "Ridgeline", "Insight"], "BMW": ["Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "%3A**%20El%20sistema%20se%20encargar%C3%A1%20de%20a%C3%B1adir%20el%20historial%20completo%20del%20chat.%20T%C3%BA%20NOSerie 7", "X1", "X3", "X5", "Z4"], "Audi": ["A3", "A4", "A6", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT"], "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "%20necesitas%20incluir%20un%20campo%20%22texto_chat_completo%22.%0A%20%20%20%20%20%20%20%20%60%7D%5D%2GLE", "GLS", "CLA", "G-Class"], "Porsche": ["911", "Cayman", "0%7D%2C%0A%20%20%20%20%20%20%20%20%7B%20role%3A%20%22model%22%2C%20parts%3A%20%5B%7Boxster", "Macan", "Cayenne", "Taycan", "Panamera", "718", "924", "928"] };
    const marcasOtras = Object.keys(marcasB%20text%3A%20%22Entendido.%20Soy%20Alex.%20Para%20iniciar%20su%20cotizaci%C3%B3FullList).filter(m => !marcasPopulares.includes(m));
    const marcasOrdenadas = [...marcasPopulares, ...marcasOtras];
    const updateImageButtonVisibility = () => { if (!marcaInput || !modeloSelect || !anioSelect || !imageRefButton) return; const brand = marcaInput.value; const model = (modeloSelect.value === 'Otro') ? otroModeloInput.value : modeloSelect.n%2C%20por%20favor%2C%20ind%C3%ADqueme%20la%20marca%2C%20modelo%20y%20a%C3%B1o%20de%20su%20veh%C3%ADculovalue; const year = (anioSelect.value === 'Otro') ? otroAnioInput.value : anioSelect.value; if (brand && model && year && brand !== 'Otro' && model !== '' && year !== '') { imageRefButton.classList.add('visible'); } else { imageRefButton.classList.remove('visible'); } };%2C%20y%20el%20repuesto%20que%20necesita.%22%20%7D%5D%20%7D%0A%20%20%20%20%5D%3B%0A%0A%20%20%20%20%2F%2F%20---%20
    const updateFormSteps = () => { if (!formSteps || !progressSteps || !form) return; formSteps.forEach((s, i) => s.classList.toggle('active', i === currentStep)); progressSteps.forEach((s, i) => s.classList.toggle('active', i <= currentStep)); form.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    const checkAllFields = () => { ifFUNCIONES%20DEL%20CHAT%20---%0A%20%20%20%20function%20addMessage(sender%2C%20text%2C%20isThinking%20%3D%20false)%20%7B%0A%20%20%20%20%20%20%20%20if%20( (!form || !sendPrompt) return; let allValid = true; form.querySelectorAll('[required]:not([type=hidden])').forEach(input => { let container = input.closest('.otro-input-container'); if (!container || container.style.display === 'block') { if (!input.value) allValid = false; } }); sendPrompt.style.display = allValid ? 'block' : 'none'; };
    const validateStep = (stepIndex) => { if (!formSteps || !formSteps[stepIndex]) return true; let errors = []; form!chatMessages)%20return%3B%0A%20%20%20%20%20%20%20%20const%20existingThinkingMessage%20%3D%20document.getElementById('thinking-message')%3B%0A%20%20%20%2Steps[stepIndex].querySelectorAll('[required]').forEach(input => { let fieldLabel = document.querySelector(`label[for='${input.id}']`); if (input.offsetWidth > 0 || input.type === 'hidden') { const container = input.closest('.otro-input-container'); if (!container || container.style.display === 'block')0%20%20%20%20if%20(existingThinkingMessage)%20existingThinkingMessage.remove()%3B%0A%20%20%20%20%20%20%20%20const%20messageElement%20%3D%20document.createElement('div')% { if (!input.value) { errors.push(fieldLabel ? fieldLabel.textContent.replace(/:/g, '') : 'Campo requerido'); } } } }); if (errors.length > 0) { if (errorList && validationPopup) { errorList.innerHTML = ''; errors.forEach(err => { const li = document.createElement('3B%0A%20%20%20%20%20%20%20%20messageElement.classList.add('chat-message'%2C%20%60%24%7Bsender%7D-message%60)%3B%0A%20%2li'); li.textContent = `• ${err}`; errorList.appendChild(li); }); validationPopup.classList.add('show'); clearTimeout(popupTimeout); popupTimeout = setTimeout(() => { validationPopup.classList.remove('show');0%20%20%20%20%20%20if%20(isThinking)%20%7B%0A%20%20%20%20% }, 4000); } return false; } return true; };
    const populateAnios = () => { if (!anioSelect) return; anioSelect.innerHTML = '<option value="">Selecciona el año</option>'; for (let y = new Date().getFullYear() + 1; y >= 1990; y--) anioSelect20%20%20%20%20%20%20%20messageElement.innerHTML%20%3D%20'%3Cspan%20class%3D%.add(new Option(y, y)); anioSelect.add(new Option("Otro", "Otro"));22thinking-dots%22%3E%3Cspan%3E.%3C%2Fspan% };
    const updateLiveData = (field, value) => { const displayElement = document.getElementById(`display-${field}`);3E%3Cspan%3E.%3C%2Fspan%3E%3Cspan% if (!displayElement) return; const span = displayElement.querySelector('span'); if (value) { span.textContent = value; displayElement.style.display = 'block'; } else { displayElement.style.display = 'none3E.%3C%2Fspan%3E%3C%2Fspan%3E'%3B%0A%20%20%20%20%20%20%20%2'; } checkAllFields(); };
    const handleMarcaSelection = (marca, wrapper) => { if (!brand0%20%20%20%20messageElement.id%20%3D%20'thinking-message'%3B%0A%20%20%20%20Display || !modeloSelect || !anioSelect || !otroMarcaContainer || !otroModeloContainer) return; brandDisplay.classList.add('visible'); const logoSrc = wrapper.querySelector('img')?.src || 'images/logos/otra.png%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%2'; brandDisplayLogo.src = logoSrc; brandDisplayName.textContent = marca; modeloSelect.innerHTML = '<option value="">Selecciona un modelo</option>'; anioSelect.innerHTML = '<option value="">Primero selecciona un modelo</option>';0%20%20%20%20messageElement.textContent%20%3D%20text%3B%0A%20%20%20%20%20 anioSelect.disabled = true; otroMarcaContainer.style.display = 'none'; otraMarcaInput.required = false; otroModeloContainer.style.display = 'none'; otroModeloInput.required = false; wrapper.style.setProperty%20%20%20%7D%0A%20%20%20%20%20%20%20%20chatMessages.appendChild(messageElement)%3('--logo-glow-url', `url(${logoSrc})`); brandDisplayLogoContainer.style.setProperty('--logo-glow-url-display', `url(${logoSrc})`); updateLiveData('modelo', ''); updateLiveData('anio', ''); updateB%0A%20%20%20%20%20%20%20%20chatMessages.scrollTop%20%3D%20chatMessages.scrollHeight%3BImageButtonVisibility(); if (marca === "Otro") { marcaInput.value = "Otro"; anioSelect.disabled = false; populateAnios(); modeloSelect.disabled = false; modeloSelect.innerHTML = '<option value="%0A%20%20%20%20%20%20%20%20return%20messageElement%3B%0A%20%20%20Otro" selected>Otro (Especifique)</option>'; otroMarcaContainer.style.display = 'block'; otraMarcaInput.required = true; otroModeloContainer.style.display = 'block'; otroModeloInput.required =%20%7D%0A%0A%20%20%20%20function%20typeMessage(sender%2C%20text)%20%7B%0A true; } else { marcaInput.value = marca; if (marcasFullList[marca]) { marcasFullList[marca].forEach(modelo => modeloSelect.add(new Option(modelo, modelo))); } modeloSelect.%20%20%20%20%20%20%20%20const%20messageElement%20%3D%20addMessage(sender%2C%20'')add(new Option("Otro", "Otro")); modeloSelect.disabled = false; } checkAllFields(); setTimeout(() => { if (modeloSelect) modeloSelect.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, %3B%0A%20%20%20%20%20%20%20%20let%20i%20%3D%200%3B100); };
    const populateLogos = () => {
        if (!logosContainer) {
            console.error("Error: El contenedor de logos no fue encontrado.");
            return;
        }
        %0A%20%20%20%20%20%20%20marcasOrdenadas.forEach(marca => {
            const wrapper = document.createElement('div');
            wrapper.className = 'logo-wrapper';
            const img = document.createElement('img');
            const span = document.createElement%20const%20speed%20%3D%2030%3B%0A%20%20%20%20%20%20%20%20function%20type()%20%7B%0A%20%20%20%20('span');
            const fileName = marca.toLowerCase().replace(/[\s-.'&]/g, '');
            img.src = `images/logos/${fileName}.png`;
            img.alt = marca;
            %20%20%20%20%20%20%20%20if%20(i%20%3C%20text.length)%20%7B%0A%20%20%20%20%20%20%20img.onerror = () => { img.style.display = 'none'; span.style.marginTop = '20px'; }; // Ocultar si no carga
            wrapper.appendChild(img);
            span.textContent = marca;
            wrapper.appendChild(span);
            logosContainer.appendChild(wrapper);
            wrapper.%20%20%20%20%20%20%20%20%20messageElement.textContent%20%2B%3D%20text.charAt(i)%3B%0A%20%20%20%20%20%20%onclick = () => {
                document.querySelectorAll('.logo-wrapper.selected').forEach(w => w.classList.remove('selected'));
                wrapper.classList.add('selected');
                handleMarcaSelection(marca, wrapper);
            };
        });
        const otroWrapper = document.createElement('div');
        otroWrapper.20%20%20%20%20%20%20%20%20%20i%2B%2B%3B%0A%20%20className = 'logo-wrapper';
        otroWrapper.innerHTML = '<img src="images/logos/otra.png" alt="Otra Marca" style="height: 40px;"><span>Otra</span>';
        logosContainer.appendChild(otroWrapper);
        otroWrapper.onclick = () => {
            document.querySelectorAll('.logo-wrapper.selected%20%20%20%20%20%20%20%20%20%20%20%20%20%20chatMessages.scrollTop%20%3D%20chatMessages.scrollHeight%3B%0A%20%20%').forEach(w => w.classList.remove('selected'));
            otroWrapper.classList.add('selected');
            handleMarcaSelection("Otro", otroWrapper);
        };
        console.log("Logos poblados correctamente.");
    };
    const publiBannerTrack = document.querySelector('.scrolling-banner .banner-track');20%20%20%20%20%20%20%20%20%20%20%20%20%20setTimeout(type%2C%20speed)%3B%0A%20%20%20%20%20
    if (publiBannerTrack) { const publiImageFiles = ['publi.png', 'publi%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%202.png', 'publi3.png', 'publi4.png', 'publi5.png', 'publi6.png']; const fragment = document.createDocumentFragment(); publiImageFiles.forEach(file => {%20%7D%0A%20%20%20%20%20%20%20%20type()%3B%0A%20%20%20%20%7D%0A%20%20%20%20%0 const img = new Image(); img.src = `images/publi/${file}`; fragment.appendChild(img); }); publiBannerTrack.appendChild(fragment); setTimeout(() => { const initialImages = publiBannerTrack.querySelectorAll('img'); if (initialImages.length > 0) { initialImages.forEach(img => publiBannerTrack.appendChild(img.cloneNode(true))); } }, 100); }
    const brandsBannerTrack = document.getElementById('brands-banner-track');
    if (brandsBannerTrack) { let brandsImagesToLoad = marcasOrdenadas.length; marcasOrdenadas.forEach(marca => { const fileName = marca.toLowerCase().replace(/[\s-.'&]/g, ''); const img = new Image(); img.src = `images/logos/${fileName}.png`; const onImageLoadOrError = () => { brandsImagesToLoad--; if (brandsImagesToLoad === 0 && brandsBannerTrack.children.length > 0) { Array.from(brandsBannerTrack.children).forEach(child => brandsBannerTrack.appendChild(child.cloneNode(true))); } }; img.onload = () => { brandsBannerTrack.appendChild(img); onImageLoadOrError(); }; img.onerror = onImageLoadOrError; }); }
    if (nextBtns) nextBtns.forEach(btn => btn.addEventListener('click', () => { if (validateStep(currentStep)) { currentStep++; updateFormSteps(); } }));
    if(prevBtns) prevBtns.forEach(btn => btn.addEventListener('click', () => { currentStep--; updateFormSteps(); }));
    if(modeloSelect) modeloSelect.addEventListener('change', () => { if (modeloSelect.value === "Otro") { otroModeloContainer.style.display = 'block'; otroModeloInput.required = true; updateLiveData('modelo', otroModeloInput.value); } else { otroModeloContainer.style.display = 'none'; otroModeloInput.required = false; updateLiveData('modelo', modeloSelect.value); } anioSelect.disabled = false; populateAnios(); updateImageButtonVisibility(); });
    if(anioSelect) anioSelect.addEventListener('change', () => { if (anioSelect.value === "Otro") { otroAnioContainer.style.display = 'block'; otroAnioInput.required = true; updateLiveData('anio', otroAnioInput.value); } else { otroAnioContainer.style.display = 'none'; otroAnioInput.required = false; updateLiveData('anio', anioSelect.value); } updateImageButtonVisibility(); });
    if(otraMarcaInput) otraMarcaInput.addEventListener('input', () => { if(brandDisplayName) brandDisplayName.textContent = otraMarcaInput.value || 'OTRA MARCA'; });
    if(otroModeloInput) otroModeloInput.addEventListener('input', () => { updateLiveData('modelo', otroModeloInput.value); updateImageButtonVisibility(); });
    if(otroAnioInput) otroAnioInput.addEventListener('input', () => { updateLiveData('anio', otroAnioInput.value); updateImageButtonVisibility(); });
    if(descripcionTextarea) descripcionTextarea.addEventListener('input', () => updateLiveData('descripcion', descripcionTextarea.value));
    if(vinInput) vinInput.addEventListener('input', () => updateLiveData('vin', vinInput.value));
    if(nombreInput) nombreInput.addEventListener('input', () => updateLiveData('nombre', nombreInput.value));
    if(telefonoInput) telefonoInput.addEventListener('input', () => updateLiveData('telefono', telefonoInput.value));
    if(imageRefButton) imageRefButton.addEventListener('click', (e) => { e.preventDefault(); const brand = marcaInput.value; const model = (modeloSelect.value === 'Otro') ? otroModeloInput.value : modeloSelect.value; const year = (anioSelect.value === 'Otro') ? otroAnioInput.value : anioSelect.value; const cleanModel = model.replace(/\s*\(.*\)/g, '').trim(); const searchTerm = `${brand} ${cleanModel} ${year}`; const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchTerm)}`; const popupWidth = 800, popupHeight = 600; const left = (screen.width / 2) - (popupWidth / 2); const top = (screen.height / 2) - (popupHeight / 2); const popupFeatures = `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`; window.open(searchUrl, 'imagePopup', popupFeatures); });
    if(form) form.addEventListener('submit', function(e) { e.preventDefault(); if (validateStep(currentStep)) { const formData = new FormData(form); let message = `*SOLICITUD DE REPUESTO*\n\n`; message += `*VEHÍCULO:*\n`; message += `Marca: ${formData.get('marca') === 'Otro' ? formData.get('otra-marca') : formData.get('marca')}\n`; message += `Modelo: ${formData.get('modelo') === 'Otro' ? formData.get('otro-modelo') : formData.get('modelo')}\n`; message += `Año: ${formData.get('anio') === 'Otro' ? formData.get('otro-anio') : formData.get('anio')}\n\n`; message += `*REPUESTO:*\n`; message += `Descripción: ${formData.get('descripcion')}\n`; message += `VIN: ${formData.get('vin') || 'No proporcionado'}\n\n`; message += `*CONTACTO:*\n`; message += `Nombre: ${formData.get('nombre')}\n`; message += `Teléfono: ${formData.get('telefono')}\n`; message += `Ubicación: ${formData.get('ubicacion') || 'No proporcionado'}\n`; const whatsappURL = `https://wa.me/593999115626?text=${encodeURIComponent(message)}`; window.open(whatsappURL, '_blank'); } });
    if (bgVideo) { const videos = ['images/videos/1.mp4', 'images/videos/2.mp4', 'images/videos/3.mp4', 'images/videos/4.mp4']; let currentVideoIndex = 0; bgVideo.playbackRate = 0.7; const playNextVideo = () => { currentVideoIndex = (currentVideoIndex + 1) % videos.length; const source = bgVideo.querySelector('source'); if(source) { source.src = videos[currentVideoIndex]; bgVideo.load(); bgVideo.play().catchA%20%20%20%20async%20function%20handleSendMessage()%(error => console.log('Autoplay para el siguiente video fue prevenido:', error)); } }; bgVideo.addEventListener('20%7B%0A%20%20%20%20%20%20%20%20if%20(!chatInput%20%7C%7Cended', playNextVideo); document.body.addEventListener('click', () => { if (bgVideo.paused) { bgVideo.play().catch(error => console.log('Autoplay inicial fue prevenido:', error)); } }, { once: true }); }
    
    // Inicialización del formulario
    populateLogos();
    populateAnios%20chatInput.value.trim()%20%3D%3D%3D%20''%20%7C%7C%20chatSendBtn.disabled)%20return%3B%0A%20%20%20%20%20%20%20%20if%20(GOOGLE_API_KEY%20%3D%3D%3();
    checkAllFields();
});