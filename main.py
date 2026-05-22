# web-app-CAA/main.py
import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient
from ollama import Client as OllamaClient
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

load_dotenv()

# Configure verbose logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

BACKEND_TYPE = os.environ.get('BACKEND_TYPE', 'ollama')
LLM_HOST = os.environ.get('LLM_HOST', 'http://localhost:11434')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
LLM_MODEL = os.environ.get('LLM_MODEL', '')

logger.info("Application starting with configuration:")
logger.info(f"  BACKEND_TYPE: {BACKEND_TYPE}")
logger.info(f"  LLM_HOST: {LLM_HOST}")
logger.info(f"  LLM_MODEL: {LLM_MODEL}")
logger.info(f"  OPENAI_API_KEY: {'***' if OPENAI_API_KEY else 'Not set'}")

def llm_response(prompt):
    if BACKEND_TYPE.lower() == "ollama":
        ollama_client : OllamaClient = OllamaClient(host=LLM_HOST)
        response = ollama_client.chat(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            format="json"
        )
        response_content = response["message"]["content"]
    elif BACKEND_TYPE.lower() == "openai":
        openai_client : OpenAIClient = OpenAIClient(base_url=LLM_HOST, api_key=OPENAI_API_KEY)
        response = openai_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            response_format={"type": "json_object"}
        )
        response_content = response.choices[0].message.content
    else:
        raise ValueError("Unknown backend type after client instantiation.")

    return str(response_content)

logger.info("LLM client initialized successfully")

# Load the RAG knowledge from the JSON file
try:
    logger.info("Loading RAG knowledge from rag_knowledge.json")
    with open('rag_knowledge.json', 'r') as f:
        rag_data = json.load(f)
    logger.info(f"RAG knowledge loaded successfully. Keys: {list(rag_data.keys())}")
except Exception as e:
    logger.error(f"Failed to load RAG knowledge: {e}")
    raise

def format_rag_knowledge(data):
    """Formats the RAG JSON data for the present tense into a readable string for the prompt."""
    logger.debug("Formatting RAG knowledge for present tense")

    # Access the nested dictionary for the present tense rules
    presente_data = data['presente_indicativo']

    knowledge = "**Regole Generali di Coniugazione Regolare:**\n"
    # Iterate through the corrected nested structure
    for rule, details in presente_data['general_rules'].items():
        knowledge += f"- {rule}: {details['conjugation']}\n"

    knowledge += "\n**Verbi Irregolari Comuni (Esempi Chiave):**\n"
    # Iterate through the corrected nested structure
    for verb, details in presente_data['irregular_verbs'].items():
        knowledge += f"- **{verb}**: {details['conjugation']}\n"

    logger.debug(f"Formatted RAG knowledge length: {len(knowledge)} characters")
    return knowledge

