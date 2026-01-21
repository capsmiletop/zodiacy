import {
    Box,
    Button,
    Text,
    VStack,
    HStack,
    Spinner,
    SimpleGrid,
    Input,
    Field,
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
        toaster.create({
            title: "Campi svuotati correttamente",
            type: "success",
        })
    }

    // Reusable input styles
    const inputStyles = {
        bg: "transparent",
        border: "none",
        borderBottom: "1px solid",
        borderColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: "0",
        color: "white",
        px: 0,
        _placeholder: { color: 'rgba(255, 255, 255, 0.5)' },
        _focus: {
            outline: 'none',
            borderBottom: '1px solid',
            borderBottomColor: 'rgba(173, 216, 230, 0.6)',
            boxShadow: 'none'
        },
        _hover: {
            borderBottomColor: 'rgba(255, 255, 255, 0.5)'
        }
    }

    // Reusable button styles
    const buttonBaseStyles = {
        bg: "rgba(255, 255, 255, 0.1)",
        border: "1px solid",
        borderColor: "rgba(255, 255, 255, 0.3)",
        color: "white",
        size: "sm" as const,
        fontSize: "xs",
        _hover: {
            bg: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.5)'
        }
    }

    // Reusable field label styles
    const fieldLabelStyle = { color: "rgba(255, 255, 255, 0.9)" }
    const helperTextStyle = { color: "rgba(255, 255, 255, 0.5)" }

    return (
        <Box w="full" maxW="900px" mx="auto" 
            p={6} 
            bg="rgba(32, 38, 65, 0.9)" 
            borderRadius="xl" 
            border="1px solid" 
            borderColor="rgba(255, 255, 255, 0.1)">
            <Toaster />
            <VStack gap={8} align="stretch">
                {/* Header */}
                <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color="white" mb={2}>
                        Calcolo Tema Natale e Transiti
                    </Text>
                    <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)" textAlign="center">
                        Inserisci tutti i dati per calcolare il tema natale completo con i rispettivi transiti
                    </Text>
                </Box>

                <VStack gap={6}>
                    {/* Sezione Gestione Profilo */}
                    <Box 
                        w="full" 
                        p={6} 
                        bg="rgba(30, 35, 60, 0.9)" 
                        borderRadius="xl" 
                        border="1px solid" 
                        borderColor="rgba(255, 255, 255, 0.1)"
                    >
                        <VStack gap={5}>
                            <Box textAlign="center">
                                <Text fontSize="lg" fontWeight="bold" color="white" mb={2}>
                                     Gestione Profilo
                                </Text>
                                <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)">
                                    Salva e gestisci i tuoi profili astrologici
                                </Text>
                            </Box>

                            {/* Campi Nome e Descrizione */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                                <Field.Root>
                                    <Field.Label fontSize="sm" fontWeight="medium" {...fieldLabelStyle}></Field.Label>
                                    <Input
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        placeholder="Nome Profilo*:  Mario Rossi"
                                        {...inputStyles}
                                    />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label fontSize="sm" fontWeight="medium" {...fieldLabelStyle}></Field.Label>
                                    <Input
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Descrizione*:  Tema natale principale"
                                        {...inputStyles}
                                    />
                                </Field.Root>
                            </SimpleGrid>

                            {/* Selezione profilo esistente */}
                            <Box w="full">
                                <Field.Root>
                                    <Field.Label fontSize="sm" fontWeight="medium" color="rgba(255, 255, 255, 0.9)" mb={2}>
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
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            backgroundColor: 'rgba(30, 35, 60, 0.5)',
                                            color: 'white'
                                        }}
                                    >
                                        <option value="" style={{ backgroundColor: '#1b203e' }}>-- Seleziona un profilo salvato --</option>
                                        {profileList.map((p) => (
                                            <option key={p} value={p} style={{ backgroundColor: '#1b203e' }}>{p}</option>
                                        ))}
                                    </select>
                                </Field.Root>
                            </Box>

                            {/* Bottoni azioni - 2x3 Grid */}
                            <SimpleGrid columns={{ base: 2, md: 3 }} gap={3} w="full">
                                <Button onClick={handleSaveProfile} {...buttonBaseStyles}>
                                    💾 Salva
                                </Button>
                                <Button onClick={handleLoadProfile} {...buttonBaseStyles}>
                                    📁 Carica
                                </Button>
                                <Button
                                    onClick={handleDeleteProfile}
                                    {...buttonBaseStyles}
                                    _hover={{
                                        bg: 'rgba(255, 0, 0, 0.2)',
                                        borderColor: 'rgba(255, 0, 0, 0.5)'
                                    }}
                                >
                                    🗑️ Elimina
                                </Button>
                                <Button onClick={handleClear} {...buttonBaseStyles}>
                                    🧹 Pulisci
                                </Button>
                                <Button onClick={handleBackup} {...buttonBaseStyles}>
                                    📤 Esporta tutti i profili
                                </Button>
                                <Button
                                    as="label"
                                    {...buttonBaseStyles}
                                    cursor="pointer"
                                >
                                    📥 Importa profili da file
                                    <Input type="file" hidden accept=".csv" onChange={handleImport} />
                                </Button>
                            </SimpleGrid>
                        </VStack>
                    </Box>

                    {/* Prima riga: Data e Ora */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} w="full">
                        <Field.Root>
                            <Field.Label {...fieldLabelStyle}>Data di Nascita:</Field.Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => onDateChange(e.target.value)}
                                {...inputStyles}
                            />
                            <Field.HelperText {...helperTextStyle}>Formato: gg/mm/aaaa</Field.HelperText>
                        </Field.Root>

                        <Field.Root>
                            <Field.Label {...fieldLabelStyle}>Ora di Nascita:</Field.Label>
                            <Input
                                type="time"
                                value={selectedTime}
                                onChange={(e) => onTimeChange(e.target.value)}
                                {...inputStyles}
                            />
                            <Field.HelperText {...helperTextStyle}>Formato 24 ore (es. 14:30)</Field.HelperText>
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
                            <Field.Label {...fieldLabelStyle}>Latitudine:</Field.Label>
                            <Input
                                type="number"
                                step="0.000001"
                                placeholder="es. 45.4642"
                                value={latitude}
                                onChange={(e) => onLatitudeChange(e.target.value)}
                                {...inputStyles}
                            />
                            <Field.HelperText {...helperTextStyle}>Coordinata Nord/Sud</Field.HelperText>
                        </Field.Root>

                        <Field.Root>
                            <Field.Label {...fieldLabelStyle}>Longitudine:</Field.Label>
                            <Input
                                type="number"
                                step="0.000001"
                                placeholder="es. 9.1900"
                                value={longitude}
                                onChange={(e) => onLongitudeChange(e.target.value)}
                                {...inputStyles}
                            />
                            <Field.HelperText {...helperTextStyle}>Coordinata Est/Ovest</Field.HelperText>
                        </Field.Root>

                        <Field.Root>
                            <Field.Label {...fieldLabelStyle}>Fuso Orario:</Field.Label>
                            <Input
                                type="number"
                                step="0.5"
                                placeholder="es. 1 (CET)"
                                value={timezone}
                                onChange={(e) => onTimezoneChange(e.target.value)}
                                {...inputStyles}
                            />
                            <Field.HelperText {...helperTextStyle}>Ore da UTC (es. +1 per Italia)</Field.HelperText>
                        </Field.Root>
                    </SimpleGrid>

                    <Box w="full" h="1px" bg="rgba(255, 255, 255, 0.1)" my={4} />

                    {/* Configurazione periodo transiti */}
                    <VStack gap={4} align="stretch">
                        <Text fontSize="lg" fontWeight="semibold" textAlign="center" color="white">
                            📅 Periodo Transiti Mensili
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                            <Field.Root>
                                <Field.Label {...fieldLabelStyle}>Data Inizio Transiti:</Field.Label>
                                <Input
                                    type="date"
                                    value={transitStartDate}
                                    onChange={(e) => onTransitStartDateChange(e.target.value)}
                                    {...inputStyles}
                                />
                                <Field.HelperText {...helperTextStyle}>Primo giorno del periodo da analizzare</Field.HelperText>
                            </Field.Root>

                            <Field.Root>
                                <Field.Label {...fieldLabelStyle}>Data Fine Transiti:</Field.Label>
                                <Input
                                    type="date"
                                    value={transitEndDate}
                                    onChange={(e) => onTransitEndDateChange(e.target.value)}
                                    {...inputStyles}
                                />
                                <Field.HelperText {...helperTextStyle}>Ultimo giorno del periodo da analizzare</Field.HelperText>
                            </Field.Root>
                        </SimpleGrid>

                        <Box p={3} bg="rgba(255, 165, 0, 0.1)" borderRadius="md" textAlign="center" border="1px solid" borderColor="rgba(255, 165, 0, 0.3)">
                            <Text fontSize="sm" color="rgba(255, 255, 255, 0.8)">
                                I transiti saranno calcolati mensilmente per il periodo specificato
                            </Text>
                        </Box>
                    </VStack>

                    <Button
                        onClick={onSubmit}
                        disabled={loading || !latitude || !longitude || !transitStartDate || !transitEndDate}
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid"
                        borderColor="rgba(255, 255, 255, 0.3)"
                        color="white"
                        size="lg"
                        width="full"
                        mt={4}
                        borderRadius="md"
                        _hover={{
                            bg: 'rgba(255, 255, 255, 0.2)',
                            borderColor: 'rgba(255, 255, 255, 0.5)'
                        }}
                        _disabled={{
                            opacity: 0.5,
                            cursor: 'not-allowed'
                        }}
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
            </VStack>
            
        </Box>
    )
}
