export abstract class Impact { 
    id: string;
    score: number;

    constructor(id: string, score: number) {
        this.id = id;
        this.score = score;
    }
}