def get_conjugated_forms(sentence, base_forms, tense):
    """
    Asks a more advanced AI model to conjugate verbs using tense-specific prompts
    augmented with RAG-style knowledge from a JSON file.
    """
    logger.info(f"Starting conjugation process - Tense: {tense}, Sentence: '{sentence}', Base forms: {base_forms}")

    print(f"tense: {tense}")

    rag_knowledge_string = format_rag_knowledge(rag_data)

    prompt_presente = f"""
        Sei un meticoloso esperto di grammatica italiana. Il tuo compito è coniugare una lista di verbi al Presente Indicativo in base al soggetto trovato nella frase.

        **CONOSCENZA DI RIFERIMENTO (RAG):**
        - Mappatura Soggetto-Pronome: {json.dumps(rag_data['subject_pronoun_mapping']['mapping'])}
        - Coniugazioni Presente: {rag_knowledge_string}

        **Regole di Logica del Soggetto (OBBLIGATORIE):**
        1.  **Priorità al Pronome Esplicito**: Se nella frase è presente un pronome esplicito ("io", "tu", "lui", "lei", "noi", "voi", "loro"), USA SEMPRE QUELLO per la coniugazione, anche se sono presenti altri sostantivi.
        2.  **Usa la Mappatura**: Se non ci sono pronomi espliciti, cerca un sostantivo mappato (es. "mamma", "papà"). Usa il pronome corrispondente (es. "lei", "lui") per la coniugazione.
        3.  **Nessun Soggetto Trovato**: Se non ci sono né pronomi né sostantivi mappati, restituisci i verbi all'infinito.
        4.  **AVVERTENZA**: La prima persona singolare ("io") deve essere esplicita. Un sostantivo come "mamma" non può MAI essere coniugato alla prima persona. "Mamma" è SEMPRE terza persona ("lei").
        5.  **Verbi Modali**: Se la frase contiene un verbo modale (volere, potere, dovere), il verbo che segue deve rimanere all'infinito. Esempio: "Io volere mangiare" -> "voglio mangiare". Coniuga solo il verbo modale.

        **Formato Output Obbligatorio:**
        - Rispondi SOLO con un oggetto JSON valido che mappa ogni verbo infinito alla sua forma coniugata. Non includere spiegazioni o markdown.

        ---
        **ESEMPI OBBLIGATORI:**
        - Frase: "Io", Verbi: ["essere", "mangiare"] -> Output: {{"essere": "sono", "mangiare": "mangio"}}
        - Frase: "Mamma", Verbi: ["essere", "volere"] -> Output: {{"essere": "è", "volere": "vuole"}}
        - Frase: "Mamma e papà", Verbi: ["andare"] -> Output: {{"andare": "vanno"}}
        - Frase: "Io e la mamma", Verbi: ["andare"] -> Output: {{"andare": "andiamo"}}
        - Frase: "Volere una mela", Verbi: ["volere"] -> Output: {{"volere": "volere"}}
        ---

        Ora, esegui il compito per la seguente richiesta:
        - Frase: "{sentence}"
        - Verbi: {base_forms}
        """

    print(f"Prompt Presente: {prompt_presente}")

    # Corrected prompt_passato in main.py

    prompt_passato = f"""
        Sei un meticoloso esperto di grammatica italiana. Il tuo compito è coniugare una lista di verbi al **Passato Prossimo** in base al pronome soggetto.

        **CONOSCENZA DI RIFERIMENTO (RAG):**
        Il Passato Prossimo si forma con il presente di 'essere' o 'avere' + il participio passato del verbo.
        - Participi regolari: {rag_data['passato_prossimo']['regular_participles']}
        - **Participi irregolari comuni**:
          - essere -> {rag_data['passato_prossimo']['irregular_participles']['essere']}
          - avere -> {rag_data['passato_prossimo']['irregular_participles']['avere']}
          - fare -> {rag_data['passato_prossimo']['irregular_participles']['fare']}
          - dire -> {rag_data['passato_prossimo']['irregular_participles']['dire']}
          - leggere -> {rag_data['passato_prossimo']['irregular_participles']['leggere']}
          - vedere -> {rag_data['passato_prossimo']['irregular_participles']['vedere']}
          - venire -> {rag_data['passato_prossimo']['irregular_participles']['venire']}
          - rimanere -> {rag_data['passato_prossimo']['irregular_participles']['rimanere']}
        - **Uso di 'essere'**: {rag_data['passato_prossimo']['auxiliary_choice']['essere']['rule']}
        ---

        Segui queste regole con precisione:
        1.  **Identifica il Soggetto**: Nella 'Frase', trova il pronome soggetto.
        2.  **Usa solo la forma attiva, MAI la forma passiva.**
        3.  **Coniuga i Verbi**: Usando la conoscenza di riferimento, coniuga ogni verbo in 'Verbi' al **Passato Prossimo**, scegliendo l'ausiliare corretto.
        4.  **Gestisci Assenza di Soggetto**: Se la 'Frase' non contiene un pronome, restituisci i verbi all'infinito.
        5.  **Formato Output**: Rispondi SOLO con un oggetto JSON valido.

        ---
        **ESEMPI OBBLIGATORI:**
        - Frase: "Io", Verbi: ["andare", "mangiare", "volere"]
        - Output: {{"andare": "sono andato", "mangiare": "ho mangiato", "volere": "ho voluto"}}

        - Frase: "Lui", Verbi: ["essere", "finire", "leggere"]
        - Output: {{"essere": "è stato", "finire": "ha finito", "leggere": "ha letto"}}

        - Frase: "Noi", Verbi: ["potere", "avere", "aiutare"]
        - Output: {{"potere": "abbiamo potuto", "avere": "abbiamo avuto", "aiutare": "abbiamo aiutato"}}
        ---

        Ora, esegui il compito per la seguente richiesta:
        - Frase: "{sentence}"
        - Verbi: {base_forms}
        """

    print(f"Prompt Passato: {prompt_passato}")

    prompt_futuro = f"""
        Sei un esperto infallibile di grammatica italiana. Il tuo compito è coniugare una lista di verbi al **Futuro Semplice**.

        **CONOSCENZA DI RIFERIMENTO (RAG):**
        - Mappatura Soggetto-Pronome: {json.dumps(rag_data['subject_pronoun_mapping']['mapping'])}
        - Radici irregolari comuni: {json.dumps(rag_data['futuro_semplice']['irregular_roots'])}
        - Desinenze Future: {rag_data['futuro_semplice']['endings']}

        **Regole di Logica del Soggetto (OBBLIGATORIE):**
        1.  **Priorità al Pronome Esplicito**: Se nella frase è presente un pronome esplicito ("io", "tu", "lui", "lei", "noi", "voi", "loro"), USA SEMPRE QUELLO per la coniugazione.
        2.  **Usa la Mappatura**: Se non ci sono pronomi espliciti, cerca un sostantivo mappato (es. "mamma"). Usa il pronome corrispondente (es. "lei") per determinare la coniugazione.
        3.  **Nessun Soggetto Trovato**: Se non ci sono né pronomi né sostantivi mappati, restituisci i verbi all'infinito.
        4.  **AVVERTENZA**: Un sostantivo come "mamma" non può MAI essere coniugato alla prima persona ("io"). "Mamma" è SEMPRE terza persona ("lei").

        **Formato di Output Obbligatorio:**
        - Rispondi SOLO con un oggetto JSON valido. Non includere spiegazioni o markdown.

        ---
        **ESEMPI OBBLIGATORI:**
        - Frase: "Io", Verbi: ["essere", "mangiare"] -> Output: {{"essere": "sarò", "mangiare": "mangerò"}}
        - Frase: "Mamma", Verbi: ["essere", "andare"] -> Output: {{"essere": "sarà", "andare": "andrà"}}
        - Frase: "Noi", Verbi: ["avere", "fare"] -> Output: {{"avere": "avremo", "fare": "faremo"}}
        - Frase: "Io e la mamma", Verbi: ["vedere"] -> Output: {{"vedere": "vedremo"}}
        ---

        Ora, esegui il compito per la seguente richiesta:
        - Frase: "{sentence}"
        - Verbi: {base_forms}
        """

    print(f"Prompt Futuro: {prompt_futuro}")

    # --- CHOOSE PROMPT BASED ON TENSE ---
    if tense == 'passato':
        prompt = prompt_passato.strip()
        logger.debug("Selected passato prompt")
    elif tense == 'futuro':
        prompt = prompt_futuro.strip()
        logger.debug("Selected futuro prompt")
    else: # Default to presente
        prompt = prompt_presente.strip()
        logger.debug("Selected presente prompt (default)")

    logger.debug(f"Final prompt length: {len(prompt)} characters")

    try:
        logger.info(f"Sending request to LLM model: {LLM_MODEL}")
        start_time = datetime.now()

        response = llm_response(prompt)

        end_time = datetime.now()
        logger.info(f"LLM response received in {(end_time - start_time).total_seconds():.2f} seconds")

        print(f"LLM Response: {response}")
        logger.debug(f"Raw LLM response: {response}")

        conjugated_map = json.loads(response.strip())

        print(f"LLM Conjugated: {conjugated_map}")
        logger.info(f"Successfully parsed conjugated forms: {conjugated_map}")

        return conjugated_map

    except Exception as e:
        logger.error(f"Error during AI conjugation. Input sentence: '{sentence}', Base forms: {base_forms}. Error: {e}")
        print(f"Error during AI conjugation. Input sentence: '{sentence}', Base forms: {base_forms}. Error: {e}")
        # Return a map that reverts all verbs to their base form on error
        fallback_result = {verb: verb for verb in base_forms}
        logger.warning(f"Returning fallback result: {fallback_result}")
        return fallback_result

