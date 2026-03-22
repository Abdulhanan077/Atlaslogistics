export function parseShipmentInfo(infoString: string | null | undefined) {
    if (!infoString) return { name: '', phone: '', address: '' };

    try {
        const parsed = JSON.parse(infoString);
        return {
            name: parsed.name || '',
            phone: parsed.phone || '',
            address: parsed.address || ''
        };
    } catch {
        // Fallback for legacy plain text entries "Name, Address" or just "Name"
        const parts = infoString.split(',').map(s => s.trim());
        if (parts.length > 1) {
            return {
                name: parts[0],
                phone: '',
                address: parts.slice(1).join(', ')
            };
        }
        return {
            name: infoString,
            phone: '',
            address: ''
        };
    }
}
