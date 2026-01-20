import React from 'react'
import {
    Box,
    Text,
    HStack,
    Button,
    Checkbox,
    SimpleGrid
} from '@chakra-ui/react'
import { ASPECT_SYMBOLS } from './types'

const ALL_ASPECTS = ['Congiunzione', 'Sestile', 'Quadratura', 'Trigono', 'Opposizione']

interface AspectSelectorProps {
    selectedAspects: Set<string>
    onAspectToggle: (aspect: string) => void
    onSelectAll: () => void
    onSelectNone: () => void
    onSelectHarmonious: () => void
    onSelectTense: () => void
}

export const AspectSelector: React.FC<AspectSelectorProps> = ({
    selectedAspects,
    onAspectToggle,
    onSelectAll,
    onSelectNone,
    onSelectHarmonious,
    onSelectTense
}) => {
    const getAspectColor = (aspect: string) => {
        const colors = {
            'Congiunzione': 'yellow.400',
            'Sestile': 'green.400',
            'Trigono': 'blue.400',
            'Quadratura': 'red.400',
            'Opposizione': 'purple.400'
        }
        return colors[aspect as keyof typeof colors] || 'gray.400'
    }

    return (
        <Box>
            <HStack justify="space-between" align="center" mb={3}>
                <Text fontWeight="medium">Aspetti da visualizzare:</Text>
                <HStack gap={2}>
                    <Button size="xs" onClick={onSelectHarmonious} colorScheme="green">
                        Armoniosi
                    </Button>
                    <Button size="xs" onClick={onSelectTense} colorScheme="red">
                        Tesi
                    </Button>
                    <Button size="xs" onClick={onSelectAll}>
                        Tutti
                    </Button>
                    <Button size="xs" onClick={onSelectNone} variant="outline">
                        Nessuno
                    </Button>
                </HStack>
            </HStack>

            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={3}>
                {ALL_ASPECTS.map(aspect => (
                    <Checkbox.Root
                        key={aspect}
                        checked={selectedAspects.has(aspect)}
                        onCheckedChange={() => onAspectToggle(aspect)}
                        colorPalette="blue"
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>
                            <HStack gap={2}>
                                <Box
                                    w="20px"
                                    h="20px"
                                    bg={getAspectColor(aspect)}
                                    borderRadius="sm"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Text fontSize="sm" fontWeight="bold" color="white">
                                        {ASPECT_SYMBOLS[aspect as keyof typeof ASPECT_SYMBOLS]}
                                    </Text>
                                </Box>
                                <Text fontSize="sm">{aspect}</Text>
                            </HStack>
                        </Checkbox.Label>
                    </Checkbox.Root>
                ))}
            </SimpleGrid>

            <Text fontSize="sm" color="gray.600" mt={2}>
                {selectedAspects.size} aspetti selezionati
            </Text>
        </Box>
    )
}