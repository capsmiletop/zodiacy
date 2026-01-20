import {
    Box,
    Button,
    Text,
    Card,
    VStack,
    HStack,
    Spinner,
    SimpleGrid,
    Input,
    Field,
    Separator,
} from '@chakra-ui/react'
import { Toaster, toaster } from "./ui/toaster"
import { useEffect, useState } from 'react'
import LocationInput from './LocationInput'

interface NatalFormProps {
    selectedDate: string
    selectedTime: string
    latitude: string
    longitude: string
    timezone: string
    transitStartDate: string
    transitEndDate: string
    loading: boolean
    onDateChange: (date: string) => void
    onTimeChange: (time: string) => void
    onLatitudeChange: (lat: string) => void
    onLongitudeChange: (lng: string) => void
    onTimezoneChange: (tz: string) => void
    onTransitStartDateChange: (date: string) => void
    onTransitEndDateChange: (date: string) => void
    onSubmit: () => void
}

interface Profile {
    profileName: string
    description: string
    city: string
    selectedDate: string
    selectedTime: string
    latitude: string
    longitude: string
    timezone: string
}

/**
 * Componente form per il calcolo del tema natale
 * Include tutti i campi necessari per il calcolo astrologico completo
 */
export default function NatalForm({
    selectedDate,
    selectedTime,
    latitude,
    longitude,
    timezone,
    transitStartDate,
    transitEndDate,
    loading,
    onDateChange,
    onTimeChange,
    onLatitudeChange,
    onLongitudeChange,
    onTimezoneChange,
    onTransitStartDateChange,
    onTransitEndDateChange,
    onSubmit,
}: NatalFormProps) {
    const [profileName, setProfileName] = useState('')
    const [description, setDescription] = useState('')
    const [city, setCity] = useState('')
    const [profileList, setProfileList] = useState<string[]>([])
    const [selectedProfile, setSelectedProfile] = useState('')

    useEffect(() => {
        const stored = Object.keys(localStorage).filter(k => k.startsWith('profile_')).map(k => k.replace('profile_', ''))
        setProfileList(stored)
    }, [])

    const handleSaveProfile = () => {
        const data: Profile = {
            profileName,
            description,
            city,
            selectedDate,
            selectedTime,
            latitude,
            longitude,
            timezone
        }
        localStorage.setItem(`profile_${profileName}`, JSON.stringify(data))
        if (!profileList.includes(profileName)) {
            setProfileList([...profileList, profileName])
        }
        toaster.create({
            title: "Profilo salvato con successo",
            description: `Il profilo "${profileName}" è stato salvato`,
            type: "success",
        })
    }

    const handleLoadProfile = () => {
        if (!selectedProfile) return
        const data = localStorage.getItem(`profile_${selectedProfile}`)
        if (!data) return
        const parsed: Profile = JSON.parse(data)
        setProfileName(parsed.profileName)
        setDescription(parsed.description)
        setCity(parsed.city)
        onDateChange(parsed.selectedDate)
        onTimeChange(parsed.selectedTime)
        onLatitudeChange(parsed.latitude)
        onLongitudeChange(parsed.longitude)
        onTimezoneChange(parsed.timezone)
        toaster.create({
            title: "Profilo caricato",
            description: `Il profilo "${selectedProfile}" è stato caricato correttamente`,
            type: "success",
        })
    }

    const handleDeleteProfile = () => {
        localStorage.removeItem(`profile_${selectedProfile}`)
        setProfileList(profileList.filter(p => p !== selectedProfile))
        setSelectedProfile('')
        toaster.create({
            title: "Profilo eliminato",
            description: `Il profilo "${selectedProfile}" è stato eliminato`,
            type: "warning",
        })
    }

    const handleBackup = () => {
        const backup = profileList.map(name => JSON.parse(localStorage.getItem(`profile_${name}`) || '{}'))
        const csvContent = backup.map(p => Object.values(p).map(v => `"${v}"`).join(',')).join('\n')
        const headers = Object.keys(backup[0] || {}).join(',')
        const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'backup_profili.csv'
        a.click()
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            const text = reader.result as string
            const [header, ...lines] = text.split('\n')
            const keys = header.split(',')
            lines.forEach(line => {
                const values = line.split(',').map(v => v.split('"').join(''))
                const entry = Object.fromEntries(keys.map((k, i) => [k, values[i]]))
                localStorage.setItem(`profile_${entry.profileName}`, JSON.stringify(entry))
            })
            toaster.create({
                title: "Profilo importato correttamente",
                type: "success",
            })
            window.location.reload()
        }
        reader.readAsText(file)
    }

    const handleClear = () => {
        setProfileName('')
        setDescription('')
        setCity('')
        onDateChange('')
        onTimeChange('')
        onLatitudeChange('')
        onLongitudeChange('')
        onTimezoneChange('')
        //alert('Campi svuotati')
        toaster.create({
            title: "Campi svuotati correttamente",
            type: "success",
        })
    }

    return (
        <Card.Root size="lg" boxShadow="xl" w="full" maxW="900px">
            <Toaster />
            <Card.Header>
                <Text fontSize="xl" fontWeight="bold" textAlign="center">
                    Calcolo Tema Natale e Transiti
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
                    Inserisci tutti i dati per calcolare il tema natale completo con i rispettivi transiti
                </Text>
            </Card.Header>
            <Card.Body>
                <VStack gap={6}>
                    {/* Sezione Gestione Profilo */}
                    <Box w="full" p={6} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                        <VStack gap={5}>
                            <Box textAlign="center">
                                <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                                    👤 Gestione Profilo
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    Salva e gestisci i tuoi profili astrologici
                                </Text>
                            </Box>

                            {/* Campi Nome e Descrizione */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                                <Field.Root>
                                    <Field.Label fontSize="sm" fontWeight="medium" color="gray.700">Nome Profilo</Field.Label>
                                    <Input
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        placeholder="Es. Mario Rossi"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                                    />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label fontSize="sm" fontWeight="medium" color="gray.700">Descrizione</Field.Label>
                                    <Input
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Es. Tema natale principale"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                                    />
                                </Field.Root>
                            </SimpleGrid>

                            {/* Selezione profilo esistente */}
                            <Box w="full">
                                <Field.Root>
                                    <Field.Label fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                                        Carica profilo esistente
                                    </Field.Label>
                                    <select
                                        value={selectedProfile}
                                        onChange={(e) => setSelectedProfile(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            fontSize: '14px',
                                            borderRadius: '8px',
                                            border: '1px solid #D2D6DC',
                                            backgroundColor: 'white',
                                            color: '#374151'
                                        }}
                                    >
                                        <option value="">-- Seleziona un profilo salvato --</option>
                                        {profileList.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </Field.Root>
                            </Box>

                            {/* Bottoni azioni */}
                            <VStack gap={3} w="full">
                                {/* Azioni principali */}
                                <SimpleGrid columns={{ base: 2, md: 4 }} gap={3} w="full">
                                    <Button
                                        onClick={handleSaveProfile}
                                        colorScheme="green"
                                        size="sm"
                                        fontSize="xs"
                                    >
                                        💾 Salva
                                    </Button>
                                    <Button
                                        onClick={handleLoadProfile}
                                        colorScheme="blue"
                                        size="sm"
                                        fontSize="xs"
                                    >
                                        📁 Carica
                                    </Button>
                                    <Button
                                        onClick={handleDeleteProfile}
                                        colorScheme="red"
                                        size="sm"
                                        fontSize="xs"
                                    >
                                        🗑️ Elimina
                                    </Button>
                                    <Button
                                        onClick={handleClear}
                                        variant="outline"
                                        size="sm"
                                        fontSize="xs"
                                    >
                                        🧹 Pulisci
                                    </Button>
                                </SimpleGrid>

                                {/* Azioni import/export */}
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} w="full">
                                    <Button
                                        onClick={handleBackup}
                                        variant="outline"
                                        colorScheme="gray"
                                        size="sm"
                                        fontSize="xs"
                                    >
                                        📤 Esporta tutti i profili
                                    </Button>
                                    <Button
                                        as="label"
                                        variant="outline"
                                        colorScheme="gray"
                                        size="sm"
                                        fontSize="xs"
                                        cursor="pointer"
                                    >
                                        📤 Importa profili da file
                                        <Input type="file" hidden accept=".csv" onChange={handleImport} />
                                    </Button>
                                </SimpleGrid>
                            </VStack>
                        </VStack>
                    </Box>

                    {/* Prima riga: Data e Ora */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} w="full">
                        <Field.Root>
                            <Field.Label>Data di Nascita</Field.Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => onDateChange(e.target.value)}
                                size="lg"
                            />
                            <Field.HelperText>Formato: gg/mm/aaaa</Field.HelperText>
                        </Field.Root>

                        <Field.Root>
                            <Field.Label>Ora di Nascita</Field.Label>
                            <Input
                                type="time"
                                value={selectedTime}
                                onChange={(e) => onTimeChange(e.target.value)}
                                size="lg"
                            />
                            <Field.HelperText>Formato 24 ore (es. 14:30)</Field.HelperText>
                        </Field.Root>
                    </SimpleGrid>

                    {/* Seconda riga: Ricerca luogo */}
                    <Box w="full">
                        <LocationInput
                            date={selectedDate}
                            onDataReceived={(data) => {
                                if (data.latitude) onLatitudeChange(String(data.latitude))
                                if (data.longitude) onLongitudeChange(String(data.longitude))
                                if (data.timezone) onTimezoneChange(String(data.timezone))
                            }}
                        />
                    </Box>

                    {/* Terza riga: Coordinate geografiche */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
                        <Field.Root>
                            <Field.Label>Latitudine</Field.Label>
                            <Input
                                type="number"
                                step="0.000001"
                                placeholder="es. 45.4642"
                                value={latitude}
                                onChange={(e) => onLatitudeChange(e.target.value)}
                                size="lg"
                            />
                            <Field.HelperText>Coordinata Nord/Sud</Field.HelperText>
                        </Field.Root>

                        <Field.Root>
                            <Field.Label>Longitudine</Field.Label>
                            <Input
                                type="number"
                                step="0.000001"
                                placeholder="es. 9.1900"
                                value={longitude}
                                onChange={(e) => onLongitudeChange(e.target.value)}
                                size="lg"
                            />
                            <Field.HelperText>Coordinata Est/Ovest</Field.HelperText>
                        </Field.Root>

                        <Field.Root>
                            <Field.Label>Fuso Orario</Field.Label>
                            <Input
                                type="number"
                                step="0.5"
                                placeholder="es. 1 (CET)"
                                value={timezone}
                                onChange={(e) => onTimezoneChange(e.target.value)}
                                size="lg"
                            />
                            <Field.HelperText>Ore da UTC (es. +1 per Italia)</Field.HelperText>
                        </Field.Root>
                    </SimpleGrid>

                    <Separator />

                    {/* Configurazione periodo transiti */}
                    <VStack gap={4} align="stretch">
                        <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                            📅 Periodo Transiti Mensili
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                            <Field.Root>
                                <Field.Label>Data Inizio Transiti</Field.Label>
                                <Input
                                    type="date"
                                    value={transitStartDate}
                                    onChange={(e) => onTransitStartDateChange(e.target.value)}
                                    size="lg"
                                />
                                <Field.HelperText>Primo giorno del periodo da analizzare</Field.HelperText>
                            </Field.Root>

                            <Field.Root>
                                <Field.Label>Data Fine Transiti</Field.Label>
                                <Input
                                    type="date"
                                    value={transitEndDate}
                                    onChange={(e) => onTransitEndDateChange(e.target.value)}
                                    size="lg"
                                />
                                <Field.HelperText>Ultimo giorno del periodo da analizzare</Field.HelperText>
                            </Field.Root>
                        </SimpleGrid>

                        <Box p={3} bg="orange.50" borderRadius="md" textAlign="center">
                            <Text fontSize="sm" color="orange.700">
                                I transiti saranno calcolati mensilmente per il periodo specificato
                            </Text>
                        </Box>
                    </VStack>

                    <Button
                        onClick={onSubmit}
                        disabled={loading || !latitude || !longitude || !transitStartDate || !transitEndDate}
                        colorScheme="green"
                        size="lg"
                        width="full"
                        mt={4}
                    >
                        {loading ? (
                            <HStack>
                                <Spinner size="sm" />
                                <Text>Calcolo tema natale in corso...</Text>
                            </HStack>
                        ) : (
                            'Calcola Tema Natale Completo'
                        )}
                    </Button>
                </VStack>
            </Card.Body>
        </Card.Root>
    )
}
