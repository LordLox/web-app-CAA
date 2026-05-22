/**
 * default-grid.js
 * * This file contains the default structure for a new user's grid.
 * By centralizing it on the server, we ensure that every new user
 * gets a consistent and correctly structured initial setup.
 */
const defaultGrid = {
    home: [
        { id: 'cat-emo', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/39091', label: 'Emozioni', target: 'emotions', color: '#FFADAD', is_visible: true },
        { id: 'cat-act', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/7297', label: 'Azioni', target: 'actions', color: '#FFD6A5', is_visible: true },
        { id: 'cat-food', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/4610', label: 'Cibo', target: 'food', color: '#CAFFBF', is_visible: true },
        { id: 'cat-fam', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/38351', label: 'Famiglia', target: 'family', color: '#9BF6FF', is_visible: true },
        { id: 'cat-subj', type: 'category', icon: 'https://api.arasaac.org/api/pictograms/6632', label: 'Soggetti', target: 'subject', color: '#A0C4FF', is_visible: true },
    ],
    subject:[
        { id: 'sym-io', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/6632', label: 'Io', text: 'io', speak: 'io',symbol_type: 'nome', color: '#A0C4FF', is_visible: true },
        { id: 'sym-tu', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/6625', label: 'Tu', text: 'tu', speak: 'tu',symbol_type: 'nome', color: '#BDB2FF', is_visible: true },
        { id: 'sym-lui', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/6480', label: 'Lui', text: 'lui', speak: 'lui',symbol_type: 'nome', color: '#A0C4FF', is_visible: true },
        { id: 'sym-lei', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/7028', label: 'Lei', text: 'lei', speak: 'lei',symbol_type: 'nome', color: '#A0C4FF', is_visible: true },
        { id: 'sym-noi', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/7186', label: 'Noi', text: 'noi', speak: 'noi',symbol_type: 'nome', color: '#A0C4FF', is_visible: true },
        { id: 'sym-voi', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/7305', label: 'Voi', text: 'voi', speak: 'voi',symbol_type: 'nome', color: '#A0C4FF', is_visible: true },
        { id: 'sym-essi', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/7033', label: 'Loro', text: 'loro', speak: 'loro',symbol_type: 'nome', color: '#A0C4FF', is_visible: true },
    ],
    emotions: [
        { id: 'sym-happy', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/35547', label: 'Felice', text: 'felice',symbol_type: 'altro', speak: 'felice', color: '#FFADAD', is_visible: true },
        { id: 'sym-sad', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/35545', label: 'Triste', text: 'triste',symbol_type: 'altro', speak: 'triste', color: '#A0C4FF', is_visible: true },
    ],
    actions: [ 
        { id: 'sym-walk', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/29951', label: 'Camminare', text: 'camminare',symbol_type: 'verbo', speak: 'camminare', color: '#CAFFBF', is_visible: true }, 
        { id: 'sym-want', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/5441', label: 'Volere', text: 'volere',symbol_type: 'verbo', speak: 'volere', color: '#FFC6FF', is_visible: true },
        { id: 'sym-help', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/32648', label: 'Aiutare', text: 'aiutare',symbol_type: 'verbo', speak: 'aiutare', color: '#FDFFB6', is_visible: true },
        { id: 'sym-leg', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/7141', label: 'Leggere', text: 'leggere',symbol_type: 'verbo', speak: 'leggere', color: '#FDFFB6', is_visible: true },
        { id: 'sym-be', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/36480', label: 'Essere', text: 'essere',symbol_type: 'verbo', speak: 'essere', color: '#FDFFB6', is_visible: true },
        { id: 'sym-have', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/32761', label: 'Avere', text: 'avere',symbol_type: 'verbo', speak: 'avere', color: '#FDFFB6', is_visible: true },
        { id: 'sym-eat', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/6456', label: 'Mangiare', text: 'mangiare',symbol_type: 'verbo', speak: 'mangiare', color: '#FDFFB6', is_visible: true }
    ],
    food: [ { id: 'sym-pizza', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/2527', label: 'Pizza', text: 'pizza',symbol_type: 'nome', speak: 'pizza', color: '#FFADAD', is_visible: true }, ],
    family: [ { id: 'sym-mom', type: 'symbol', icon: 'https://api.arasaac.org/api/pictograms/2458', label: 'Mamma', text: 'mamma',symbol_type: 'nome', speak: 'mamma', color: '#9BF6FF', is_visible: true }, ],
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