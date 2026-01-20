export interface Transit {
    id: string
    date: string
    planet: string
    house: string
    aspect: string
    targetPlanet: string
    orb: number
    isExact: boolean
}

export type PeriodType = 'month' | 'year'

export interface PeriodConfig {
    periodType: PeriodType
    selectedYear: number
    selectedMonth: number
}

export interface TransitsTableProps {
    onTransitsChange?: (transits: Transit[]) => void
}

export const PLANET_SYMBOLS = {
    'Sole': '☉',
    'Luna': '☽',
    'Mercurio': '☿',
    'Venere': '♀',
    'Marte': '♂',
    'Giove': '♃',
    'Saturno': '♄',
    'Urano': '♅',
    'Nettuno': '♆',
    'Plutone': '♇',
    'Chirone': '⚷',
    'Lilith': '⚸',
    'Nodo Nord': '☊',
    'Nodo Sud': '☋'
} as const

export const ASPECT_SYMBOLS = {
    'Congiunzione': '☌',
    'Sestile': '⚹',
    'Trigono': '△',
    'Quadratura': '□',
    'Opposizione': '☍'
} as const

export const ALL_PLANETS = [
    'Plutone', 'Nettuno', 'Urano', 'Saturno', 'Giove',
    'Marte', 'Venere', 'Mercurio', 'Luna', 'Sole',
    'Nodo Nord', 'Nodo Sud', 'Lilith', 'Chirone'
]

export const MONTHS = [
    { value: 1, label: 'Gennaio' },
    { value: 2, label: 'Febbraio' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Aprile' },
    { value: 5, label: 'Maggio' },
    { value: 6, label: 'Giugno' },
    { value: 7, label: 'Luglio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Settembre' },
    { value: 10, label: 'Ottobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Dicembre' }
]