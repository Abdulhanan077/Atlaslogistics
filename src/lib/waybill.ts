import { parseShipmentInfo } from './utils';

export interface WaybillDetails {
    awbPrefix?: string;
    departureCode?: string;
    awbNumber?: string;
    airportOfDeparture?: string;
    airportOfDestination?: string;
    pkgs?: string;
    weight?: string;
    hsCode?: string;
    commodity?: string;
    declaredCustomsValue?: string;
    freightCharge?: string;
    specialHandling?: string;
    carrierDigitalStamp?: string;
    waybillDate?: string;
    shipperName?: string;
    shipperAddress?: string;
    shipperEmail?: string;
    consigneeName?: string;
    consigneeAddress?: string;
    consigneeEmail?: string;
    companyEmail?: string;
}

export function getWaybillDetails(shipment: any): Required<WaybillDetails> {
    const sender = parseShipmentInfo(shipment?.senderInfo);
    const receiver = parseShipmentInfo(shipment?.receiverInfo);

    let wb: Partial<WaybillDetails> = {};
    if (sender?.waybillDetails) {
        wb = sender.waybillDetails;
    } else if (receiver?.waybillDetails) {
        wb = receiver.waybillDetails;
    } else if (shipment?.waybillDetails) {
        try {
            wb = typeof shipment.waybillDetails === 'string' 
                ? JSON.parse(shipment.waybillDetails) 
                : shipment.waybillDetails;
        } catch {
            wb = {};
        }
    }

    const rawTracking = shipment?.trackingNumber || '90481204';
    
    // Default formatted date (e.g. 14 OCT 2009 or from shipment createdAt)
    let formattedDate = '14 OCT 2009';
    if (shipment?.createdAt) {
        try {
            const d = new Date(shipment.createdAt);
            if (!isNaN(d.getTime())) {
                const day = d.getDate().toString().padStart(2, '0');
                const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                const year = d.getFullYear();
                formattedDate = `${day} ${month} ${year}`;
            }
        } catch {
            formattedDate = '14 OCT 2009';
        }
    }

    const senderAddrStr = sender?.address 
        ? `${sender.address}`
        : 'International House, Garretts Green\nBirmingham, B33 0UE, UK';

    const receiverAddrStr = receiver?.address 
        ? `${receiver.address}`
        : '3260 Spreading Oak Dr\nDouglasville, GA 30135, USA';

    return {
        awbPrefix: wb.awbPrefix || '114',
        departureCode: wb.departureCode || 'LHR',
        awbNumber: wb.awbNumber || rawTracking,
        airportOfDeparture: wb.airportOfDeparture || shipment?.origin || 'LHR (London)',
        airportOfDestination: wb.airportOfDestination || shipment?.destination || 'ATL (Atlanta)',
        pkgs: wb.pkgs || '3',
        weight: wb.weight || '37.32 KG',
        hsCode: wb.hsCode || 'HS 7108.12',
        commodity: wb.commodity || shipment?.productDescription || 'Gold Bars',
        declaredCustomsValue: wb.declaredCustomsValue || 'USD 1,275,320.00',
        freightCharge: wb.freightCharge || 'PREPAID',
        specialHandling: wb.specialHandling || 'VAL Cargo Protocol. Armored Transport.\nOfficial Recipient Photo ID Verification Required.',
        carrierDigitalStamp: wb.carrierDigitalStamp || '[IATA Validated]',
        waybillDate: wb.waybillDate || formattedDate,
        shipperName: wb.shipperName || sender?.name || 'Atlas Logistics UK Ltd',
        shipperAddress: wb.shipperAddress || senderAddrStr,
        shipperEmail: wb.shipperEmail || sender?.email || 'info@atlaslogistics.co.uk',
        consigneeName: wb.consigneeName || receiver?.name || 'Christine Moore',
        consigneeAddress: wb.consigneeAddress || receiverAddrStr,
        consigneeEmail: wb.consigneeEmail || shipment?.customerEmail || receiver?.email || 'christine.moore@gmail.com',
        companyEmail: wb.companyEmail || 'support@atlaslogistics.site',
    };
}
