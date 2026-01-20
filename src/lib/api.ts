const testing = false;
const getUrl = (testing: boolean, path: string) => {
  return testing ? new URL(`http://localhost:3000/${path}`) : new URL(`https://transity-sweph-server.onrender.com/${path}`);
}
/**
 * Funzione per calcolare i transiti astronomici di un pianeta specifico
 * @param datetime - Data e ora in formato ISO string (es. "2025-07-01T12:00:00Z")
 * @param planet - Codice del pianeta (es. "SE_SUN", "SE_MOON", ecc.)
 * @returns Promise con i dati del transito
 */
export async function fetchTransits(datetime: string, planet: string) {
  // URL del microservizio - per sviluppo locale
  const url = getUrl(testing, 'transit');

  // Aggiungiamo i parametri alla query string
  url.searchParams.append('datetime', datetime);
  url.searchParams.append('planet', planet);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Errore dal microservizio');
  return await res.json();
}

/**
 * Funzione per calcolare una carta astrologica completa
 * @param datetime - Data e ora in formato ISO string
 * @param latitude - Latitudine del luogo di nascita (es. 45.4642)
 * @param longitude - Longitudine del luogo di nascita (es. 9.1900)
 * @returns Promise con i dati della carta astrologica (pianeti, case, angoli)
 */
export async function fetchChart(datetime: string, latitude: number, longitude: number) {
  const url = getUrl(testing, 'chart');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      datetime,
      latitude,
      longitude,
    }),
  });

  if (!res.ok) {
    throw new Error(`Errore dal server: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Funzione per calcolare il tema natale completo con posizioni planetarie e case
 * @param datetime - Data e ora di nascita in formato ISO string
 * @param latitude - Latitudine del luogo di nascita
 * @param longitude - Longitudine del luogo di nascita
 * @param timezone - Fuso orario (opzionale)
 * @returns Promise con il tema natale completo
 */
export async function fetchTemaNatale(datetime: string, latitude: number, longitude: number, timezone: number = 0) {
  const url = getUrl(testing, 'tema-natale');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      datetime,
      latitude,
      longitude,
      timezone,
    }),
  });

  if (!res.ok) {
    throw new Error(`Errore dal server: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Funzione per ottenere la tabella mensile dei transiti
 * @param startDate - Data di inizio (es. "2025-07-01")
 * @param endDate - Data di fine (es. "2026-06-30")
 * @returns Promise con i transiti mensili
 */
export async function fetchTransitiMensili(startDate: string, endDate: string) {
  const url = getUrl(testing, 'transiti-mensili');

  url.searchParams.append('startDate', startDate);
  url.searchParams.append('endDate', endDate);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Errore nel recupero transiti mensili');
  return await res.json();
}

/**
 * Funzione per calcolare i transiti specifici per una data futura
 * @param targetDate - Data target per i transiti (es. "2025-12-25")
 * @param natalData - Dati natali opzionali per calcolare aspetti
 * @returns Promise con i transiti per la data specificata (filtrati per orb)
 * 
 * Regole di filtraggio:
 * - Orb = 0: linea grossa (sempre incluso)
 * - Plutone/Nettuno: 0 < orb ≤ 1 (linea sottile), orb > 1 (ignorato)
 * - Altri pianeti: 0 < orb ≤ 2 (linea sottile), orb > 2 (ignorato)
 */
export async function fetchTransitiSpecifici(targetDate: string, natalData?: any) {
  const url = getUrl(testing, 'transiti-specifici');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetDate,
      natalData,
    }),
  });

  if (!res.ok) {
    throw new Error(`Errore nel calcolo transiti specifici: ${res.status} ${res.statusText}`);
  }

  const rawData = await res.json();

  // Applica i filtri di orb agli aspetti
  if (rawData && rawData.aspettiDiTransito && Array.isArray(rawData.aspettiDiTransito)) {
    rawData.aspettiDiTransito = rawData.aspettiDiTransito
      .map((aspectGroup: any) => {
        if (!aspectGroup.aspects || !Array.isArray(aspectGroup.aspects)) {
          return aspectGroup;
        }

        // Filtra gli aspetti basandosi sull'orb e il pianeta di transito
        const filteredAspects = aspectGroup.aspects.filter((aspect: any) => {
          const orb = parseFloat(aspect.orb);
          const transitPlanet = aspectGroup.transitPlanet;

          // Regole di filtraggio:
          // Orb a 0: linea grossa (sempre incluso)
          if (orb === 0) {
            return true;
          }

          // Per Plutone e Nettuno: maggiore di 0 e fino a 1 linea sottile, maggiore di 1 ignorato
          if (transitPlanet === 'Plutone' || transitPlanet === 'Nettuno') {
            return orb > 0 && orb <= 1;
          }

          // Per il resto: maggiore di 0 fino a 2 linea sottile, maggiore di 2 ignorato
          return orb > 0 && orb <= 2;
        });

        // Restituisci il gruppo solo se ha aspetti filtrati
        return {
          ...aspectGroup,
          aspects: filteredAspects
        };
      })
      .filter((aspectGroup: any) => aspectGroup.aspects && aspectGroup.aspects.length > 0);
  }

  return rawData;
}

/**
 * Funzione per ottenere la tabella annuale completa
 * @param year - Anno di riferimento (es. 2025)
 * @returns Promise con la tabella annuale
 */
export async function fetchTabellaAnno(year: number) {
  const url = getUrl(testing, 'tabella-anno');

  url.searchParams.append('year', year.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Errore nel recupero tabella annuale');
  return await res.json();
}