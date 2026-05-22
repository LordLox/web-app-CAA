# Applicazione Web CAA (Comunicazione Aumentativa e Alternativa)

Un sistema web di Comunicazione Aumentativa e Alternativa (CAA) che aiuta gli utenti a comunicare attraverso griglie personalizzabili con simboli, immagini e funzionalità text-to-speech.

## Funzionalità

- **Griglie di Comunicazione Personalizzabili**: Crea e modifica tavole di comunicazione con simboli e testo
- **Autenticazione Utente**: Sistema sicuro di login e registrazione
- **Text-to-Speech (Sintesi Vocale)**: Sintesi vocale potenziata dall'intelligenza artificiale
- **Editor di Griglie**: Editor visivo per creare e personalizzare i layout di comunicazione
- **Supporto Multilingua**: Interfaccia disponibile in italiano e inglese
- **Design Responsivo**: Funziona su dispositivi desktop e mobile
- **Persistenza dei Dati**: Le griglie e le preferenze degli utenti sono memorizzate in modo sicuro
- **Supporto Docker**: Distribuzione facile tramite containerizzazione
- **Integrazione AI**: Supporto sia per API remote (es. OpenAI) sia per modelli locali (Ollama)

## Stack Tecnologico

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Material Icons per gli elementi della UI
- Iro.js per le funzionalità di color picker
- Design responsivo con supporto mobile

### Backend
- **Server Node.js** (`server.js`): Server API Express.js per la gestione dei dati delle griglie
- **API Python Flask** (`main.py`): Servizi AI/ML per text-to-speech e l'elaborazione del linguaggio
- **Database**: SQLite/MariaDB con ORM Sequelize
- **Autenticazione**: Token JWT con hashing delle password bcrypt

### Infrastruttura
- Container Docker sia per il frontend che per il backend
- Docker Compose per l'orchestrazione
- Configurazione basata su variabili d'ambiente

## Prerequisiti

- **Docker e Docker Compose**: Fortemente raccomandati per avviare il progetto nel modo più semplice e affidabile.
- *(Opzionale, per sviluppo locale senza Docker)*: Node.js 22+, Python 3.10+

## Installazione e Avvio Rapido

Il modo consigliato e più semplice per avviare il progetto è tramite Docker.

### 1. Clonare il repository
```bash
git clone <repository-url>
cd web-app-CAA
```

### 2. Configurazione dell'Ambiente (.env)
Il progetto utilizza le variabili d'ambiente per la configurazione. È necessario creare un file `.env` a partire dal file `.env.example` fornito.

```bash
cp .env.example .env
```

#### Configurazione dettagliata del file `.env`
Apri il file `.env` appena creato e configuralo secondo le tue necessità. Ecco tutte le possibili configurazioni:

**Impostazioni Generali e Frontend**
- `PUBLIC_URL`: L'URL da cui sarà accessibile il frontend (es. `http://localhost:3000`).
- `APP_HOST`: L'host per il server Node.js (lasciare `0.0.0.0` se si usa Docker).
- `APP_PORT`: La porta per il frontend (default `3000`).
- `JWT_SECRET`: Una stringa lunga e casuale usata per firmare i token JWT per l'autenticazione. **Da cambiare in produzione.**
- `BACKEND_BASE_URL`: L'URL a cui il frontend contatta l'API Flask del backend (default `http://backend:5000` con Docker).

**Configurazione Database**
- `DB_TYPE`: Il tipo di database (es. `sqlite` o `mariadb`).
- `DB_HOST`: L'hostname del database (es. `mariadb-host`).
- `DB_PORT`: La porta del database (es. `3306`).
- `DB_NAME`: Il nome del database (es. `caa_database`).
- `DB_USER`: Utente del database.
- `DB_PASSWORD`: Password del database.
Al momento si consiglia usare sqlite (DB_TYPE=sqlite), non sono necessarie le altre credenziali del database.

### 3. Configurazione Intelligenza Artificiale (OpenAI o Ollama)
Questo progetto richiede un backend AI per l'elaborazione del linguaggio. Puoi scegliere se utilizzare un provider remoto (come OpenAI) o eseguire un modello in locale usando Ollama.

#### Opzione A: Utilizzo di OpenAI (o API compatibili come OpenWebUI)
Se vuoi utilizzare OpenAI o un'API remota compatibile, imposta le seguenti variabili nel tuo `.env`:
```env
BACKEND_TYPE=openai
LLM_HOST=https://api.openai.com/v1  # Oppure l'URL del tuo server OpenWebUI
OPENAI_API_KEY=la-tua-api-key       # Inserisci la tua chiave API reale
LLM_MODEL=gpt-4o                    # Oppure il modello che preferisci (es. gpt-3.5-turbo)
```

#### Opzione B: Utilizzo di Ollama (AI in Locale, Gratuita)
Se preferisci eseguire l'AI in locale per motivi di privacy o per non avere costi, puoi usare Ollama.

