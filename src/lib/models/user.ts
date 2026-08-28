export class User{
    id: string;
    organisation: string;
    contactName: string | null;
    email: string;
    street: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    phone: string | null;

    constructor(
        id: string,
        organisation: string,
        contactName: string | null,
        email: string,
        street: string | null = null,
        city: string | null = null,
        state: string | null,
        zip: string | null = null,
        country: string | null = null,
        phone: string | null = null
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
    }
}