def correct_sentence(sentence):
    """
    Asks the AI model to correct and complete an Italian sentence.
    """
    logger.info(f"Starting sentence correction for: '{sentence}'")

    prompt = f"""
        Sei un assistente linguistico italiano. Il tuo compito è prendere una frase composta da parole chiave (sostantivi, verbi all'infinito, aggettivi) e trasformarla in una frase italiana grammaticalmente corretta e naturale.

        Regole:
        1. Aggiungi gli articoli necessari (es. "il", "la", "un'", "i").
        2. Aggiungi le preposizioni articolate (es. "al", "dello", "nella").
        3. Assicura la coerenza tra singolare e plurale.
        4. Mantieni l'intento originale della frase.
        5. La tua risposta deve contenere SOLO la frase corretta, senza alcuna spiegazione o testo aggiuntivo questo é OBBLIGATORIO.

        Esempi:
        - Input: "Io volere mangiare pizza"
        - Output: "Io voglio mangiare la pizza"

        - Input: "Lei andare casa"
        - Output: "Lei va a casa"

        - Input: "Loro essere felice"
        - Output: "Loro sono felici"

        - Input: "Gatto su tavolo"
        - Output: "Il gatto è sul tavolo"

        - Input: "bambini giocare palla parco"
        - Output: "I bambini giocano a palla al parco"

        Ora, esegui il compito per la seguente richiesta:
        - Input: "{sentence}"
    """

    logger.debug(f"Sentence correction prompt length: {len(prompt)} characters")

    try:
        logger.info(f"Sending sentence correction request to LLM model: {LLM_MODEL}")
        start_time = datetime.now()

        response = llm_response(prompt)

        end_time = datetime.now()
        logger.info(f"Sentence correction response received in {(end_time - start_time).total_seconds():.2f} seconds")

        corrected_sentence = response.strip()
        logger.info(f"Sentence corrected successfully: '{sentence}' -> '{corrected_sentence}'")
        return corrected_sentence

    except Exception as e:
        logger.error(f"Error during AI sentence correction. Input sentence: '{sentence}'. Error: {e}")
        print(f"Error during AI sentence correction. Input sentence: '{sentence}'. Error: {e}")
        # Return the original sentence on error
        logger.warning(f"Returning original sentence due to error: '{sentence}'")
        return sentence

