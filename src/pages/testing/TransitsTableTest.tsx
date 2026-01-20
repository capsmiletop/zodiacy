import React from 'react'
import {
    Box,
    Heading,
    Text,
    VStack,
    Button,
    HStack,
    Icon,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { TransitsTable } from './TransitsTable'

const TransitsTableTest: React.FC = () => {
    return (
        <Box minH="100vh" bg="#1b203e" color="white">
            <Box maxW="7xl" mx="auto" p={6}>
                <VStack gap={6} align="stretch">
                    <HStack justify="space-between" align="center">
                        <VStack align="start" gap={1}>
                            <Heading size="xl" color="white">Test Tabella Transiti</Heading>
                            <Text color="gray.300">
                                Prova la nuova tabella dei transiti con filtri per periodo
                            </Text>
                        </VStack>

                        <Button asChild variant="outline" borderColor="white" color="white" _hover={{ bg: "whiteAlpha.100" }}>
                            <RouterLink to="/testing">
                                <Icon as={FiArrowLeft} />
                                Torna al Testing
                            </RouterLink>
                        </Button>
                    </HStack>

                    <Box bg="white" color="black" borderRadius="lg" p={6}>
                        <TransitsTable />
                    </Box>
                </VStack>
            </Box>
        </Box>
    )
}

export default TransitsTableTest