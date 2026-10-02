const languageSelector = document.getElementById('language-selector');
const translatableElements = document.querySelectorAll('[data-i18n]');

function setLanguage(language) {
    if (!translations[language]) return;

    translatableElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });

    document.documentElement.lang = language;
    localStorage.setItem('preferredLanguage', language);
}

languageSelector.addEventListener('change', (event) => {
    setLanguage(event.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'es';
    languageSelector.value = savedLanguage;
    setLanguage(savedLanguage);
});

// Lógica para colapsar/expandir secciones
document.querySelectorAll('section h2').forEach(heading => {
    // Esta línea oculta las secciones por defecto al abrir la página
    heading.parentElement.classList.add('collapsed');
    
    // Esta línea mantiene la función de clic para abrir y cerrar
    heading.addEventListener('click', () => {
        heading.parentElement.classList.toggle('collapsed');
    });
});

// Función para generar y descargar el PDF al instante
function generatePDF() {
    const mainElement = document.querySelector('main');
    const sections = document.querySelectorAll('section');
    
    // 1. Guardamos cómo estaban las pestañas y abrimos todas temporalmente
    const originalStates = Array.from(sections).map(sec => sec.classList.contains('collapsed'));
    sections.forEach(sec => sec.classList.remove('collapsed'));
    
    // Ocultamos los signos + y - temporalmente
    mainElement.classList.add('exporting-pdf');

    // 2. Elegimos el nombre del archivo según el idioma
    const currentLang = document.getElementById('language-selector').value;
    const filename = currentLang === 'en' ? 'CV_Ricardo_Rivas_EN.pdf' : 'CV_Ricardo_Rivas_ES.pdf';

    // 3. Configuramos la calidad y márgenes del PDF
    const opt = {
        margin:       10, // Márgenes en mm
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 }, // Alta calidad
        html2canvas:  { scale: 2, useCORS: true }, // Escala para que no se vea borroso
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: 'avoid-all' } // Evita que corte las referencias por la mitad
    };

    // 4. Generamos el PDF y cuando termine, dejamos todo como estaba
    html2pdf().set(opt).from(mainElement).save().then(() => {
        sections.forEach((sec, index) => {
            if (originalStates[index]) {
                sec.classList.add('collapsed');
            }
        });
        mainElement.classList.remove('exporting-pdf');
    });
}

// --- LÓGICA DEL MENÚ DE IDIOMAS PERSONALIZADO ---
const customSelect = document.getElementById('custom-lang-select');
const selectedBox = customSelect.querySelector('.select-selected');
const itemsBox = customSelect.querySelector('.select-items');
const options = itemsBox.querySelectorAll('div');
const nativeSelector = document.getElementById('language-selector');

// Abrir/cerrar menú
selectedBox.addEventListener('click', (e) => {
    e.stopPropagation();
    itemsBox.classList.toggle('select-hide');
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
        itemsBox.classList.add('select-hide');
    }
});

// Al seleccionar un idioma de la lista
options.forEach(option => {
    option.addEventListener('click', function() {
        const val = this.getAttribute('data-val');
        const type = this.getAttribute('data-type');
        
        // Actualizar el texto del botón (quita el logo de google de la vista principal)
        selectedBox.innerHTML = this.innerHTML.split('<img')[0].trim();
        itemsBox.classList.add('select-hide');

        if (type === 'official') {
            // Quitar traducción de Google
            restoreGoogleTranslate();
            
            // Activar idioma nativo (esto dispara tu código normal)
            nativeSelector.value = val;
            nativeSelector.dispatchEvent(new Event('change'));
            
        } else if (type === 'google') {
            // Ponemos tu CV en inglés primero para asegurar una traducción de Google mucho más exacta
            nativeSelector.value = 'en';
            nativeSelector.dispatchEvent(new Event('change'));
            
            // Le damos unos milisegundos para que cargue el inglés y luego activamos Google
            setTimeout(() => {
                triggerGoogleTranslate(val);
            }, 100); 
        }
    });
});

// Función para activar Google Translate de forma oculta
function triggerGoogleTranslate(langCode) {
    const googleCombo = document.querySelector('.goog-te-combo');
    if (googleCombo) {
        googleCombo.value = langCode;
        googleCombo.dispatchEvent(new Event('change'));
    }
}

// Función para restaurar la página al original
function restoreGoogleTranslate() {
    const googleCombo = document.querySelector('.goog-te-combo');
    if (googleCombo && googleCombo.value !== '') {
        googleCombo.value = '';
        googleCombo.dispatchEvent(new Event('change'));
    }
}