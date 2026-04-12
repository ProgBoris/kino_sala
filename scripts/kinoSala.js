// kinoSala.js

let trenutnaProjekcijaIndeks = 0;
let rezervisanaSjedista = {}; // Za čuvanje rezervacija

function odrediProjekcijuIzQuery() {
    const params = new URLSearchParams(window.location.search);
    const filmParam = params.get('film');
    if (!filmParam) return;

    const filmNaziv = decodeURIComponent(filmParam).replace(/\+/g, ' ').trim().toLowerCase();
    const index = kinoPodaci.projekcije.findIndex(proj => proj.film.toLowerCase() === filmNaziv);
    if (index >= 0) {
        trenutnaProjekcijaIndeks = index;
    }
}

function inicijalizujRezervacije() {
    const sačuvanRezervacije = localStorage.getItem('kinorerezervacije');
    if (sačuvanRezervacije) {
        try {
            rezervisanaSjedista = JSON.parse(sačuvanRezervacije);
            kinoPodaci.projekcije.forEach((projekcija) => {
                const filmKey = projekcija.film.replace(/\s+/g, '_');
                if (rezervisanaSjedista[filmKey]) {
                    projekcija.sjedista.forEach((sjediste) => {
                        const sjedisteKey = `${sjediste.red}_${sjediste.broj}`;
                        if (rezervisanaSjedista[filmKey].includes(sjedisteKey)) {
                            sjediste.status = 'rezervisano';
                        }
                    });
                }
            });
        } catch (e) {
            console.error('Greška pri učitavanju rezervacija:', e);
        }
    }
}

function spremiRezervaciju(film, red, broj) {
    const filmKey = film.replace(/\s+/g, '_');
    if (!rezervisanaSjedista[filmKey]) {
        rezervisanaSjedista[filmKey] = [];
    }
    const sjedisteKey = `${red}_${broj}`;
    if (!rezervisanaSjedista[filmKey].includes(sjedisteKey)) {
        rezervisanaSjedista[filmKey].push(sjedisteKey);
    }
    localStorage.setItem('kinorerezervacije', JSON.stringify(rezervisanaSjedista));
}

function prikaziPorukuKupovine(sjedista) {
    const poruka = document.createElement('div');
    poruka.className = 'poruka-rezervacije';
    poruka.innerHTML = `
        <div class="poruka-sadrzaj">
            <h3>✓ Uspješno kupljeno!</h3>
            <p>${sjedista}.</p>
        </div>
    `;
    document.body.appendChild(poruka);
    setTimeout(() => poruka.classList.add('prikaži'), 10);
    setTimeout(() => {
        poruka.classList.remove('prikaži');
        setTimeout(() => document.body.removeChild(poruka), 300);
    }, 3000);
}

function kupiOdabranaSjedista(projekcija) {
    const odabrana = projekcija.sjedista.filter(s => s.selected);
    if (!odabrana.length) return;

    odabrana.forEach((sjediste) => {
        sjediste.status = 'rezervisano';
        sjediste.selected = false;
        spremiRezervaciju(projekcija.film, sjediste.red, sjediste.broj);
    });

    const listaSjedista = odabrana.map(s => `${s.red}${s.broj}`).join(', ');
    prikaziPorukuKupovine(`Karte za: ${listaSjedista} su uspješno kupljene`);
    iscrtajSalu();
}

function prikaziPorukuRezervacije(red, broj) {
    const poruka = document.createElement('div');
    poruka.className = 'poruka-rezervacije';
    poruka.innerHTML = `
        <div class="poruka-sadrzaj">
            <h3>✓ Uspješna rezervacija!</h3>
            <p>Sjedište <strong>${red}${broj}</strong> je rezervisano.</p>
            <p>Rezervacija je sačuvana u vašem pretraživaču.</p>
        </div>
    `;
    document.body.appendChild(poruka);
    setTimeout(() => poruka.classList.add('prikaži'), 10);
    setTimeout(() => {
        poruka.classList.remove('prikaži');
        setTimeout(() => document.body.removeChild(poruka), 300);
    }, 3000);
}

