// ANIMACIÓN REVEAL AL HACER SCROLL
const reveals = document.querySelectorAll('.reveal');

function revealOnScroll(){

    reveals.forEach((element)=>{

        const windowHeight = window.innerHeight;

        const revealTop = element.getBoundingClientRect().top;

        if(revealTop < windowHeight - 100){

            element.classList.add('active');

        }

    });

}

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();
// EFECTO PARALLAX SUAVE
const useParallax =
    !window.matchMedia('(max-width: 768px)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if(useParallax){
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    document.querySelectorAll('.floating').forEach(el => {
        el.style.transform = `translateY(${scrolled * 0.03}px)`;
    });
});
}
// EFECTO HOVER DINÁMICO EN CARDS
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
card.addEventListener('mousemove', (e) => {
const rect = card.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
card.style.background = `radial-gradient(circle at ${x}px ${y}px,
rgba(255,255,255,1), rgba(255,255,255,0.95))`;
});
card.addEventListener('mouseleave', () => {
card.style.background = 'white';
});

});


const themeToggle = document.getElementById('themeToggle');
if(themeToggle){
themeToggle.addEventListener('click', () => {

document.body.classList.toggle('dark-mode');
if(document.body.classList.contains('dark-mode')) {
themeToggle.innerHTML = ' ';
} else {
themeToggle.innerHTML = ' ';
}
});
}

// FILTROS DEL MENÚ
const filterBtns = document.querySelectorAll('.filter-btn');
const menuItems = document.querySelectorAll('.menu-item-card');
filterBtns.forEach(btn => {
btn.addEventListener('click', () => {
filterBtns.forEach(b => b.classList.remove('active'));
btn.classList.add('active');
const filterValue = btn.getAttribute('data-filter');
menuItems.forEach(item => {
if(filterValue === 'all' || item.dataset.category === filterValue){
item.classList.remove('hidden');
} else {
item.classList.add('hidden');
}
});
});
});
// TOAST DE ORDEN
function showToast(message) {

let toast = document.getElementById('toast');

if(!toast){
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
}

toast.innerText = message;
toast.classList.add('show');
setTimeout(() => {
toast.classList.remove('show');
}, 3000);

}

function addToOrder(itemName) {

showToast(`Añadido: ${itemName} `);
}
// SCROLL SUAVE
function scrollToMenu() {
const menuSection = document.getElementById('menu-section');
if(menuSection){
menuSection.scrollIntoView({
behavior: 'smooth'
});
}
}

/* ========================= */
/* RESERVACIÓN */
/* ========================= */

const reservationForm = document.getElementById('reservationForm');

if(reservationForm){

    const reservationDate = reservationForm.querySelector('input[name="date"]');

    if(reservationDate){
        reservationDate.min = getTodayInputDate();
    }

    reservationForm.addEventListener('submit', (e) => {

        e.preventDefault();

        const formData = new FormData(reservationForm);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const phone = String(formData.get('phone') || '').trim();
        const date = String(formData.get('date') || '');
        const time = String(formData.get('time') || '');
        const message = String(formData.get('message') || '').trim();
        const formattedDate = formatReservationDate(date);
        const formattedTime = formatReservationTime(time);
        const whatsappNumber = '527713420990';
        const reservationMessage = [
            'Hola, quiero hacer una reservación en La Querendona.',
            '',
            `Nombre: ${name}`,
            `Correo: ${email}`,
            `Teléfono: ${phone}`,
            `Fecha: ${formattedDate}`,
            `Hora: ${formattedTime}`,
            `Detalles: ${message || 'Sin detalles adicionales'}`,
            '',
            '¿Me pueden confirmar disponibilidad?'
        ].join('\n');
        const whatsappUrl =
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(reservationMessage)}`;
        const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener');

        if(!whatsappWindow){
            window.location.href = whatsappUrl;
        }

        showToast('Te llevamos a WhatsApp para confirmar tu reservación.');

        reservationForm.reset();

    });

}

function formatReservationDate(value){

    if(!value){
        return '';
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

}

function getTodayInputDate(){

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;

}

function formatReservationTime(value){

    if(!value){
        return '';
    }

    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString('es-MX', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

}

/* ========================= */
/* 3D SERVICE CARDS */
/* ========================= */

const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach((card)=>{

    card.addEventListener('mousemove', (e)=>{

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 14;
        const rotateX = ((y / rect.height) - 0.5) * -14;

        card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale(1.03)
        `;

    });

    card.addEventListener('mouseleave', ()=>{

        card.style.transform = `
            perspective(1000px)
            rotateX(0)
            rotateY(0)
            scale(1)
        `;

    });

});

