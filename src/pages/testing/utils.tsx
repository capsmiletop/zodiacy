// filepath: src/components/TransitsTable/utils.ts
import { PeriodType, Transit } from './types'

export const calculateDateRange = (
    periodType: PeriodType,
    selectedYear: number,
    selectedMonth: number
) => {
    if (periodType === 'year') {
        return {
            startDate: `${selectedYear}-01-01`,
            endDate: `${selectedYear}-12-31`
        }
    } else {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
        return {
            startDate: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`,
            endDate: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${daysInMonth}`
        }
    }
}

export const getYearsArray = (count: number = 10) => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: count }, (_, i) => currentYear - 5 + i)
}

export const formatOrb = (amount: number) => `${amount.toFixed(2)}°`

export const getAspectColor = (aspect: string) => {
    const colors = {
        'Congiunzione': 'yellow.500',
        'Sestile': 'green.500',
        'Trigono': 'blue.500',
        'Quadratura': 'red.500',
        'Opposizione': 'purple.500'
    }
    return colors[aspect as keyof typeof colors] || 'gray.500'
}

export const generateMockTransits = (
    startDate: string,
    endDate: string,
    selectedPlanets: string[],
    selectedAspects: string[], // Nuovo parametro
    density: number = 10
): Transit[] => {
    const mockTransits: Transit[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const targetPlanets = ['Sole', 'Luna', 'Mercurio', 'Venere', 'Marte', 'Giove', 'Saturno']

    selectedPlanets.forEach((planet) => {
        selectedAspects.forEach((aspect) => { // Usa gli aspetti selezionati
            const numTransits = Math.floor(Math.random() * density) + 1

            for (let i = 0; i < numTransits; i++) {
                const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

                mockTransits.push({
                    id: `${planet}-${aspect}-${i}-${randomDate.getTime()}`,
                    date: randomDate.toISOString().split('T')[0],
                    planet: planet,
                    house: `${Math.floor(Math.random() * 12) + 1}ª`,
                    aspect: aspect,
                    targetPlanet: targetPlanets[Math.floor(Math.random() * targetPlanets.length)],
                    orb: Math.random() * 2,
                    isExact: Math.random() > 0.8
                })
            }
        })
    })

    return mockTransits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}