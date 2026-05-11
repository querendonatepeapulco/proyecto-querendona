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
window.addEventListener('scroll', revealOnScroll);
// ACTIVAR AL CARGAR
revealOnScroll();
// EFECTO PARALLAX SUAVE
window.addEventListener('scroll', () => {
const scrolled = window.scrollY;
document.querySelectorAll('.floating').forEach(el => {
el.style.transform = `translateY(${scrolled * 0.03}px)`;
});
});
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
function addToOrder(itemName) {

const toast = document.getElementById('toast');
toast.innerText = `Añadido: ${itemName} `;
toast.classList.add('show');
setTimeout(() => {
toast.classList.remove('show');
}, 3000);
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

    reservationForm.addEventListener('submit', (e) => {

        e.preventDefault();

        showToast("Reservación enviada correctamente ✨");

        reservationForm.reset();

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

    const heroVideo = document.getElementById('heroVideo');
    const soundBtn = document.getElementById('soundBtn');

    if(heroVideo && soundBtn){

        soundBtn.addEventListener('click', ()=>{

            if(heroVideo.muted){

                heroVideo.muted = false;

                heroVideo.volume = 1;

                heroVideo.play();

                soundBtn.innerHTML = '🔊';

            }else{

                heroVideo.muted = true;

                soundBtn.innerHTML = '🔇';

            }

        });

    }

});

/* ========================= */
/* AUTO CAROUSEL */
/* ========================= */

const track = document.getElementById('carouselTrack');

let position = 0;

setInterval(()=>{

    const slideWidth = 345; // ancho + gap

    position -= slideWidth;

    if(Math.abs(position) >= track.scrollWidth / 2){

        position = 0;
    }

    track.style.transform = `translateX(${position}px)`;

}, 2500);

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

menuToggle.addEventListener('click', ()=>{

    mobileMenu.classList.toggle('active');

    if(mobileMenu.classList.contains('active')){

        menuToggle.innerHTML = '✕';

    }else{

        menuToggle.innerHTML = '☰';
    }

});