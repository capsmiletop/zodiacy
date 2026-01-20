import React from 'react'
import {
    Box,
    Text,
    HStack,
    Badge,
    NativeSelectRoot,
    NativeSelectField
} from '@chakra-ui/react'
import { PeriodType, MONTHS } from './types'
import { getYearsArray } from './utils'

interface PeriodSelectorProps {
    periodType: PeriodType
    selectedYear: number
    selectedMonth: number
    startDate: string
    endDate: string
    onPeriodTypeChange: (type: PeriodType) => void
    onYearChange: (year: number) => void
    onMonthChange: (month: number) => void
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
    periodType,
    selectedYear,
    selectedMonth,
    startDate,
    endDate,
    onPeriodTypeChange,
    onYearChange,
    onMonthChange
}) => {
    const years = getYearsArray()

    return (
        <HStack gap={4} flexWrap="wrap">
            <Box>
                <Text mb={2} fontWeight="medium">Periodo:</Text>
                <NativeSelectRoot width="150px">
                    <NativeSelectField
                        value={periodType}
                        onChange={(e) => onPeriodTypeChange(e.target.value as PeriodType)}
                    >
                        <option value="month">Mese</option>
                        <option value="year">Anno completo</option>
                    </NativeSelectField>
                </NativeSelectRoot>
            </Box>

            <Box>
                <Text mb={2} fontWeight="medium">Anno:</Text>
                <NativeSelectRoot width="120px">
                    <NativeSelectField
                        value={selectedYear}
                        onChange={(e) => onYearChange(Number(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </NativeSelectField>
                </NativeSelectRoot>
            </Box>

            {periodType === 'month' && (
                <Box>
                    <Text mb={2} fontWeight="medium">Mese:</Text>
                    <NativeSelectRoot width="150px">
                        <NativeSelectField
                            value={selectedMonth}
                            onChange={(e) => onMonthChange(Number(e.target.value))}
                        >
                            {MONTHS.map(month => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </NativeSelectField>
                    </NativeSelectRoot>
                </Box>
            )}

            <Box>
                <Text mb={2} fontWeight="medium">Periodo selezionato:</Text>
                <Badge colorScheme="blue" p={2}>
                    {new Date(startDate).toLocaleDateString('it-IT')} - {new Date(endDate).toLocaleDateString('it-IT')}
                </Badge>
            </Box>
        </HStack>
    )
}