export class User{
    id: string;
    organisation: string;
    contactName: string | null;
    email: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    phone: string | null;
    lat: number | null;
    lng: number | null;
    type: string | null; // e.g. "wildlife_rescue"

    constructor(
        id: string,
        organisation: string,
        contactName: string | null,
        email: string | null,
        street: string | null = null,
        city: string | null = null,
        state: string | null,
        zip: string | null = null,
        country: string | null = null,
        phone: string | null = null,
        lat: number | null = null,
        lng: number | null = null,
        type: string | null = null
    ) {
        this.id = id;
        this.organisation = organisation;
        this.contactName = contactName;
        this.email = email;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.country = country;
        this.phone = phone;
        this.lat = lat;
        this.lng = lng;
        this.type = type;
    }
}