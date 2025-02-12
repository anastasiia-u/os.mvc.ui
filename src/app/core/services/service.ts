import { HttpHeaders } from '@angular/common/http';
import { PaginationModel } from '../models/pagination.model';

export class Service {
    controllerName: string | undefined;

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    public getPaginationModel<T>(model: new () => T, response: any): PaginationModel<T> {
        return new PaginationModel<T>(response.count, response.data);
    }
}