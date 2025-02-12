export class PaginationModel<T> {
    count: number;
    data: T[];

    constructor(count = 0, data: T[] = []) {
        this.count = count;
        this.data = data;
    }
}