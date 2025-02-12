import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SurveySection } from '@app/core/models/survey-section.model';
import { SurveyDataService } from '@app/core/services/survey-data.service';

export interface SurveyNavbar {
  id: number;
  name: string;
  icon: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-survey-navbar',
  templateUrl: './survey-navbar.component.html',
  styleUrls: ['./survey-navbar.component.scss']
})
export class SurveyNavbarComponent implements OnInit {

  @Input()
  sections: SurveySection[] = [];

  constructor(
    private router: Router,
    private dataService: SurveyDataService) {
    this.dataService.surveySections$.subscribe(sections => {
      this.sections = sections.filter(x => x.isVisible);
      if (this.sections.length > 0) {
        this.sections[0].isActive = true;
      }

    });
  }

  ngOnInit(): void {
    window.addEventListener("scroll", () => {
      this.checkNavigationMenuActive();
    });
  }

  setMenuItem(menu: SurveySection) {

    this.sections.forEach(x => x.isActive = false);

    menu.isActive = true;
  }

  checkNavigationMenuActive() {
    // remove the fragment from url
    this.router.navigate([]);

    //set max height to menu side
    const mainSections = document.querySelectorAll(".main_section");

    const mainNavLinks = document.querySelectorAll(".survey-navbar-menu ul li a");
    const fromTop = window.scrollY;

    const sectionHeightList: number[] = [];
    mainNavLinks.forEach((link, idx) => {
      mainSections[idx].setAttribute("style", "padding-bottom:0px;");
      let sectionHeight = document.getElementById(mainSections[idx].getAttribute('id') ?? '')?.offsetHeight ?? 0;

      // if the last item height is lower than screen,
      // add bottom margin to active last side menu option
      if (mainNavLinks.length > 1 && idx == mainNavLinks.length - 1 && window.outerHeight > sectionHeight) {
        const paddingBottomValue = window.outerHeight - sectionHeight;
        mainSections[idx].setAttribute("style", "padding-bottom:" + paddingBottomValue + "px;");
        sectionHeight = document.getElementById(mainSections[idx].getAttribute('id') ?? '')?.offsetHeight ?? 0;
      }

      sectionHeightList.push(sectionHeight);

      // Defaults for the first position
      let sectionStartsAt = 0;
      let sectionEndsAt = sectionHeight;

      // calculate the start
      if (idx > 0) {
        for (let i = 0; i < idx; i++) {
          sectionStartsAt += sectionHeightList[i];
        }
        sectionEndsAt = sectionStartsAt + sectionHeight;
      }

      // check the range and add/remove specific class

      const activeElem = link.querySelector('.menu-item');

      if (fromTop >= sectionStartsAt && fromTop <= sectionEndsAt) {
        activeElem?.classList.add("active");
      }
      else {
        activeElem?.classList.remove("active");
      }

    });
  }
}
