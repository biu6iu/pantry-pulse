export class donationItem {
    id: string;
    itemName: string;
    category: string;
    desc: string;

    constructor(id: string, itemName: string, category: string, desc: string) {
        this.id = id;
        this.itemName = itemName;
        this.category = category;
        this.desc = desc;
    }
}