**Passo 1: Installa ed avvia Ollama**
Scarica Ollama da [ollama.com](https://ollama.com/) e installalo sul tuo computer. Assicurati che sia in esecuzione.

**Passo 2: Scarica un modello**
Devi scaricare il modello linguistico che intendi utilizzare. Si consiglia `llama3.1:8b` per un ottimo bilanciamento tra prestazioni e velocità (come preimpostato in .env.example).
Esegui questo comando nel terminale del tuo computer:
```bash
ollama run llama3.1:8b
```
*(Attendi il completamento del download. Una volta scaricato, puoi digitare `/bye` per uscire dal prompt di Ollama).*

**Passo 3: Configura il `.env` per Ollama**
Modifica il tuo file `.env` per puntare alla tua istanza locale di Ollama decommentando la sezione Ollama e commentando quella OpenAI:
```env
BACKEND_TYPE=ollama
# Se usi Docker, usa host.docker.internal per far comunicare il container con l'host (il tuo PC dove gira Ollama).
# Su Linux, potresti dover usare l'indirizzo IP locale della tua macchina (es. 192.168.x.x) se host.docker.internal non funziona.
LLM_HOST=http://host.docker.internal:11434 
LLM_MODEL=llama3.1:8b
```

### 4. Avvio del Progetto

Una volta configurato correttamente il file `.env`, puoi costruire e avviare i container.

```bash
docker-compose up -d --build
```

---

## Utilizzo

### Primo Avvio
1. Vai sull'URL scelto
2. Registra un nuovo account o accedi con le tue credenziali
3. Completa il processo di configurazione iniziale
4. Inizia a creare le tue griglie di comunicazione

### Creare Griglie di Comunicazione
1. Entra in **Modalità Editor** usando il pulsante di modifica
2. Aggiungi simboli, testo e immagini alle celle della griglia
3. Personalizza i colori e il layout
4. Salva la tua configurazione
5. Esci dalla modalità editor per utilizzare la tavola di comunicazione

### Utilizzare il Comunicatore
- Clicca sui simboli/testo per ascoltare la loro pronuncia (tramite sintesi vocale)
- Naviga tra le diverse pagine della griglia
- Usa il menu account per accedere alle impostazioni

## Endpoint API

### Server Node.js (Porta 3000)
- `POST /api/auth/login` - Autenticazione utente
- `POST /api/auth/register` - Registrazione utente
- `GET /api/grids` - Recupera le griglie dell'utente
- `POST /api/grids` - Salva configurazione della griglia
- `PUT /api/grids/:id` - Aggiorna griglia
- `DELETE /api/grids/:id` - Elimina griglia

### API Python Flask (Porta 5000)
- `POST /api/tts` - Sintesi Text-to-speech
- `POST /api/process` - Elaborazione del linguaggio e funzionalità AI

## Struttura del Progetto

```text
web-app-CAA/
├── public/                 # File statici Frontend
│   ├── index.html         # Pagina principale
│   ├── login.html         # Pagina di login
│   ├── register.html      # Pagina di registrazione
│   ├── setup.html         # Pagina di setup iniziale
│   ├── script/            # File JavaScript
│   └── style/             # Fogli di stile CSS
├── server.js              # Server Node.js Express
├── main.py                # Server API Python Flask
├── database.js            # Configurazione database
├── docker-compose.yml     # Orchestrazione Docker
├── frontend.Dockerfile    # Container Frontend
├── backend.Dockerfile     # Container Backend
├── package.json           # Dipendenze Node.js
├── requirements.txt       # Dipendenze Python
└── README.md              # Questo file
```

## Sviluppo

### Aggiungere Nuove Funzionalità
- Il codice frontend va nella cartella `public/`
- Gli endpoint API del backend Node.js in `server.js`
- Le funzionalità AI/ML in `main.py`
- I modelli del database in `database.js`

### Test
- Assicurati che sia il server Node.js che quello Python si avviino senza errori
- Testa il flusso di autenticazione
- Verifica le funzionalità di creazione e modifica delle griglie
- Testa le funzioni text-to-speech

## Deploy in Produzione

1. Imposta `NODE_ENV=production` nel tuo ambiente (se supportato)
2. Usa un database da produzione (es. MariaDB, come da docker-compose)
3. Configura correttamente i certificati SSL
4. Usa un reverse proxy (es. Nginx) per gestire le connessioni HTTPS
5. Imposta sistemi adeguati di logging e monitoraggio
6. Avvia con Docker Compose:
```bash
docker-compose -f docker-compose.yml up -d --build
```

## Supporto

Per supporto o per segnalare problemi, per favore apri una issue sul repository o contatta il team di sviluppo.

## Riconoscimenti

- Material Design Icons per gli elementi dell'interfaccia
- OpenAI e Ollama per le capacità di intelligenza artificiale
- La comunità della CAA per l'ispirazione e i feedback