/* ========================= */
/* VIDEO SOUND */
/* ========================= */


window.addEventListener('DOMContentLoaded', ()=>{

    const soundButtons = document.querySelectorAll('.sound-btn');

    soundButtons.forEach((button)=>{

        const container = button.closest(
            '.hero-video-container, .experience-video-container, .chefs-hero-video-container'
        );

        const video = container ? container.querySelector('video') : null;

        if(!video){
            return;
        }

        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'auto');

        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', 'Activar sonido');

        button.addEventListener('click', async ()=>{

            button.disabled = true;

            try{

                if(video.muted){

                    video.muted = false;
                    video.defaultMuted = false;
                    video.volume = 1;

                    if(video.readyState < 2){
                        video.load();
                    }

                    await video.play();

                    button.innerHTML = '🔊';
                    button.setAttribute('aria-label', 'Silenciar video');

                }else{

                    video.muted = true;
                    video.defaultMuted = true;

                    await video.play().catch(()=>{});

                    button.innerHTML = '🔇';
                    button.setAttribute('aria-label', 'Activar sonido');
                }

            }catch(error){

                video.muted = false;
                video.defaultMuted = false;
                video.volume = 1;
                button.innerHTML = '🔊';
                button.setAttribute('aria-label', 'Silenciar video');

            }finally{

                button.disabled = false;
            }

        });

    });

});

/* ========================= */
/* AUTO CAROUSEL */
/* ========================= */

const track = document.getElementById('carouselTrack');

if(track){
    let position = 0;

    setInterval(()=>{

        const firstSlide = track.querySelector('.carousel-slide');
        const slideWidth = firstSlide ? firstSlide.getBoundingClientRect().width + 25 : 345;

        position -= slideWidth;

        if(Math.abs(position) >= track.scrollWidth - track.clientWidth){

            position = 0;
        }

        track.style.transform = `translateX(${position}px)`;

    }, 2500);
}

/* ========================= */
/* SLIDE RIGHT REVEAL */
/* ========================= */

const slideElements =
document.querySelectorAll('.slide-right');

const slideObserver =
new IntersectionObserver((entries)=>{

    entries.forEach((entry)=>{

        if(entry.isIntersecting){

            entry.target.classList.add('active');

        }

    });

},{
    threshold:0.2
});

slideElements.forEach((element)=>{

    slideObserver.observe(element);

});

/* ========================= */
/* REVEAL CHEFS */
/* ========================= */

const chefCards =
document.querySelectorAll('.reveal-chef');

const chefObserver =
new IntersectionObserver((entries)=>{

    entries.forEach((entry)=>{

        if(entry.isIntersecting){

            entry.target.classList.add('active');

        }

    });

},{
    threshold:0.2
});

chefCards.forEach((card)=>{

    chefObserver.observe(card);

});

/* ========================= */
/* MOBILE MENU */
/* ========================= */

const menuToggle =
document.getElementById('menuToggle');

const mobileMenu =
document.getElementById('mobileMenu');

if(menuToggle && mobileMenu){
menuToggle.addEventListener('click', ()=>{

    mobileMenu.classList.toggle('active');

    if(mobileMenu.classList.contains('active')){

        menuToggle.innerHTML = '✕';

    }else{

        menuToggle.innerHTML = '☰';
    }

});

mobileMenu.querySelectorAll('a').forEach((link)=>{
    link.addEventListener('click', ()=>{
        mobileMenu.classList.remove('active');
        menuToggle.innerHTML = '☰';
    });
});
}
