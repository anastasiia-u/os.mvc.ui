import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MenuNode } from 'src/app/core/models/menu-node.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private menuData: MenuNode[];

  constructor(private httpClient: HttpClient) { }

  async loadMenu() {

    if (!environment.isSaasIntegrated) {
      return new Promise((resolve) => {

        // hardcode permissions for not isSaasIntegrated services
        const noneSaasMenu = [
          {
            "title": "Services",
            "subMenus": [
              {
                "title": "Syndicated Primary Research",
                "subMenus": [],
                "url": "mvp",
                "imgSrc": "/assets/icons/users-icon.svg"
              }
            ],
            "url": "",
            "imgSrc": ""
          },
          {
            "title": "User management",
            "subMenus": [
              {
                "title": "Users",
                "subMenus": [],
                "url": "users",
                "imgSrc": "/assets/icons/users-icon.svg"
              },
              {
                "title": "Groups",
                "subMenus": [],
                "url": "groups",
                "imgSrc": "/assets/icons/groups-icon.svg"
              }
            ],
            "url": "",
            "imgSrc": ""
          }
        ];

        this.menuData = noneSaasMenu;
        resolve(true);
      });
    }

    const data = await firstValueFrom(this.httpClient.get<MenuNode[]>('/api/menu'));
    this.menuData = data;
    return data;
  }

  get menu() {
    return this.menuData;
  }

}
