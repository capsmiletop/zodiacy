import React from 'react'
import {
    Box,
    Table,
    HStack,
    Text,
    Badge
} from '@chakra-ui/react'
import { Transit } from './types'
import { PLANET_SYMBOLS, ASPECT_SYMBOLS } from './types'
import { formatOrb, getAspectColor } from './utils'

interface TransitsTableViewProps {
    transits: Transit[]
}

export const TransitsTableView: React.FC<TransitsTableViewProps> = ({ transits }) => {
    if (transits.length === 0) {
        return (
            <Box textAlign="center" py={8}>
                <Text>Nessun transito trovato per i parametri selezionati</Text>
            </Box>
        )
    }

    return (
        <>
            <Box overflowX="auto">
                <Table.Root variant="line" size="sm">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Data</Table.ColumnHeader>
                            <Table.ColumnHeader>Pianeta in Transito</Table.ColumnHeader>
                            <Table.ColumnHeader>Casa</Table.ColumnHeader>
                            <Table.ColumnHeader>Aspetto</Table.ColumnHeader>
                            <Table.ColumnHeader>Pianeta Natale</Table.ColumnHeader>
                            <Table.ColumnHeader>Orb</Table.ColumnHeader>
                            <Table.ColumnHeader>Stato</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {transits.map((transit) => (
                            <Table.Row key={transit.id}>
                                <Table.Cell>
                                    {new Date(transit.date).toLocaleDateString('it-IT')}
                                </Table.Cell>
                                <Table.Cell>
                                    <HStack gap={2}>
                                        <Text fontSize="lg">
                                            {PLANET_SYMBOLS[transit.planet as keyof typeof PLANET_SYMBOLS] || '○'}
                                        </Text>
                                        <Text>{transit.planet}</Text>
                                    </HStack>
                                </Table.Cell>
                                <Table.Cell>{transit.house}</Table.Cell>
                                <Table.Cell>
                                    <HStack gap={2}>
                                        <Text fontSize="lg" color={getAspectColor(transit.aspect)}>
                                            {ASPECT_SYMBOLS[transit.aspect as keyof typeof ASPECT_SYMBOLS] || '○'}
                                        </Text>
                                        <Text>{transit.aspect}</Text>
                                    </HStack>
                                </Table.Cell>
                                <Table.Cell>
                                    <HStack gap={2}>
                                        <Text fontSize="lg">
                                            {PLANET_SYMBOLS[transit.targetPlanet as keyof typeof PLANET_SYMBOLS] || '○'}
                                        </Text>
                                        <Text>{transit.targetPlanet}</Text>
                                    </HStack>
                                </Table.Cell>
                                <Table.Cell fontWeight="medium">
                                    {formatOrb(transit.orb)}
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge
                                        colorScheme={transit.isExact ? 'green' : 'blue'}
                                        size="sm"
                                    >
                                        {transit.isExact ? 'Esatto' : 'In orbita'}
                                    </Badge>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>

            {/* Statistiche */}
            <Box p={4} bg="gray.50" borderTopWidth={1}>
                <HStack justify="space-between" fontSize="sm" color="gray.600">
                    <Text>
                        Totale transiti: <Text as="span" fontWeight="bold">{transits.length}</Text>
                    </Text>
                    <Text>
                        Transiti esatti: <Text as="span" fontWeight="bold" color="green.600">
                            {transits.filter(t => t.isExact).length}
                        </Text>
                    </Text>
                    <Text>
                        Pianeti attivi: <Text as="span" fontWeight="bold">
                            {new Set(transits.map(t => t.planet)).size}
                        </Text>
                    </Text>
                </HStack>
            </Box>
        </>
    )
}