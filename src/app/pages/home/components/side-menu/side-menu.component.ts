import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { MenuNode } from "src/app/core/models/menu-node.model";
import { MenuService } from 'src/app/core/services/menu.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {
  @Output() public onSelected = new EventEmitter<void>();

  nestedDataSource = new MatTreeNestedDataSource<MenuNode>();
  nestedTreeControl = new NestedTreeControl<MenuNode>(node => node.subMenus);

  private readonly homeItem: MenuNode = { title: 'Home', url: '', imgSrc: '/assets/icons/home.svg' };

  constructor(
    private menuService: MenuService,
    private router: Router
  ) { }

  ngOnInit() {
    this.nestedDataSource.data = [this.homeItem, ...this.menuService.menu];
    this.nestedTreeControl.dataNodes = this.nestedDataSource.data;
    this.nestedTreeControl.expandAll();
  }

  menuNavigation(menuNode: MenuNode) {
    window.location.href = window.location.origin + "/" + menuNode.url;

    this.onSelected.emit();
  }

  isRouteActive(nodeUrl: string) {
    return (window.location.pathname.includes(nodeUrl) && nodeUrl !== this.homeItem.url)
      || (this.router.url === this.homeItem.url && nodeUrl === this.homeItem.url);
  }

  hasSubmenu(index: number, node: MenuNode) {
    if (node?.subMenus?.length !== undefined) {
      return node?.subMenus?.length > 0;
    }
    return false;
  }
}
