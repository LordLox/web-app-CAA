/**
 * default-grid.js
 * * This file contains the default structure for a new user's grid.
 * By centralizing it on the server, we ensure that every new user
 * gets a consistent and correctly structured initial setup.
 */
const defaultGrid = {
    home: [
        { id: 'sym-yes', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/5584', label: 'Sì', text: 'sì', speak: 'sì', symbol_type: 'altro', color: '#CAFFBF', is_visible: true },
        { id: 'sym-no', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/5526', label: 'No', text: 'no', speak: 'no', symbol_type: 'altro', color: '#FFADAD', is_visible: true },
        { id: 'sym-more', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/37162', label: 'Ancora', text: 'ancora', speak: 'ancora', symbol_type: 'altro', color: '#FFD6A5', is_visible: true },
        { id: 'sym-enough', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/28429', label: 'Basta', text: 'basta', speak: 'basta', symbol_type: 'altro', color: '#FFADAD', is_visible: true },
        { id: 'sym-iwant', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/5441', label: 'Io voglio', text: 'io voglio', speak: 'io voglio', symbol_type: 'verbo', color: '#9BF6FF', is_visible: true },
        { id: 'cat-people', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/7117', label: 'Persone', target: 'people', color: '#A0C4FF', is_visible: true },
        { id: 'cat-actions', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/7297', label: 'Azioni', target: 'actions', color: '#CAFFBF', is_visible: true },
        { id: 'cat-places', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/32598', label: 'Luoghi', target: 'places', color: '#9BF6FF', is_visible: true },
        { id: 'cat-foodbev', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/32602', label: 'Cibi e Bevande', target: 'foodbev', color: '#FFD6A5', is_visible: true },
        { id: 'cat-toys', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/9813', label: 'Giochi', target: 'toys', color: '#FFC6FF', is_visible: true },
    ],
    people: [
        { id: 'sym-io', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/6632', label: 'Io', text: 'io', speak: 'io', symbol_type: 'nome', color: '#A0C4FF', is_visible: true },
        { id: 'sym-mom', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/2458', label: 'Mamma', text: 'mamma', speak: 'mamma', symbol_type: 'nome', color: '#FFADAD', is_visible: true },
        { id: 'sym-dad', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/2459', label: 'Papà', text: 'papà', speak: 'papà', symbol_type: 'nome', color: '#FFD6A5', is_visible: true },
        { id: 'sym-teacher', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/32766', label: 'Maestra', text: 'maestra', speak: 'maestra', symbol_type: 'nome', color: '#CAFFBF', is_visible: true },
    ],
    actions: [ 
        { id: 'sym-eat', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/6456', label: 'Mangiare', text: 'mangiare', speak: 'mangiare', symbol_type: 'verbo', color: '#FDFFB6', is_visible: true },
        { id: 'sym-drink', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/14739', label: 'Bere', text: 'bere', speak: 'bere', symbol_type: 'verbo', color: '#9BF6FF', is_visible: true },
        { id: 'sym-play', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/16183', label: 'Giocare', text: 'giocare', speak: 'giocare', symbol_type: 'verbo', color: '#FFC6FF', is_visible: true }
    ],
    places: [
        { id: 'sym-home', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/13936', label: 'Casa', text: 'casa', speak: 'casa', symbol_type: 'nome', color: '#FFD6A5', is_visible: true },
        { id: 'sym-school', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/7888', label: 'Scuola', text: 'scuola', speak: 'scuola', symbol_type: 'nome', color: '#BDB2FF', is_visible: true },
        { id: 'sym-park', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/22154', label: 'Parco', text: 'parco', speak: 'parco', symbol_type: 'nome', color: '#CAFFBF', is_visible: true },
    ],
    foodbev: [ 
        { id: 'sym-water', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/4622', label: 'Acqua', text: 'acqua', speak: 'acqua', symbol_type: 'nome', color: '#9BF6FF', is_visible: true },
        { id: 'sym-juice', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/20263', label: 'Succo', text: 'succo', speak: 'succo', symbol_type: 'nome', color: '#FFD6A5', is_visible: true },
        { id: 'sym-milk', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/2951', label: 'Latte', text: 'latte', speak: 'latte', symbol_type: 'nome', color: '#BDB2FF', is_visible: true },
        { id: 'sym-pasta', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/10398', label: 'Pasta', text: 'pasta', speak: 'pasta', symbol_type: 'nome', color: '#FFADAD', is_visible: true },
        { id: 'sym-meat', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/6803', label: 'Carne', text: 'carne', speak: 'carne', symbol_type: 'nome', color: '#FFC6FF', is_visible: true },
        { id: 'sym-pizza', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/2527', label: 'Pizza', text: 'pizza', speak: 'pizza', symbol_type: 'nome', color: '#FFD6A5', is_visible: true },
        { id: 'sym-cookies', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/2965', label: 'Biscotti', text: 'biscotti', speak: 'biscotti', symbol_type: 'nome', color: '#CAFFBF', is_visible: true },
        { id: 'sym-apple', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/2281', label: 'Mela', text: 'mela', speak: 'mela', symbol_type: 'nome', color: '#FFADAD', is_visible: true },
    ],
    toys: [
        { id: 'sym-ball', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/14730', label: 'Palla', text: 'palla', speak: 'palla', symbol_type: 'nome', color: '#FFC6FF', is_visible: true },
        { id: 'sym-doll', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/5243', label: 'Bambola', text: 'bambola', speak: 'bambola', symbol_type: 'nome', color: '#9BF6FF', is_visible: true },
        { id: 'sym-blocks', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/15295', label: 'Costruzioni', text: 'costruzioni', speak: 'costruzioni', symbol_type: 'nome', color: '#BDB2FF', is_visible: true },
        { id: 'sym-car', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/15162', label: 'Macchinina', text: 'macchinina', speak: 'macchinina', symbol_type: 'nome', color: '#A0C4FF', is_visible: true },
        { id: 'sym-puzzle', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/19662', label: 'Puzzle', text: 'puzzle', speak: 'puzzle', symbol_type: 'nome', color: '#CAFFBF', is_visible: true },
    ],
    systemControls: [
        { id: 'sys-del-word', type: 'system', action: 'deleteLastWord', icon: 'https://api.arasaac.org/api/pictograms/38200', label: 'Cancella ultimo', color: '#be626aff', is_visible: true, is_hideable: true },
        { id: 'sys-del-all', type: 'system', action: 'deleteAllText', icon: 'https://api.arasaac.org/api/pictograms/38201', label: 'Cancella tutto', color: '#be626aff', is_visible: true, is_hideable: true },
        { id: 'sys-speak', type: 'system', action: 'speakText', icon: 'https://api.arasaac.org/api/pictograms/38216', label: 'Leggi', color: '#75d1a8ff', is_visible: true, is_hideable: true },
        { id: 'sys-tense-past', type: 'system', action: 'setTense', text: 'passato', icon: 'https://api.arasaac.org/api/pictograms/9839', label: 'Passato', color: '#bb9bffff', is_visible: true, is_hideable: false },
        { id: 'sys-tense-present', type: 'system', action: 'setTense', text: 'presente', icon: 'https://api.arasaac.org/api/pictograms/38276', label: 'Presente', color: '#A0C4FF', is_visible: true, is_hideable: false },
        { id: 'sys-tense-future', type: 'system', action: 'setTense', text: 'futuro', icon: 'https://api.arasaac.org/api/pictograms/9829', label: 'Futuro', color: '#ffb2bfff', is_visible: true, is_hideable: false }
    ]
};
module.exports = defaultGrid;