@app.route('/conjugate', methods=['POST'])
def conjugate():
    logger.info("Received conjugate request")
    data = request.get_json()
    sentence = data.get('sentence', '').strip()
    base_forms = data.get('base_forms', [])
    tense = data.get('tense', 'presente')

    logger.info(f"Conjugate request details - Sentence: '{sentence}', Base forms: {base_forms}, Tense: {tense}")
    print(f"Received sentence: {sentence}")

    if not base_forms:
        logger.warning("No base forms provided, returning empty response")
        return jsonify({})

    conjugations = get_conjugated_forms(sentence, base_forms, tense)
    logger.info(f"Conjugate request completed successfully with result: {conjugations}")
    return jsonify(conjugations)

@app.route('/correct', methods=['POST'])
def correct():
    logger.info("Received correct request")
    data = request.get_json()
    sentence = data.get('sentence', '')

    logger.info(f"Correct request details - Sentence: '{sentence}'")

    if not sentence:
        logger.warning("Empty sentence provided, returning empty response")
        return jsonify({"corrected_sentence": ""})

    corrected = correct_sentence(sentence)
    logger.info(f"Correct request completed successfully: '{sentence}' -> '{corrected}'")
    return jsonify({"corrected_sentence": corrected})

if __name__ == '__main__':
    logger.info("Starting Flask application on host=0.0.0.0, port=5000, debug=True")
    app.run(host='0.0.0.0', port=5000, debug=True)