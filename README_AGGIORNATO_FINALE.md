# 🌌 GetMyTransity-WebApp: Analisi dei Transiti Personalizzati

Un’applicazione web che permette all’utente di inserire i propri dati astrologici di nascita e ricevere una visualizzazione dettagliata dei **transiti planetari** rilevanti per un periodo scelto (es. 1 anno).

L’app restituisce:
- Una **tabella personalizzata** secondo criteri grafici precisi (come da modello PDF)
- **Bande temporali** che mostrano visivamente i periodi di attività di ogni transito
- Descrizioni simboliche come: `Plutone, 7a, ♉︎` su linee colorate
- Un pulsante per **stampare o esportare tutto in PDF**
- Funzioni di **backup, salvataggio e importazione dei profili utente** (dati del tema natale)

L’interfaccia sarà inizialmente in tre lingue: **italiano, tedesco e inglese**, con codice sorgente scritto in inglese.

---

## 🎯 Obiettivo del progetto

Creare una **web app 100% ospitata su Vercel**, senza CMS esterni, che includa:

### 1. Dati di input completi
- Nome e nota opzionale dell’utente
- Data e ora di nascita (in UT)
- Latitudine e longitudine
- Sistema delle case
- Pianeti e punti astrologici: Sole, Luna, Mercurio, Venere, Marte, Giove, Saturno, Urano, Nettuno, Plutone, Nodo Nord, Lilith, Chirone, AS, MC, Cuspidi delle 12 Case
- Selezione di tutti o solo alcuni elementi

### 2. Periodo di transito selezionabile
- Data di inizio e fine manuale
- Scorciatoie: +1 mese, +3 mesi, +6 mesi, +1 anno

### 3. Tabella dei risultati
- Righe = pianeti in transito
- Colonne = mesi
- Celle = bande colorate + testo descrittivo del transito (simboli inclusi)

---

## 🔧 Tecnologie scelte