function iscrtajSalu() {
    const kontejner = document.getElementById('sala');
    if (!kontejner) return;

    kontejner.innerHTML = '';

    if (!podaciValidni) {
        kontejner.innerHTML = '<p>Podaci nisu validni!</p>';
        return;
    }

    const projekcija = kinoPodaci.projekcije[trenutnaProjekcijaIndeks];

    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-header';
    infoDiv.innerHTML = `
        <h2>${projekcija.film}</h2>
        <p><strong>Vrijeme projekcije:</strong> ${projekcija.vrijeme}</p>
    `;

    const salaContent = document.createElement('div');
    salaContent.className = 'sala-content';

    const salaLayout = document.createElement('div');
    salaLayout.className = 'sala-layout';

    const platnoDiv = document.createElement('div');
    platnoDiv.className = 'platno-wrapper';
    platnoDiv.innerHTML = '<div class="platno">PLATNO</div>';

    const sjedistaGrid = document.createElement('div');
    sjedistaGrid.className = 'sjedista-grid';

    const redoviObj = {};
    projekcija.sjedista.forEach(s => {
        if (!redoviObj[s.red]) redoviObj[s.red] = [];
        redoviObj[s.red].push(s);
    });

    Object.entries(redoviObj).forEach(([imeReda, sjedistaURedu]) => {
        const redDiv = document.createElement('div');
        redDiv.className = 'red';
        const oznaka = document.createElement('span');
        oznaka.className = 'oznaka-reda';
        oznaka.innerText = imeReda;
        redDiv.appendChild(oznaka);

        sjedistaURedu.sort((a, b) => a.broj - b.broj).forEach(sjediste => {
            const sjedisteDiv = document.createElement('div');
            const statusKlase = [sjediste.status, sjediste.selected ? 'izabrano' : ''].filter(Boolean).join(' ');
            sjedisteDiv.className = `sjediste ${statusKlase}`;
            sjedisteDiv.title = `${sjediste.red}${sjediste.broj}`;
            sjedisteDiv.addEventListener('click', () => {
                if (sjediste.status === 'slobodno') {
                    sjediste.selected = !sjediste.selected;
                    iscrtajSalu();
                }
            });
            redDiv.appendChild(sjedisteDiv);
        });

        sjedistaGrid.appendChild(redDiv);
    });

    salaLayout.appendChild(platnoDiv);
    salaLayout.appendChild(sjedistaGrid);

    const rezervacijaPanel = document.createElement('aside');
    rezervacijaPanel.className = 'rezervacija-panel';

    const odabranaLista = projekcija.sjedista
        .filter(s => s.selected)
        .sort((a, b) => a.red.localeCompare(b.red) || a.broj - b.broj);

    rezervacijaPanel.innerHTML = `
        <div class="rezervacija-kartica">
            <h3>Rezervacija karata</h3>
            <div class="rezervacija-lista">
                ${odabranaLista.length ? odabranaLista.map(s => `<div class="rezervacija-item">★ ${s.red}${s.broj}</div>`).join('') : '<div class="rezervacija-prazno">Nema izabranih sjedišta</div>'}
            </div>
            <div class="rezervacija-meta">
                <p><span>Ime filma:</span> ${projekcija.film}</p>
                <p><span>Cijena karte:</span> 5 KM</p>
                <p><span>Ukupno:</span> ${odabranaLista.length * 5} KM</p>
            </div>
            <button class="kupi-dugme" ${odabranaLista.length === 0 ? 'disabled' : ''}>Kupi</button>
        </div>
    `;

    rezervacijaPanel.querySelector('.kupi-dugme').addEventListener('click', () => kupiOdabranaSjedista(projekcija));

    salaContent.appendChild(salaLayout);
    salaContent.appendChild(rezervacijaPanel);

    kontejner.appendChild(infoDiv);
    kontejner.appendChild(salaContent);

    const navigacijaDiv = document.createElement('div');
    navigacijaDiv.className = 'navigacija-sala';
    const btnPrethodna = document.createElement('button');
    btnPrethodna.innerText = 'Prethodna projekcija';
    btnPrethodna.disabled = trenutnaProjekcijaIndeks === 0;
    btnPrethodna.addEventListener('click', () => {
        if (trenutnaProjekcijaIndeks > 0) {
            trenutnaProjekcijaIndeks--;
            iscrtajSalu();
        }
    });

    const btnSljedeca = document.createElement('button');
    btnSljedeca.innerText = 'Sljedeća projekcija';
    btnSljedeca.disabled = trenutnaProjekcijaIndeks === kinoPodaci.projekcije.length - 1;
    btnSljedeca.addEventListener('click', () => {
        if (trenutnaProjekcijaIndeks < kinoPodaci.projekcije.length - 1) {
            trenutnaProjekcijaIndeks++;
            iscrtajSalu();
        }
    });

    navigacijaDiv.appendChild(btnPrethodna);
    navigacijaDiv.appendChild(btnSljedeca);
    kontejner.appendChild(navigacijaDiv);
}

// Pokrećemo iscrtavanje nakon što se stranice učitaju
document.addEventListener('DOMContentLoaded', () => {
    odrediProjekcijuIzQuery();
    inicijalizujRezervacije();
    iscrtajSalu();
});