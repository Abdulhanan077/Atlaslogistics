export function parseShipmentInfo(infoString: string | null | undefined) {
    const scrub = (val: any) => {
        if (!val || typeof val !== 'string') return val;
        let clean = val;
        
        // Remove everything up to and including "Address" if it exists
        const addrIdx = clean.toLowerCase().lastIndexOf('address');
        if (addrIdx !== -1) {
            clean = clean.substring(addrIdx + 7).replace(/^[:\s]+/, '');
        }

        // Also clean up any other labeled blocks that might be left
        return clean
            .replace(/(?:Receiver|Sender)?\s*Full\s*name[\s\S]*?(?=Phone|Email|Address|$)/gi, '')
            .replace(/Phone\s*or\s*email[\s\S]*?(?=Address|$)/gi, '')
            .replace(/(?:Receiver|Sender)?\s*Full\s*name[:]?/gi, '')
            .replace(/Phone\s*or\s*email[:]?/gi, '')
            .replace(/Phone[:]?/gi, '')
            .replace(/Email[:]?/gi, '')
            .replace(/Address[:]?/gi, '')
            .trim();
    };

    if (!infoString) return { name: '', phone: '', address: '', vehicleType: 'TRUCK' };

    try {
        const parsed = JSON.parse(infoString);
        return {
            ...parsed, // Keep other fields like destLat, destLng
            name: scrub(parsed.name || ''),
            phone: scrub(parsed.phone || ''),
            address: scrub(parsed.address || ''),
            vehicleType: parsed.vehicleType || 'TRUCK',
        };
    } catch {
        const parts = infoString.split(',').map(s => s.trim());
        if (parts.length > 1) {
            return {
                name: scrub(parts[0]),
                phone: '',
                address: scrub(parts.slice(1).join(', ')),
                vehicleType: 'TRUCK'
            };
        }
        return {
            name: scrub(infoString),
            phone: '',
            address: '',
            vehicleType: 'TRUCK'
        };
    }
}
