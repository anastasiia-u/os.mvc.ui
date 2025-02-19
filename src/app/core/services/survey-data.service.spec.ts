import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SurveyDataService } from './survey-data.service';

describe('SurveyDataService', () => {
  let service: SurveyDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SurveyDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
