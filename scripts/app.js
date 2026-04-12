// app.js

// Funkcija za generisanje testnih sjedišta (8 redova, 10 sjedišta)
function generisiSjedista() {
    const sjedista = [];
    const redovi = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const statusi = ['slobodno', 'zauzeto', 'rezervisano'];

    for (let r of redovi) {
        for (let i = 1; i <= 10; i++) {
            // Nasumičan status za testiranje
            const randomStatus = statusi[Math.floor(Math.random() * statusi.length)];
            sjedista.push({ red: r, broj: i, status: randomStatus });
        }
    }
    return sjedista;
}

// Objekat sa podacima o projekcijama
const kinoPodaci = {
    projekcije: [
        {
            film: "John Wick 4",
            vrijeme: "18:00",
            sjedista: generisiSjedista()
        },
        {
            film: "Oppenheimer",
            vrijeme: "20:00",
            sjedista: generisiSjedista()
        },
        {
            film: "Fast X",
            vrijeme: "22:30",
            sjedista: generisiSjedista()
        },
        {
            film: "Barbie",
            vrijeme: "16:45",
            sjedista: generisiSjedista()
        },
        {
            film: "Spider-Man",
            vrijeme: "19:15",
            sjedista: generisiSjedista()
        },
        {
            film: "Die Hard",
            vrijeme: "21:30",
            sjedista: generisiSjedista()
        }
    ]
};

// Validacija podataka (odmah prilikom učitavanja)
function validirajPodatke(podaci) {
    if (!podaci || !podaci.projekcije || podaci.projekcije.length === 0) {
        return false;
    }
    
    for (let proj of podaci.projekcije) {
        if (!proj.sjedista) return false;
        for (let sjediste of proj.sjedista) {
            if (!['slobodno', 'zauzeto', 'rezervisano'].includes(sjediste.status)) {
                return false;
            }
        }
    }
    return true;
}

const podaciValidni = validirajPodatke(kinoPodaci);