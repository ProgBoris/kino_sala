// kinoSala.js

let trenutnaProjekcijaIndeks = 0;

function iscrtajSalu() {
    const kontejner = document.getElementById("sala");
    if (!kontejner) return;

    // Očisti prethodni sadržaj
    kontejner.innerHTML = "";

    // Provjera validnosti podataka
    if (!podaciValidni) {
        kontejner.innerHTML = "<p>Podaci nisu validni!</p>";
        return;
    }

    const projekcija = kinoPodaci.projekcije[trenutnaProjekcijaIndeks];

    // --- 1. Info Header ---
    const infoDiv = document.createElement("div");
    infoDiv.className = "info-header";
    infoDiv.innerHTML = `
        <h2>${projekcija.film}</h2>
        <p><strong>Vrijeme projekcije:</strong> ${projekcija.vrijeme}</p>
    `;
    kontejner.appendChild(infoDiv);

    // --- 2. Platno ---
    const platnoDiv = document.createElement("div");
    platnoDiv.className = "platno-wrapper";
    platnoDiv.innerHTML = `<div class="platno">PLATNO</div>`;
    kontejner.appendChild(platnoDiv);

    // --- 3. Raspored sjedišta ---
    const sjedistaGrid = document.createElement("div");
    sjedistaGrid.className = "sjedista-grid";

    // Grupisanje sjedišta po redovima
    const redoviObj = {};
    projekcija.sjedista.forEach(s => {
        if (!redoviObj[s.red]) redoviObj[s.red] = [];
        redoviObj[s.red].push(s);
    });

    // Iscrtavanje po redovima
    for (const [imeReda, sjedistaURedu] of Object.entries(redoviObj)) {
        const redDiv = document.createElement("div");
        redDiv.className = "red";
        
        const oznaka = document.createElement("span");
        oznaka.className = "oznaka-reda";
        oznaka.innerText = imeReda;
        redDiv.appendChild(oznaka);

        // Sortiramo sjedišta po broju unutar reda da budu ispravno poredana
        sjedistaURedu.sort((a, b) => a.broj - b.broj).forEach((sjediste, index) => {
            const sjedisteDiv = document.createElement("div");
            // Dodjeljujemo mu klase za stilizaciju (CSS iz prethodnog zadatka)
            sjedisteDiv.className = `sjediste ${sjediste.status}`;
            
            // Logika za klik na sjedište
            sjedisteDiv.addEventListener("click", () => {
                if (sjediste.status === "slobodno") {
                    // Mijenjamo status u podacima
                    sjediste.status = "rezervisano";
                    // Ponovo iscrtavamo cijelu salu da se promjena vidi
                    iscrtajSalu(); 
                }
            });

            redDiv.appendChild(sjedisteDiv);
        });

        sjedistaGrid.appendChild(redDiv);
    }
    kontejner.appendChild(sjedistaGrid);

    // --- 4. Navigacija ---
    const navigacijaDiv = document.createElement("div");
    navigacijaDiv.style.marginTop = "20px";
    navigacijaDiv.style.display = "flex";
    navigacijaDiv.style.justifyContent = "space-between";

    const btnPrethodna = document.createElement("button");
    btnPrethodna.innerText = "Prethodna projekcija";
    btnPrethodna.disabled = trenutnaProjekcijaIndeks === 0; // Onemogući ako je prva
    btnPrethodna.addEventListener("click", () => {
        if (trenutnaProjekcijaIndeks > 0) {
            trenutnaProjekcijaIndeks--;
            iscrtajSalu();
        }
    });

    const btnSljedeca = document.createElement("button");
    btnSljedeca.innerText = "Sljedeća projekcija";
    btnSljedeca.disabled = trenutnaProjekcijaIndeks === kinoPodaci.projekcije.length - 1; // Onemogući ako je zadnja
    btnSljedeca.addEventListener("click", () => {
        if (trenutnaProjekcijaIndeks < kinoPodaci.projekcije.length - 1) {
            trenutnaProjekcijaIndeks++;
            iscrtajSalu();
        }
    });

    navigacijaDiv.appendChild(btnPrethodna);
    navigacijaDiv.appendChild(btnSljedeca);
    kontejner.appendChild(navigacijaDiv);
}

// Pokrećemo iscrtavanje nakon što se stranica učita
document.addEventListener("DOMContentLoaded", iscrtajSalu);