| Componente | Tecnologia |
|-----------|-------------|
| Hosting + Deploy | [Vercel](https://vercel.com) |
| Frontend | HTML / JavaScript (Vanilla o React) |
| Backend API | Node.js + Serverless Functions |
| Calcoli astrologici | [Swiss Ephemeris](https://www.astro.com/swisseph/) (JS wrapper) |
| PDF export | jsPDF |
| Visualizzazione grafica | Chart.js o CSS/SVG personalizzato |
| Traduzioni (i18n) | JSON multilingua (IT, DE, EN) |

---

## ✅ Stato attuale

| Modulo | Stato | Note |
|--------|-------|------|
| 📄 Form di input | 🔲 Non iniziato | Basato sulla struttura PDF |
| ⚙️ Funzione di calcolo (API) | 🟡 In sviluppo | Swiss Ephemeris integrata |
| 📊 Tabella risultati | 🔲 Non iniziato | Riproduzione grafica esatta richiesta |
| 📈 Bande temporali | 🔲 Non iniziato | Layout da implementare con CSS/SVG |
| 📎 PDF export | 🔲 Non iniziato | Con descrizioni + bande grafiche |
| 💾 Backup profili | 🔲 Non iniziato | Salva/carica i dati utente localmente |
| 🌐 Traduzioni (i18n) | 🔲 Non iniziato | IT, DE, EN selezionabili |
| 🔐 Accesso limitato | 🔲 Non iniziato | Opzionale, in futuro |

---

## 🗺 Roadmap tecnica

### 1. Setup iniziale
- [x] Creazione progetto su Vercel
- [x] Integrazione repo GitHub
- [x] Creazione struttura `api/` e `frontend/`
- [x] Ambiente di test (locale o online)

### 2. Backend – Calcoli dei transiti
- [x] Installazione Swiss Ephemeris
- [x] API che riceve tutti i dati del tema natale
- [x] Restituzione transiti in formato JSON compatibile con tabella
- [x] Pubblicazione solo del modulo AGPL (open-source)

Dettagli:
- [x] Fase successiva: separazione Swiss Ephemeris (AGPL)
- [x] Isolare il modulo Swiss Ephemeris (AGPL) in un microservizio separato
- [x] Pubblicarlo in un repository pubblico AGPL (es. transity-sweph-service)
- [x] Esporre endpoint API come `/transit?datetime=...&lat=...`
- [x] Dal progetto principale (MIT) accedere a questi endpoint via fetch
- [ ] Garantire conformità legale tra codice AGPL e codice proprietario
- 
il modulo attuale è basato su https://github.com/Miccer8/transity-sweph-service

### 3. Frontend – Interfaccia utente
- [ ] Creazione form completo di input
- [ ] Selettore periodo
- [ ] Traduzione testi (i18n)
- [ ] Visualizzazione tabella con bande e simboli astrologici
- [ ] Esportazione PDF
- [ ] Backup e importazione dei profili salvati

### 4. Sicurezza e privacy
- [ ] Nessun dato personale salvato lato server (solo calcolo live)
- [ ] Bozza iniziale di **Privacy Policy** da preparare

---

## ⚖️ Licenze e struttura legale del progetto

Per rispettare la licenza **AGPL** della libreria Swiss Ephemeris:

- Il codice che integra Swiss Ephemeris sarà isolato (`/api/calculate-transits.js`)
- Solo questo modulo sarà pubblicato come open-source con licenza **AGPL**
- Tutto il resto del progetto sarà mantenuto **privato o sotto licenza MIT**

### 📌 Obblighi futuri

- Creare file `LICENSE` AGPL e MIT separati
- Pubblicare su GitHub solo il modulo obbligato
- Mantenere il resto del codice riservato

---

## 🗃 File utili

- `docs/Registro.md` → log giornaliero dei progressi (via Transity-Log-GPT)
- `docs/Domande.md` → appunti, bug, idee future
- `LICENSE` (da creare: MIT per il progetto, AGPL per la funzione Swiss Ephemeris)

---

## 👤 Autore

Sviluppato da [TUO NOME] con assistenza GPT.  
Struttura e logica ispirate al documento "Bozza Transity-Webapp".  
Linguaggio di programmazione: **inglese**  
Lingue supportate: **italiano, tedesco, inglese**

---

## 💡 Come usare questo README con GPT

Per continuare a lavorare con ChatGPT (o un collaboratore umano), inizia ogni nuova sessione allegando questo file `README_AGGIORNATO_FINALE.md` e, se possibile, anche `Registro.md` con i log più recenti.

Includi anche:
- eventuali file aggiornati (`api/*.js`, `frontend/*.html`, ecc.)
- una frase guida come: “Voglio continuare dal punto XY della roadmap”

Questo README contiene tutte le istruzioni e scelte di progetto necessarie per riprendere il lavoro in modo coerente, preciso e conforme alle licenze.


-----------------------------------------------------
-----------------------------------------------------

## Continuità con il lavoro con ChatGPT

Perfetto!
Ecco la tua **checklist ufficiale** dei dati e documenti da fornirmi ogni volta che apri una nuova chat, in modo che io possa **riprendere esattamente da dove abbiamo lasciato**, senza perdere il filo.

-----------------------------------------------------

# ✅ Checklist "Continuità Lavoro – Transity-App"

### 📄 1. `README.md` (sempre necessario)

Contiene:

* Obiettivo del progetto
* Funzionalità previste
* Roadmap tecnica
* Tecnologie usate

✅ Mi serve **sempre** per ricostruire il contesto.

---

### 🗓 2. `docs/Registro.md` (facoltativo ma consigliato)

Contiene:

* Log giornalieri dei tuoi progressi
* Generato tramite il tuo Custom GPT “Transity-Log-GPT”

✅ Mi aiuta a sapere cosa è stato fatto di recente, e dove ti sei fermato.

---

### 🧾 3. Qualsiasi **codice sorgente o file tecnico** su cui stiamo lavorando:

Esempi:

* `api/transits.js` (funzione di calcolo dei transiti)
* `frontend/index.html` (interfaccia del form)
* `data/sample-input.json` (dati di esempio per i test)
* `pdf-template.html` (se sviluppiamo la versione stampabile)

✅ Serve **solo se dobbiamo modificarlo o correggerlo** insieme.

---

### 🖼 4. Mockup / Screenshot aggiornato (solo se stai progettando un nuovo layout)

✅ Invia **solo se ci sono modifiche grafiche da valutare**.

---

### 🧭 5. Una frase di orientamento (opzionale ma molto utile)

Per esempio:

> "Voglio continuare con la funzione di calcolo dei transiti"
> "Mi sono fermato alla costruzione della tabella"
> "Oggi voglio collegare il frontend alla API"

✅ Mi permette di agire **subito** sul punto giusto, senza dover indovinare.

---

## 📦 In breve, allega sempre:

1. ✅ `README.md`
2. ✅ Ultima versione aggiornata di `Registro.md`
3. ✅ I file su cui vuoi lavorare
4. 🧭 Una frase tipo: “Continuiamo da…”

-----------------------------------------------------
-----------------------------------------------------
-----------------------------------------------------
