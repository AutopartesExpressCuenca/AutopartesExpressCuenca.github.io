document.addEventListener('DOMContentLoaded', function() {

    // ==================================================================
    // == LÓGICA DEL WIDGET DE CHAT Y COMUNICACIÓN EN TIEMPO REAL ==
    // ==================================================================
    
    const chatWidget = document.getElementById('chat-widget');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const assistantButtonChat = document.getElementById('btn-assistant-header');
    const PipedreamWebhookUrl = 'https://eobg3f0o9qljmo6.m.pipedream.net';
    
    // Genera un ID único para cada visitante, para que las conversaciones no se mezclen.
    const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    function addMessage(sender, text) {
        if (!chatMessages) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        // Mueve el scroll hacia abajo para ver el nuevo mensaje
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleSendMessage() {
        if (!chatInput || !chatInput.value) return;
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        addMessage('user', messageText);
        chatInput.value = '';

        try {
            await fetch(PipedreamWebhookUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId, // <-- Enviamos este ID a Pipedream
                    text: messageText,
                    source: 'WebsiteChat',
                    timestamp: new Date().toISOString()
                })
            });
            console.log('Mensaje enviado a Pipedream con el userId:', userId);
        } catch (error) {
            console.error('Error enviando mensaje a Pipedream:', error);
            addMessage('assistant', 'Lo siento, hubo un error de conexión. Inténtalo de nuevo.');
        }
    }

    if (assistantButtonChat) {
        assistantButtonChat.addEventListener('click', () => {
            if(chatWidget) chatWidget.classList.remove('hidden');
            if (chatMessages && chatMessages.children.length === 0) {
                 addMessage('assistant', '¡Hola! Soy tu asistente virtual. ¿Qué repuesto estás buscando? Dime marca, modelo, año y la pieza que necesitas.');
            }
        });
    }

    if (chatCloseBtn) chatCloseBtn.addEventListener('click', () => chatWidget.classList.add('hidden'));
    if (chatSendBtn) chatSendBtn.addEventListener('click', handleSendMessage);
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSendMessage(); });

    // ¡¡¡IMPORTANTE!!! Valores actualizados con tus claves.
    const PUSHER_APP_KEY = '9ae8e7117128b1abb5b3'; // <--- TU KEY PÚBLICA
    const PUSHER_APP_CLUSTER = 'sa1';             // <--- TU CLUSTER

    try {
        if (typeof Pusher !== 'undefined' && PUSHER_APP_KEY !== 'REEMPLAZA_CON_TU_KEY') {
            const pusher = new Pusher(PUSHER_APP_KEY, { cluster: PUSHER_APP_CLUSTER });
            // Nos suscribimos a un canal único para este usuario
            const channel = pusher.subscribe(userId); 
            // Escuchamos por un evento llamado 'new-message' en ese canal
            channel.bind('new-message', function(data) {
                addMessage('assistant', data.message);
            });
            console.log(`Conectado a Pusher y escuchando en el canal: ${userId}`);
        } else {
             console.error("La librería de Pusher no se ha cargado o las claves no han sido reemplazadas.");
        }
    } catch(e) {
        console.error("Error al inicializar Pusher. ¿Están correctas las claves?: ", e);
        if(chatMessages && chatMessages.children.length <= 1) addMessage('assistant', 'No se pudo conectar al servicio de chat en este momento.');
    }


    // ==================================================================
    // == LÓGICA DEL FORMULARIO DE VARIOS PASOS (CÓDIGO ORIGINAL) ==
    // ==================================================================
    
    const form = document.getElementById('sparePartsForm');
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const marcaInput = document.getElementById('marca');
    const modeloSelect = document.getElementById('modelo');
    const anioSelect = document.getElementById('anio');
    const logosContainer = document.getElementById('logos-container');
    const otroMarcaContainer = document.getElementById('otra-marca-container');
    const otroModeloContainer = document.getElementById('otro-modelo-container');
    const otroAnioContainer = document.getElementById('otro-anio-container');
    const otraMarcaInput = document.getElementById('otra-marca');
    const otroModeloInput = document.getElementById('otro-modelo');
    const otroAnioInput = document.getElementById('otro-anio');
    const brandDisplay = document.getElementById('selected-brand-display');
    const brandDisplayLogoContainer = document.querySelector('.display-logo-container');
    const brandDisplayLogo = document.getElementById('selected-brand-display-logo');
    const brandDisplayName = document.getElementById('selected-brand-name');
    const displayModelo = document.getElementById('display-modelo');
    const displayAnio = document.getElementById('display-anio');
    const displayVin = document.getElementById('display-vin');
    const displayNombre = document.getElementById('display-nombre');
    const displayTelefono = document.getElementById('display-telefono');
    const displayDescripcion = document.getElementById('display-descripcion');
    const descripcionTextarea = document.getElementById('descripcion');
    const vinInput = document.getElementById('vin');
    const nombreInput = document.getElementById('nombre');
    const telefonoInput = document.getElementById('telefono');
    const sendPrompt = document.getElementById('send-prompt');
    const bgVideo = document.getElementById('bg-video');
    const validationPopup = document.getElementById('validation-popup');
    const errorList = document.getElementById('error-list');
    const imageRefButton = document.getElementById('image-ref-button');
    
    let currentStep = 0;
    let popupTimeout;
    
    const marcasPopulares = ["Chevrolet", "Kia", "Toyota", "Hyundai", "Suzuki", "Renault", "Great Wall", "Mazda", "Nissan", "Ford", "Volkswagen", "Mitsubishi"];
      
    const marcasFullList = {
        "Chevrolet": ["Onix", "Onix RS", "Onix Turbo Sedán", "Joy HB", "Joy Sedán", "Aveo", "Spark GT", "Spark Life", "Beat", "Sail", "Cavalier", "Cruze", "Bolt", "Bolt-EUV", "Groove", "Tracker", "Captiva", "Captiva XL", "Equinox-EV", "Blazer-RS-EV", "Tahoe", "Trailblazer", "Montana", "D-Max (varias gen.)", "Colorado", "Silverado", "Blazer (hist.)", "Trooper", "LUV", "Luv-D-Max", "Rodeo", "Gemini", "Corsa", "Esteem", "Forsa", "Vitara (3 puertas)", "Vitara (5 puertas)", "Grand Vitara", "Blue-Bird", "chasis MR-buses"],
        "Kia": ["Picanto", "Rio", "Rio-5", "Soluto", "Cerato", "K3", "Carens", "Carnival", "Stonic", "Stonic Hybrid", "Seltos", "Sonet", "Sportage", "Sorento", "Niro", "Niro-EV", "EV6", "EV5", "EV9", "Soul-EV"],
        "Toyota": ["Agya", "Yaris", "Yaris Sport", "Yaris Cross", "Corolla", "Corolla Híbrido", "Corolla Cross Híbrido", "C-HR", "Raize", "RAV4", "Rush", "Prius", "Prius-C", "Innova", "Hilux", "Tacoma", "Fortuner", "Land Cruiser Prado", "Land Cruiser 200", "Land Cruiser 300", "4Runner", "FJ Cruiser", "Starlet", "Tercel", "Celica"],
        "Hyundai": ["Accent", "Grand i10", "Elantra", "Sonata", "Venue", "Kona", "Kona Hybrid", "Tucson", "Santa Fe", "Creta", "Staria"],
        "Chery": ["QQ3", "QQ6", "Nice-A1", "Van-Pass", "XCross", "Arrizo-3", "Arrizo-5", "Tiggo", "Tiggo-2", "Tiggo-2 Pro", "Tiggo-3", "Tiggo-4", "Tiggo-5", "Tiggo-7", "Tiggo-7 Pro", "Tiggo-8", "Tiggo-8 Pro"],
        "Suzuki": ["Swift", "Baleno", "Celerio", "Ignis", "Vitara", "Grand Vitara", "Jimny", "XL7", "Ertiga", "S-Cross", "SX4"],
        "Renault": ["Kwid", "Sandero", "Logan", "Stepway", "Duster", "Captur", "Koleos", "Oroch", "Kangoo", "Symbol", "Megane", "Fluence"],
        "Great Wall": ["Wingle-1", "Wingle-2", "Wingle-3", "Poer", "Haval H2", "Haval H6", "Haval H9", "Haval Jolion", "Haval F7", "M4", "ORA Good-Cat", "Tank-300"],
        "JAC": ["J2", "J4", "J5", "S2", "S3", "S5", "S7", "T40", "T60", "V7", "HFC-1037"],
        "DFSK": ["Glory-500", "Glory-560", "Glory-580", "F5", "Mini Truck", "C31", "C52", "EC35", "K05", "K07"],
        "Volkswagen": ["Gol", "Escarabajo (Tipo-1)", "Voyage", "Polo", "Virtus", "T-Cross", "Tiguan", "Taigo", "Jetta", "Passat", "Amarok"],
        "Nissan": ["March", "Versa", "Sentra", "Kicks", "X-Trail", "Frontier", "NV350", "Pathfinder", "Note", "Micra"],
        "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-9", "CX-50", "CX-90", "BT-50"],
        "Dongfeng": ["Rich-6", "Rich-7", "Rich-12", "S30", "Husky", "EQ2030", "EQ2050", "580", "580 Pro", "mini-van Q30"],
        "Sinotruk": ["Howo-7", "Howo-9", "A7", "G7", "T5G", "ZZ1257", "ZZ1325", "ZZ1507", "ZZ3317", "ZZ4251"],
        "Jetour": ["X70", "X90", "X95", "T1", "T5", "T8", "Dasheng", "Cruiser", "XC", "Cooler"],
        "Ford": ["Fiesta", "EcoSport", "Ranger", "Explorer", "Mustang", "Transit", "Everest", "Bronco", "F-150", "Edge"],
        "Changan": ["CS35", "CS55", "CS75", "CS85", "Alsvin", "UNI-T", "Eado", "Eado Xt", "Benni", "CS15"],
        "BYD": ["Atto-3", "Dolphin", "Seal", "Song-Plus", "Tang", "Yuan-EV", "Qin", "e1", "e2", "Han"],
        "Subaru": ["Impreza", "XV", "Forester", "Outback", "WRX", "Crosstrek", "Legacy", "BRZ", "Solterra", "Ascent"],
        "Citroen": ["C3", "C3 Aircross", "C4", "C5 Aircross", "Berlingo", "C-Elysée", "C4 Cactus", "Spacetourer", "Jumpy", "Jumper"],
        "Fiat": ["500", "Panda", "Punto", "Tipo", "Toro", "Strada", "Argo", "Uno", "Ducato", "Fiorino"],
        "Jeep": ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator", "Avenger", "Commander", "Wagoneer", "Patriot"],
        "Honda": ["Fit", "City", "Civic", "Accord", "CR-V", "HR-V", "Pilot", "BR-V", "Ridgeline", "Insight"],
        "BMW": ["Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "Serie 7", "X1", "X3", "X5", "Z4"],
        "Audi": ["A3", "A4", "A6", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT"],
        "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "CLA", "G-Class"],
        "Porsche": ["911", "Cayman", "Boxster", "Macan", "Cayenne", "Taycan", "Panamera", "718", "924", "928"]
    };
      
    const marcasOtras = Object.keys(marcasFullList).filter(m => !marcasPopulares.includes(m));
    const marcasOrdenadas = [...marcasPopulares, ...marcasOtras];
      
    const updateImageButtonVisibility = () => {
        if (!marcaInput || !modeloSelect || !anioSelect || !imageRefButton) return;
        const brand = marcaInput.value;
        const model = (modeloSelect.value === 'Otro') ? otroModeloInput.value : modeloSelect.value;
        const year = (anioSelect.value === 'Otro') ? otroAnioInput.value : anioSelect.value;
        if (brand && model && year && brand !== 'Otro' && model !== '' && year !== '') {
            imageRefButton.classList.add('visible');
        } else {
            imageRefButton.classList.remove('visible');
        }
    };
      
    const updateFormSteps = () => {
        if (!formSteps || !progressSteps || !form) return;
        formSteps.forEach((s, i) => s.classList.toggle('active', i === currentStep));
        progressSteps.forEach((s, i) => s.classList.toggle('active', i <= currentStep));
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
      
    const checkAllFields = () => {
        if (!form || !sendPrompt) return;
        let allValid = true;
        form.querySelectorAll('[required]:not([type=hidden])').forEach(input => {
            let container = input.closest('.otro-input-container');
            if (!container || container.style.display === 'block') {
                if (!input.value) allValid = false;
            }
        });
        sendPrompt.style.display = allValid ? 'block' : 'none';
    };

    const validateStep = (stepIndex) => {
        if (!formSteps[stepIndex]) return true;
        let errors = [];
        formSteps[stepIndex].querySelectorAll('[required]').forEach(input => {
            let fieldLabel = document.querySelector(`label[for='${input.id}']`);
            if (input.offsetWidth > 0 || input.type === 'hidden') {
                const container = input.closest('.otro-input-container');
                if (!container || container.style.display === 'block') {
                    if (!input.value) {
                        errors.push(fieldLabel ? fieldLabel.textContent.replace(/:/g, '') : 'Campo requerido');
                    }
                }
            }
        });
        if (errors.length > 0) {
            if (errorList && validationPopup) {
                errorList.innerHTML = '';
                errors.forEach(err => {
                    const li = document.createElement('li');
                    li.textContent = `• ${err}`;
                    errorList.appendChild(li);
                });
                validationPopup.classList.add('show');
                clearTimeout(popupTimeout);
                popupTimeout = setTimeout(() => {
                    validationPopup.classList.remove('show');
                }, 4000);
            }
            return false;
        }
        return true;
    };

    const populateAnios = () => {
        if (!anioSelect) return;
        anioSelect.innerHTML = '<option value="">Selecciona el año</option>';
        for (let y = new Date().getFullYear() + 1; y >= 1990; y--) anioSelect.add(new Option(y, y));
        anioSelect.add(new Option("Otro", "Otro"));
    };
      
    const updateLiveData = (field, value) => {
        const displayElement = document.getElementById(`display-${field}`);
        if (!displayElement) return;
        const span = displayElement.querySelector('span');
        if (value) {
            span.textContent = value;
            displayElement.style.display = 'block';
        } else {
            displayElement.style.display = 'none';
        }
        checkAllFields();
    };

    const handleMarcaSelection = (marca, wrapper) => {
        if (!brandDisplay || !modeloSelect || !anioSelect || !otroMarcaContainer || !otroModeloContainer) return;
        brandDisplay.classList.add('visible');
        const logoSrc = wrapper.querySelector('img')?.src || 'images/logos/otra.png';
        brandDisplayLogo.src = logoSrc;
        brandDisplayName.textContent = marca;
        modeloSelect.innerHTML = '<option value="">Selecciona un modelo</option>';
        anioSelect.innerHTML = '<option value="">Primero selecciona un modelo</option>';
        anioSelect.disabled = true;
        otroMarcaContainer.style.display = 'none';
        otraMarcaInput.required = false;
        otroModeloContainer.style.display = 'none';
        otroModeloInput.required = false;
        wrapper.style.setProperty('--logo-glow-url', `url(${logoSrc})`);
        brandDisplayLogoContainer.style.setProperty('--logo-glow-url-display', `url(${logoSrc})`);
        updateLiveData('modelo', '');
        updateLiveData('anio', '');
        updateImageButtonVisibility();

        if (marca === "Otro") {
            marcaInput.value = "Otro";
            anioSelect.disabled = false;
            populateAnios();
            modeloSelect.disabled = false;
            modeloSelect.innerHTML = '<option value="Otro" selected>Otro (Especifique)</option>';
            otroMarcaContainer.style.display = 'block';
            otraMarcaInput.required = true;
            otroModeloContainer.style.display = 'block';
            otroModeloInput.required = true;
        } else {
            marcaInput.value = marca;
            if (marcasFullList[marca]) {
                marcasFullList[marca].forEach(modelo => modeloSelect.add(new Option(modelo, modelo)));
            }
            modeloSelect.add(new Option("Otro", "Otro"));
            modeloSelect.disabled = false;
        }
        checkAllFields();
        setTimeout(() => { if (modeloSelect) modeloSelect.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    };
      
    const populateLogos = () => {
        if (!logosContainer) return;
        marcasOrdenadas.forEach(marca => {
            const wrapper = document.createElement('div');
            wrapper.className = 'logo-wrapper';
            const img = document.createElement('img');
            const span = document.createElement('span');
            const fileName = marca.toLowerCase().replace(/[\s-.'&]/g, '');
            img.src = `images/logos/${fileName}.png`;
            img.alt = marca;
            wrapper.appendChild(img);
            span.textContent = marca;
            wrapper.appendChild(span);
            logosContainer.appendChild(wrapper);
            wrapper.onclick = () => {
                document.querySelectorAll('.logo-wrapper.selected').forEach(w => w.classList.remove('selected'));
                wrapper.classList.add('selected');
                handleMarcaSelection(marca, wrapper);
            };
        });
        const otroWrapper = document.createElement('div');
        otroWrapper.className = 'logo-wrapper';
        otroWrapper.innerHTML = '<img src="images/logos/otra.png" alt="Otra Marca"><span>Otra</span>';
        logosContainer.appendChild(otroWrapper);
        otroWrapper.onclick = () => {
            document.querySelectorAll('.logo-wrapper.selected').forEach(w => w.classList.remove('selected'));
            otroWrapper.classList.add('selected');
            handleMarcaSelection("Otro", otroWrapper);
        };
    };

    const publiBannerTrack = document.querySelector('.scrolling-banner .banner-track');
    if (publiBannerTrack) {
        const publiImageFiles = ['publi.png', 'publi2.png', 'publi3.png', 'publi4.png', 'publi5.png', 'publi6.png'];
        const fragment = document.createDocumentFragment();
        publiImageFiles.forEach(file => {
            const img = new Image();
            img.src = `images/publi/${file}`;
            fragment.appendChild(img);
        });
        publiBannerTrack.appendChild(fragment);
        setTimeout(() => {
            const initialImages = publiBannerTrack.querySelectorAll('img');
            if (initialImages.length > 0) {
                initialImages.forEach(img => publiBannerTrack.appendChild(img.cloneNode(true)));
            }
        }, 100);
    }

    const brandsBannerTrack = document.getElementById('brands-banner-track');
    if (brandsBannerTrack) {
        let brandsImagesToLoad = marcasOrdenadas.length;
        marcasOrdenadas.forEach(marca => {
            const fileName = marca.toLowerCase().replace(/[\s-.'&]/g, '');
            const img = new Image();
            img.src = `images/logos/${fileName}.png`;
            const onImageLoadOrError = () => {
                brandsImagesToLoad--;
                if (brandsImagesToLoad === 0 && brandsBannerTrack.children.length > 0) {
                    Array.from(brandsBannerTrack.children).forEach(child => brandsBannerTrack.appendChild(child.cloneNode(true)));
                }
            };
            img.onload = () => {
                brandsBannerTrack.appendChild(img);
                onImageLoadOrError();
            };
            img.onerror = onImageLoadOrError;
        });
    }

    // Event Listeners for Form
    if (nextBtns) nextBtns.forEach(btn => btn.addEventListener('click', () => { if (validateStep(currentStep)) { currentStep++; updateFormSteps(); } }));
    if(prevBtns) prevBtns.forEach(btn => btn.addEventListener('click', () => { currentStep--; updateFormSteps(); }));
    if(modeloSelect) modeloSelect.addEventListener('change', () => {
        if (modeloSelect.value === "Otro") {
            otroModeloContainer.style.display = 'block';
            otroModeloInput.required = true;
            updateLiveData('modelo', otroModeloInput.value);
        } else {
            otroModeloContainer.style.display = 'none';
            otroModeloInput.required = false;
            updateLiveData('modelo', modeloSelect.value);
        }
        anioSelect.disabled = false; populateAnios(); updateImageButtonVisibility();
    });
    if(anioSelect) anioSelect.addEventListener('change', () => {
        if (anioSelect.value === "Otro") {
            otroAnioContainer.style.display = 'block';
            otroAnioInput.required = true;
            updateLiveData('anio', otroAnioInput.value);
        } else {
            otroAnioContainer.style.display = 'none';
            otroAnioInput.required = false;
            updateLiveData('anio', anioSelect.value);
        }
        updateImageButtonVisibility();
    });
    if(otraMarcaInput) otraMarcaInput.addEventListener('input', () => { if(brandDisplayName) brandDisplayName.textContent = otraMarcaInput.value || 'OTRA MARCA'; });
    if(otroModeloInput) otroModeloInput.addEventListener('input', () => { updateLiveData('modelo', otroModeloInput.value); updateImageButtonVisibility(); });
    if(otroAnioInput) otroAnioInput.addEventListener('input', () => { updateLiveData('anio', otroAnioInput.value); updateImageButtonVisibility(); });
    if(descripcionTextarea) descripcionTextarea.addEventListener('input', () => updateLiveData('descripcion', descripcionTextarea.value));
    if(vinInput) vinInput.addEventListener('input', () => updateLiveData('vin', vinInput.value));
    if(nombreInput) nombreInput.addEventListener('input', () => updateLiveData('nombre', nombreInput.value));
    if(telefonoInput) telefonoInput.addEventListener('input', () => updateLiveData('telefono', telefonoInput.value));
    if(imageRefButton) imageRefButton.addEventListener('click', (e) => {
        e.preventDefault();
        const brand = marcaInput.value;
        const model = (modeloSelect.value === 'Otro') ? otroModeloInput.value : modeloSelect.value;
        const year = (anioSelect.value === 'Otro') ? otroAnioInput.value : anioSelect.value;
        const cleanModel = model.replace(/\s*\(.*\)/g, '').trim();
        const searchTerm = `${brand} ${cleanModel} ${year}`;
        const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchTerm)}`;
        const popupWidth = 800, popupHeight = 600;
        const left = (screen.width / 2) - (popupWidth / 2);
        const top = (screen.height / 2) - (popupHeight / 2);
        const popupFeatures = `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`;
        window.open(searchUrl, 'imagePopup', popupFeatures);
    });
    if(form) form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateStep(currentStep)) {
            const formData = new FormData(form);
            let message = `*SOLICITUD DE REPUESTO*\n\n`;
            message += `*VEHÍCULO:*\n`;
            message += `Marca: ${formData.get('marca') === 'Otro' ? formData.get('otra-marca') : formData.get('marca')}\n`;
            message += `Modelo: ${formData.get('modelo') === 'Otro' ? formData.get('otro-modelo') : formData.get('modelo')}\n`;
            message += `Año: ${formData.get('anio') === 'Otro' ? formData.get('otro-anio') : formData.get('anio')}\n\n`;
            message += `*REPUESTO:*\n`;
            message += `Descripción: ${formData.get('descripcion')}\n`;
            message += `VIN: ${formData.get('vin') || 'No proporcionado'}\n\n`;
            message += `*CONTACTO:*\n`;
            message += `Nombre: ${formData.get('nombre')}\n`;
            message += `Teléfono: ${formData.get('telefono')}\n`;
            message += `Ubicación: ${formData.get('ubicacion') || 'No proporcionado'}\n`;
            const whatsappURL = `https://wa.me/593999115626?text=${encodeURIComponent(message)}`;
            window.open(whatsappURL, '_blank');
        }
    });
    

    if (bgVideo) {
        const videos = ['images/videos/1.mp4', 'images/videos/2.mp4', 'images/videos/3.mp4', 'images/videos/4.mp4'];
        let currentVideoIndex = 0;
        bgVideo.playbackRate = 0.7;
        const playNextVideo = () => {
            currentVideoIndex = (currentVideoIndex + 1) % videos.length;
            const source = bgVideo.querySelector('source');
            if(source) {
                source.src = videos[currentVideoIndex];
                bgVideo.load();
                bgVideo.play().catch(error => console.log('Autoplay para el siguiente video fue prevenido:', error));
            }
        };
        bgVideo.addEventListener('ended', playNextVideo);
        document.body.addEventListener('click', () => {
            if (bgVideo.paused) {
                bgVideo.play().catch(error => console.log('Autoplay inicial fue prevenido:', error));
            }
        }, { once: true });
    }

    // Initializations for Form
    populateLogos();
    populateAnios();
    checkAllFields();
});