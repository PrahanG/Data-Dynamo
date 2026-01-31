
export interface RegisteredRetailer {
    id: string;
    name: string;
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    placeId: string;
}

export const REGISTERED_RETAILERS: RegisteredRetailer[] = [
    {
        id: "store_1",
        name: "Stop 1: Hitech City (Mindspace)",
        address: "Mindspace IT Park, Hitech City, Hyderabad, Telangana 500081",
        coordinates: { lat: 17.4455, lng: 78.3751 },
        placeId: "hitech-city-hyd",
    },
    {
        id: "store_2",
        name: "Stop 2: Banjara Hills (GVK One)",
        address: "GVK One Mall, Rd Number 1, Banjara Hills, Hyderabad, Telangana 500034",
        coordinates: { lat: 17.4126, lng: 78.4390 },
        placeId: "banjara-hills-hyd",
    },
    {
        id: "store_3",
        name: "Stop 3: Uppal (Metro Station)",
        address: "Uppal Metro Station, Uppal, Hyderabad, Telangana 500039",
        coordinates: { lat: 17.4018, lng: 78.5602 },
        placeId: "uppal-hyd",
    },
    {
        id: "store_4",
        name: "Stop 4: Secunderabad (Station)",
        address: "Secunderabad Railway Station, Hyderabad, Telangana 500003",
        coordinates: { lat: 17.4399, lng: 78.4983 },
        placeId: "secunderabad-hyd",
    },
    {
        id: "store_5",
        name: "IKEA Hyderabad",
        address: "Raidurg, Hyderabad, Telangana 500032",
        coordinates: { lat: 17.4375, lng: 78.3717 },
        placeId: "ikea-hyd"
    },
    {
        id: "store_6",
        name: "Inorbit Mall",
        address: "Inorbit Mall Road, Madhapur, Hyderabad, Telangana 500081",
        coordinates: { lat: 17.4346, lng: 78.3867 },
        placeId: "inorbit-hyd"
    },
    {
        id: "store_7",
        name: "Charminar Market",
        address: "Charminar Rd, Char Kaman, Ghansi Bazaar, Hyderabad, Telangana 500002",
        coordinates: { lat: 17.3616, lng: 78.4747 },
        placeId: "charminar-hyd"
    },
    {
        id: "store_8",
        name: "Golconda Fort Area",
        address: "Ibrahim Bagh, Hyderabad, Telangana 500008",
        coordinates: { lat: 17.3833, lng: 78.4011 },
        placeId: "golconda-hyd"
    },
    {
        id: "store_9",
        name: "Begumpet Airport",
        address: "Begumpet, Hyderabad, Telangana 500016",
        coordinates: { lat: 17.4531, lng: 78.4676 },
        placeId: "begumpet-hyd"
    },
    {
        id: "store_10",
        name: "Jubilee Hills Check Post",
        address: "Rd Number 36, Jubilee Hills, Hyderabad, Telangana 500033",
        coordinates: { lat: 17.4278, lng: 78.4111 },
        placeId: "jubilee-checkpost-hyd"
    }
];
