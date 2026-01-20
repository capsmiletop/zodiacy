import React from 'react'
import {
    Box,
    Text,
    HStack,
    Button,
    Checkbox,
    SimpleGrid
} from '@chakra-ui/react'
import { ALL_PLANETS, PLANET_SYMBOLS } from './types'

interface PlanetSelectorProps {
    selectedPlanets: Set<string>
    onPlanetToggle: (planet: string) => void
    onSelectAll: () => void
    onSelectNone: () => void
    onSelectSlowPlanets: () => void
}

export const PlanetSelector: React.FC<PlanetSelectorProps> = ({
    selectedPlanets,
    onPlanetToggle,
    onSelectAll,
    onSelectNone,
    onSelectSlowPlanets
}) => {
    return (
        <Box>
            <HStack justify="space-between" align="center" mb={3}>
                <Text fontWeight="medium">Pianeti da visualizzare:</Text>
                <HStack gap={2}>
                    <Button size="xs" onClick={onSelectSlowPlanets}>
                        Pianeti Lenti
                    </Button>
                    <Button size="xs" onClick={onSelectAll}>
                        Tutti
                    </Button>
                    <Button size="xs" onClick={onSelectNone} variant="outline">
                        Nessuno
                    </Button>
                </HStack>
            </HStack>

            <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} gap={3}>
                {ALL_PLANETS.map(planet => (
                    <Checkbox.Root
                        key={planet}
                        checked={selectedPlanets.has(planet)}
                        onCheckedChange={() => onPlanetToggle(planet)}
                        colorPalette="blue"
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>
                            <HStack gap={1}>
                                <Text fontSize="lg">
                                    {PLANET_SYMBOLS[planet as keyof typeof PLANET_SYMBOLS] || '○'}
                                </Text>
                                <Text fontSize="sm">{planet}</Text>
                            </HStack>
                        </Checkbox.Label>
                    </Checkbox.Root>
                ))}
            </SimpleGrid>

            <Text fontSize="sm" color="gray.600" mt={2}>
                {selectedPlanets.size} pianeti selezionati
            </Text>
        </Box>
    )
}