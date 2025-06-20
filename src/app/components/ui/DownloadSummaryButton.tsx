'use client'

import { saveAs } from 'file-saver'
import ExcelJS from 'exceljs'

type Operation = {
    date: string
    description: string
    amount: number
    type: string
    user?: string
    category?: string
}

type Props = {
    summaryType: 'day' | 'week' | 'month'
    summaryData: Operation[]
}

function formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}h${minutes}`;
}

export function DownloadSummaryButton({ summaryType, summaryData }: Props) {
    const handleDownload = async () => {
        const workbook = new ExcelJS.Workbook()
        const sheet = workbook.addWorksheet(`${summaryType}-summary`)

        sheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Description', key: 'description', width: 30 },
            { header: 'Montant', key: 'amount', width: 15 },
            { header: 'Type', key: 'type', width: 10 },
            { header: 'Utilisateur', key: 'user', width: 20 },
            { header: 'Catégorie', key: 'category', width: 20 },
        ]

        summaryData.forEach((item) => {
            sheet.addRow({
                date: formatDate(item.date),  // <== formatage ici
                description: item.description,
                amount: item.amount,
                type: item.type,
                user: item.user || '',
                category: item.category || ''
            })
        })

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })

        saveAs(blob, `${summaryType}-summary.xlsx`)
    }

    return (
        <button
            onClick={handleDownload}
            className="text-sm px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
            Télécharger le résumé ({summaryType})
        </button>
    )
}
