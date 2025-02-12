export interface MenuNode {
  title: string;
  subMenus?: MenuNode[];
  url: string;
  imgSrc?: string;
}
